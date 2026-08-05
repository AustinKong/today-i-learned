---
title: Shared Mutation
category: Programming Languages
---

## Aliasing

*Aliasing* describes a situation in which a data location in memory can be accessed through different symbolic names in a program.

For example:

```python
a = {"count": 1}
b = a  # b as an alias of a

b["count"] = 2
print(a["count"])  # 2
```

## Value Semantics vs Reference Semantics

*Value semantics* and *reference semantics* describe the external behavior of assignment, passing, and mutation. They concern what a value's user observes, not necessarily how the value is implemented internally.

With value semantics, assignment behaves as if it creates an independent value. Java primitives behave this way:

```java
int a = 1;
int b = a;

b = 2;

System.out.println(a); // 1
System.out.println(b); // 2
```

With reference semantics, assignment copies access to the same underlying object. Java objects behave this way:

```java
class Counter {
    int count;

    Counter(int count) {
        this.count = count;
    }
}

Counter a = new Counter(1);
Counter b = a;

b.count = 2;

System.out.println(a.count); // 2
System.out.println(b.count); // 2
```

> Value semantics versus reference semantics describes what callers observe, not necessarily how a value is implemented. The underlying implementation could still use pointers or references while presenting value semantics to callers.

## The Problem, and the Solution Families

The root problem is that aliasing and mutation can cause surprising side effects. There are three broad solution families:

1. Copying: Copying doesn't forbid mutation. Instead, it gives you a way to mutate a different object; when mutating a shared reference would be dangerous, make an independent copy first.
2. Immutability and versioning: Immutability forbids mutation of existing data altogether. If you need to make a change, create a new value or version.
3. Ownership and borrowing: Ownership and borrowing control who is allowed to access or mutate data. Mutation is allowed, but only when access rules prove it is safe.

Different languages emphasize different families:

1. Copying: Common in C-style and imperative languages, where programmers often choose when to copy.
2. Immutability and versioning: Common in functional programming languages.
3. Ownership and borrowing: Central to Rust.

## Copying

This section describes ways to implement copying. Copying doesn't promise value semantics or reference semantics.

### Assignment by Reference

*Assignment by reference* copies only the reference, pointer, or handle to the object.

This is the simplest way to produce reference semantics. It is cheap, but mutation through one reference affects the other.

### Shallow Copy

A *shallow copy* copies the outer object or container, but not necessarily the nested objects inside it.

```python
a = [[1], [2]]
b = a.copy()
b[0].append(99)

print(a)  # [[1, 99], [2]]
print(b)  # [[1, 99], [2]]
```

Notice that `b[0]` is still a reference to `a[0]`.

Shallow copy is somewhere between reference assignment and deep copy. It gives value-like behavior only for the copied outer layer.

### Deep Copy

A *deep copy* recursively copies the whole reachable object graph. After a deep copy, mutation of the copy shouldn't affect the original.

```python
import copy

a = [[1], [2]]
b = copy.deepcopy(a)
b[0].append(99)

print(a)  # [[1], [2]]
print(b)  # [[1, 99], [2]]
```

Deep copy can provide value-like independence because the copied object graph no longer shares mutable nested objects with the original.

### Lazy Copy

The following diagram shows how lazy copying shares data until a mutation requires a private copy:

![Lazy copy sharing data until mutation](./assets/lazy-copy.excalidraw)

*Lazy copy* delays copying until the copy is actually needed. The most common form is *copy-on-write*.

Lazy copy can provide value-like behavior while sharing references under the hood until a copy is actually needed.

## Copy-on-Write

Copy-on-write is a lazy-copying technique.

Instead of copying data immediately, multiple values initially share the same underlying storage. The copy is created only when one value tries to mutate the shared data.

Python's normal lists and dictionaries don't behave this way, but the idea can be modeled with a custom implementation:

```python
class CopyOnWriteList:
    def __init__(self, data):
        self._data = data
        self._shared = False
    
    def clone(self):
        other = CopyOnWriteList(self._data)
        self._shared = True
        other._shared = True
        return other
    
    def append(self, value):
        if self._shared:
            self._data = self._data.copy()
            self._shared = False
        self._data.append(value)
    
    def values(self):
        return self._data

a = CopyOnWriteList([1, 2, 3])
b = a.clone()  # Initially, both CopyOnWriteLists share one data array

b.append(4)  # Copy-on-write, two data arrays exist now

print(a.values())  # [1, 2, 3]
print(b.values())  # [1, 2, 3, 4]
```

### Copy-on-Write in Programming Languages

Some programming languages and libraries use copy-on-write to provide value-like behavior without eagerly copying large data structures.

Swift is a common example. Swift arrays have value semantics:

```swift
var a = [1, 2, 3]
var b = a

b.append(4)

print(a) // [1, 2, 3]
print(b) // [1, 2, 3, 4]
```

### Copy-on-Write in Fork

`fork()` is a system call that creates a child process that begins as a near-copy of the parent process. The child is a separate process with its own process identity and virtual address space.

Naively, `fork()` could copy all of the parent process's memory immediately. That would be wasteful, especially when the child soon calls another program and replaces its address space.

Modern Unix-like operating systems avoid this by using copy-on-write memory pages. Parent and child initially map to the same physical memory pages. If either process writes to a shared page, the operating system copies that page so the write becomes private to that process.

## Immutability and Versioning

*Immutability* forbids an object from being modified after creation. For example, tuples in Python are immutable.

An immutable object can have either value semantics or reference semantics. Immutability alone doesn't determine the semantics.

### Persistent Data Structures

A *persistent data structure* always preserves its previous version when modified. Such data structures are effectively immutable because their operations don't visibly update the structure in place; instead, they yield a new updated structure.

### Ephemeral vs Persistent Data Structures

An ephemeral data structure has one current version. Updates modify that version in place.

A persistent data structure preserves previous versions. Updates return new versions instead of destroying old ones.

So:

- An ephemeral data structure updates the current structure.
- A persistent data structure creates a new structure while the old one remains available.

## Structural Sharing

*Structural sharing* is an optimization technique where multiple values or versions reuse unchanged parts instead of copying everything.

This usually appears with immutability or persistent data structures. If every update to an immutable data structure required a full deep copy, immutable updates would be very expensive. Structural sharing makes immutable or versioned data cheaper by sharing the parts that didn't change.

The following diagram shows structural sharing in a binary tree:

![Structural sharing in a binary tree](./assets/structural-sharing.excalidraw)

Structural sharing can also appear outside classic persistent data structures. For example, TanStack Query uses structural sharing as a UI optimization. When fresh JSON data arrives, parsing would normally create a new object graph. React Query tries to preserve references to unchanged parts, so components depending on unchanged data don't see unnecessary reference changes. See [TanStack Query's structural-sharing documentation](https://tanstack.com/query/v5/docs/framework/react/guides/render-optimizations).

> Copy-on-write and structural sharing are related but answer different questions. Copy-on-write asks, "When should we copy?" Structural sharing asks, "What should remain shared?" They can overlap, but not always.

## Ownership and Borrowing

Instead of always copying data or forbidding mutation, the system controls who is allowed to access or mutate data.

### Ownership

*Ownership* means that a variable or scope is responsible for a value or resource.

If ownership is transferred, the old owner may no longer be allowed to use the value. This avoids unnecessary copying because the value itself doesn't need to be duplicated. Instead, control over the value moves from one owner to another.

### Borrowing

*Borrowing* means temporarily accessing a value without taking ownership of it.

In Rust-style borrowing, the usual rule is: many shared read-only borrows, or one exclusive mutable borrow, but not both at the same time.
