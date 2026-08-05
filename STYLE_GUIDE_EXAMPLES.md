# Style Guide Examples and Edge Cases

This file contains extended examples and edge cases for `STYLE_GUIDE.md`.

It is a reference document, not a required part of every agent prompt.

## Technical Explanation

```md
Consistent prefix reads ensure that when writes occur in a particular order,
readers do not observe a later write without also observing the earlier writes
on which it depends.

In other words, users should not observe effects before causes.

For example, suppose the writes occur in the order `W1 → W2 → W3`. A reader
may observe only a prefix of that order. Valid prefixes include `[]`, `[W1]`,
`[W1, W2]`, and `[W1, W2, W3]`. Invalid reads include `[W2]`, `[W1, W3]`,
and `[W3]`.

In the preceding example, the invalid read `["fine thank you!"]` appears
momentarily before being corrected to the valid prefix
`["how are you?", "fine thank you!"]`. This behavior violates causality:
"How are you?" causes "Fine, thank you!" Showing the effect without the cause
therefore violates causality.
```

## Mathematics and Implementation

```md
Binary lifting preprocesses a rooted tree so that ancestor queries can be
answered in $O(\log n)$ time.

The canonical query asks for the $k$-th ancestor of node $u$. The same
precomputation is commonly used to find the lowest common ancestor (LCA) of
two nodes.

## Building the Jump Table

Let $\operatorname{up}(u,j)$ denote the $2^j$-th ancestor of node $u$. Every
later table entry follows from two half-sized jumps:

$$
\operatorname{up}(u,j)
=
\operatorname{up}\left(\operatorname{up}(u,j-1),j-1\right)
$$

The implementation represents this recurrence with `up[u][j]`.

> Use a sentinel such as `-1` for a nonexistent ancestor. The recurrence must
> not index through the sentinel.

```python
mid = up[u][j - 1]
if mid != -1:
    up[u][j] = up[mid][j - 1]
```

The guard prevents the implementation from indexing through the sentinel.

## Bold

Correct:

```md
A reader may observe only **a prefix of the established write order**.
```

Incorrect:

```md
**A reader may observe only a prefix of the established write order.**
```

Incorrect:

```md
- **Valid Prefix:** `[W1, W2]`
```

Better:

```md
Valid prefixes include:

- `[W1]`
- `[W1, W2]`
- `[W1, W2, W3]`
```

## Italics

The heading does not introduce the term, so italicize a central concept when defining it in the body text:

```md
## Idempotence

*Idempotence* is the property that repeating an operation has no additional effect. Idempotence is useful when a request may be retried.
```

Do not italicize later occurrences unless another rule requires emphasis.

Do not italicize a technical term that appears only as an incidental example or application:

```md
Binary lifting is also commonly used to find the lowest common ancestor (LCA) of two nodes.
```

Italicize a term when the note explains it as a central concept:

```md
The *pigeonhole principle* explains why a finite hash space must contain collisions when the input space is larger.
```

## Lists

Complete sentences:

```md
- The first column stores each node's parent.
- Every later column combines two smaller jumps.
- A missing ancestor is represented by `-1`.
```

Fragments:

```md
- Parent pointers
- Power-of-two jumps
- Lowest common ancestor queries
```

Incorrect mixed list:

```md
- Stores each node's parent.
- Power-of-two jumps
- The query runs in logarithmic time.
```

## Blockquotes

Supplementary resource:

```md
> For an animated explanation, see
> [Binary Lifting and Ancestor Queries](https://example.com).
```

Supplementary caveat:

```md
> A quorum overlap does not, on its own, guarantee strong consistency.
```

Do not move a central rule into a blockquote:

```md
> Every write must be durably recorded before acknowledgment.
```

The central rule belongs in the main narrative.

## User Interfaces

Correct:

```md
Select **Save**.

Go to **Settings** > **General**.
```

Incorrect:

```md
Select `Save`.

Go to `Settings > General`.
```

## Colons

Lowercase continuation:

```md
The result has one implication: the cache must be cleared.
```

Capitalized multiple sentences:

```md
The result is clear: The cache must be cleared. The service must then restart.
```

Incorrect interruption:

```md
The valid prefixes are:
```

Better:

```md
Valid prefixes include:
```

## Parentheses

Parenthetical within a sentence:

```md
The query returns `-1` when no ancestor exists (including above the root).
```

Entire sentence parenthetical:

```md
(The empty prefix is valid.)
```

## Tables

```md
The following table compares the operations:

| Operation | Time | Space |
| --- | --- | --- |
| Lookup | $O(\log n)$ | $O(1)$ |
| Update | $O(\log n)$ | $O(n)$ |

Lookup and update have the same asymptotic time cost, but updates require
additional storage.
```

## Images and Diagrams

```md
The following diagram shows how each table column doubles the jump distance:

![Binary lifting jump table showing power-of-two ancestors](path/to/binary-lifting.excalidraw)

Each entry in column $j$ combines two jumps from column $j - 1$.
```

## Canonical Links

Prefer:

```md
Vector clocks define the underlying partial-order relation. See
[Vector Clocks](path/to/vector-clocks) for the canonical explanation.

This note focuses on how version vectors apply that relation to replicated
objects and conflict detection.
```

Avoid repeating the full vector-clock explanation in every related note.
