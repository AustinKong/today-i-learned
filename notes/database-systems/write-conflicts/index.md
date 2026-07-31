---
title: Write Conflicts
category: Database Systems
---

A write conflict occurs when multiple actors update the same logical data without first coordinating with one another.

This note discusses strategies to resolve write conflicts in distributed systems.

## Conflict Avoidance

The simplest conflict is one that never occurs.

Conflict avoidance arranges writes so that conflicting operations cannot be accepted independently.

A common conflict-avoidance strategy is single-leader replication: all writes for a partition are routed through one leader, which establishes a single order before changes are replicated to followers.

Conflict avoidance is often preferable when its availability and latency costs are acceptable. It is not always possible in highly available, multi-writer, peer-to-peer, or offline-first systems.

## Last-Write-Wins

A last-write-wins register associates each value with an ordering value, commonly a timestamp. The value with the greatest timestamp wins.

LWW is simple and ensures that replicas can make the same deterministic choice. However, it does not truly merge concurrent information. One write is retained and the others are discarded, even if the information could've/should've been merged.

Consequently, LWW implies data loss.

### Physical-Clock Problems

<!-- TODO: Expand this -->

Using physical timestamps assumes that clocks are sufficiently synchronized. Because of clock skew, timestamps are not entirely reliable.

Client-provided timestamps introduce an additional trust problem. A buggy or malicious client could submit an extremely large timestamp and cause its value to dominate future writes.

Using a server-receipt timestamp avoids trusting a client clock, but it introduces different semantics: the winner is determined by when a particular server received the write, not necessarily when the user created it. Different replicas may also initially receive the operations in different orders.

## Application-Defined Merging

Some databases and replication systems allow applications to provide custom conflict-resolution logic.

For example, Couchbase Sync Gateway supports custom conflict resolvers written in JavaScript. When conflicting document revisions are synchronized, the resolver can inspect the local and remote versions and return a winning or merged document.

Depending on the system, custom resolution may run:

- On synchronization: when concurrent versions meet.
- On read: when multiple sibling versions are returned.
- Asynchronously: during reconciliation or repair.

Manual conflict-resolution code should be minimized where possible, there are far too many edge cases to handle. [See this](https://youtu.be/DEcwa68f-jY?si=ZQeotVLEiZ995f63&t=696).

## Preserving Siblings

Instead of immediately discarding one concurrent value, a system can retain both versions as siblings.

On a later read, it returns both versions to the application. The application merges them automatically, or presents the options for users to resolve conflicts.

Sibling preservation avoids immediate data loss, but pushes complexity to readers and application developers.

## Operational Transformation

Operational Transformation is a family of algorithms primarily associated with collaborative editing.

Instead of exchanging complete document values, an OT system represents edits as operations, such as:

```text
insert(position=0, text="x")
delete(position=2, length=1)
```

When concurrent operations were created against the same earlier document state, applying one may invalidate the coordinates used by the other. OT transforms an operation (hence, the name operational transformation) to account for the effects of the operations applied before it.

### Example

Two users begin with:

```text
abc
```

They concurrently create:

```text
O1 = insert(0, "x")
O2 = delete(2)  # Intention is to delete "c"
```

If we attempt to apply operations as is:

```text
O1 → O2: abc → xabc → xac  # delete(2)'s intention is lost
O2 → O1: abc → ab → xab  # Both O1 and O2 applied correctly
```

In an OT model, we first transform `O2` against `O1`:

```text
O2  = delete(2)
O2' = transform(O2, O1) = delete(3)

O1 → O2': abc → xabc → xab  # delete(2)'s intention is preserved by transforming it to delete(3)
```

The operation is rewritten so that its intended target still makes sense after the concurrent insertion.

### OT as a Family of Algorithms

OT is not a single algorithm, but a family of algorithms. A particular OT implementation must define:

- Its operation model
- How every relevant pair of operations is transformed
- How concurrent insertions at the same location are ordered
- etc.

For a text editor, transformation functions may be required for:

```text
insert vs. insert
insert vs. delete
delete vs. insert
delete vs. delete
```

A spreadsheet, tree-structured document, drawing canvas, or rich-text editor requires a different operation model and different transformation rules.

### OT Drawbacks

OT algorithms are extremely difficult to implement, developers must write transformation rules for every possible combination of operations. It is also prone to edge cases, and is very difficult to prove its correctness.

> Relating to correctness proofs, many academic OT algorithms that were thought to be correct were later proven to cause divergence under edge cases. [See this](https://youtu.be/B5NULPSiOGw?si=ZsT91IcrRJugoblj&t=732).

Another drawback is its reliance on a centralized server. While peer-to-peer OT systems do exist, they are even more difficult to implement.

Thus, many practical OT systems rely on a central server (a star topology,) which brings about related drawbacks (single point of failure, scalability bottlnecks etc.)

## Conflict-Free Replicated Data Types

A conflict-free replicated data type, is a replicated data type whose update and merge rules are designed so that replicas can be updated independently and later converge deterministically.

CRDTs provide the following features:

- The application can update any replica independently, concurrently and without coordinating with other replicas.
- An algorithm (itself part of the data type) automatically resolves any inconsistencies that might occur.
- Although replicas may have different state at any particular point in time, they are guaranteed to eventually converge.

A CRDT normally aims to provide strong eventual consistency.

### State-Based CRDTs

State-based CRDTs (or, convergent replicated data types, CvRDTs) maintain state at each replica and merge states received from other replicas. They require:

1. Local state
2. Function to produce an initial state
3. Function to update the local state
4. Function to merge two states

The merge function must be:

- Commutative: `merge(a, b) = merge(b, a)`
- Associative: `merge(a, merge(b, c)) = merge(merge(a, b), c)`
- Idempotent: `merge(a, a) = a`

These properties make state merging insensitive to message order, grouping, and duplication.

Consequently, state-based CRDTs can operate over relatively weak communication channels. Messages may be delayed, reordered, or duplicated.

#### Delta-State CRDTs

Delta-state CRDTs are optimized state-based CRDTs where only recently applied changes to a state (deltas) are disseminated instead of the entire state.

The receiver merges the delta using the same join operation used for ordinary state. Delta-state CRDTs retain the idempotent merge behavior of state-based CRDTs while reducing message size.

> This is different from operation-based CRDTs (next section) in the sense that deltas describe a small piece of mergeable state, while operations describe the instruction.

### Operation-Based CRDTs

In operation-based CRDTs (or commutative replicated data types, CmRDTs,) a replica broadcasts operations such as instead of state.

The application of operations should still be commutative and associative. However, instead of requiring that application of operations is idempotent, stronger assumptions on the communications infrastructure are expected: all operations must be delivered to the other replicas without duplication, and must be causally ordered.

> In theory state-based and operation-based CRDTs are equivalent (they can emulate each other.) In practice, state-based CRDTs are easier to implement but transmitting full state is more expensive; operation-based CRDTs are lightweight to trasmit but requires stricter guarantees from communication middleware.

#### Counterexamples

Without exactly-once delivery, deduplication or an idempotent representation (violation of non-duplication requirement):

1. The state of replica A and B are both 0
2. Replica A broadcasts `increment(1)`
3. Replica B receives the operation twice and applies it
4. The state of replica A is 1, replica B is 2. Divergence.

With dropped operations (no retry or recovery system), the opposite case happens:

1. The state of replica A and B are both 0
2. Replica A broadcasts `increment(1)`
3. The operation is dropped, replica B doesn't receive anything
4. The state of replica A is 1, replica B is 0. Divergence.

Without causal ordering:

1. The state of replica A and B are both `{}` (empty set)
2. Replica A broadcasts `add("foo")`, then broadcasts `remove("foo")`
3. Replica B receives them in non-causally ordered manner: `remove("foo")` then `add("foo")`
4. The state of replica A is `{}`, replica B is `{"foo"}` (because removal of a non-existent element is a no-op)

### Common CRDTs

#### G-Counter

A grow-only counter (G-Counter) supports increments but not decrements.

A state-based G-Counter stores one non-decreasing component per replica:

```text
{
  A: 3,
  B: 5,
  C: 2
}
```

The counter's value is the sum:

```text
3 + 5 + 2 = 10
```

Replica A increments only its own component:

```text
A: 3 → 4
```

Two states are merged by taking the component-wise maximum:

```text
merge(
  {A: 4, B: 2},
  {A: 3, B: 5}
)
=
  {A: 4, B: 5}
```

#### PN-Counter

A positive-negative counter (PN-Counter) supports increments and decrements.

It combines two G-Counters:

```text
P = increments
N = decrements
```

Its value is:

```text
sum(P) - sum(N)
```

For example:

```text
P = {A: 5, B: 2}
N = {A: 1, B: 3}

value = 7 - 4 = 3
```

Because both internal counters only grow, they can be merged using component-wise maxima.

#### G-Set

A grow-only set (G-Set) supports additions but no removals.

State:

```text
{"book", "pen"}
```

Merge (set-union):

```text
merge(
  {"book", "pen"},
  {"pen", "apple"}
) = 
  {"book", "pen", "apple"}
```

#### 2P-Set

A two-phase set (2-P set) maintains two grow-only sets:

```text
A = added elements
R = removed elements
```

An element is present when:

```text
element ∈ A and element ∉ R
```

Removing an element adds it to `R`. Because `R` never shrinks, a removed element cannot be added again using the same element identity.

Example:

```text
add("foo")
remove("foo")
add("foo")   # does not restore it
```

The remove set is sometimes called a tombstone set and can grow indefinitely.

#### LWW-Element-Set

An LWW-Element-Set records the most recent add and remove timestamp for each element.

For example, for an element `x`:

```text
add_timestamp[x] = 20
remove_timestamp[x] = 15
```

Because the latest add is newer, `x` is present.

Conversely, if:

```text
add_timestamp[x] = 20
remove_timestamp[x] = 25
```

then `x` is absent.

When timestamps are equal, the data type must define a bias:

- Add-wins on ties; or
- Remove-wins on ties.

Unlike a 2P-Set, an element can be re-added after removal if the later add has a greater timestamp.

The usual LWW limitations still apply: clock skew or arbitrary logical ordering may cause a legitimate operation to be discarded.

#### OR-Set

An observed-remove set (OR-Set) associates each addition with a unique tag.

For example:

1. The original state for both replica A and B is `{("foo", tag=1)}`
2. Replica A does `add("foo", tag=2)`
3. Concurrently, replica B does `remove("foo", tag=1)`
4. After convergence, the final state becomes `{("foo", tag=2)}`

Notice that element "foo" still exists in the set despite replica B removing it, even if the removal chronologically comes after. This is because replica B can only remove elements it has "observed" (tag 1.)

> This gives an OR-Set add-wins semantics for concurrent add versus remove.

#### Conversion of Set CRDTs to Map CRDTs

A LWW element set can trivially be extended to become a LWW element map, by storing a tuple of `(value, timestamp)`:

```text
theme: ("dark", timestamp=20)
```

However, other set CRDTs cannot easily be converted into maps. This is because a set only answers "is this element present?", whereas a map needs to answer two questions: "is this key present?" and "what value is associated with this key?" Those require additional conflict semantics.

For example, a G-set can be converted to a G-set of key-value pairs:

```text
{
  ("key", "value 1"),
  ("key", "value 2")
}
```

But this is not an ordinary map. It permits multiple pairs with the same key.

Therefore, converting a set into a map is not merely a mechanical replacement of elements with key-value pairs. The design must specify additional semantics.

LWW makes this choice easy to express because all competing events can be totally ordered.

#### Sequence CRDTs

A sequence CRDT is a specialized CRDT designed for ordered collections, such as strings of text or arrays.

Set union is commutative. Array insertion by numerical index is not. Thus, sequence CRDT design is difficult and an area for research still.

Sequence CRDTs and OT address overlapping collaborative-editing problems but use different models:

- OT transforms operations against concurrent operations.
- Sequence CRDTs design operations and identifiers so concurrent updates can be merged deterministically.
