---
title: Shared Mutation
category: Programming Languages
---

## Aliasing

Aliasing describes a situation in which a data location in memory can be accessed through different symbolic names in the program

For example:

```python
a = {"count": 1}
b = a  # b as an alias of a

b["count"] = 2
print(a["count"])  # 2
```

## Value Semantics vs Reference Semantics

Value semantics and reference semantics describe the external behavior of assignment, passing, and mutation. They are about what the user of the value observes, not necessarily how the value is implemented internally.

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

> Value semantics vs reference semantics is not a problem of the implementation, but of what it appears to callers to be. The underlying implementation could still use pointers/references, but appears to be value semantics to callers. We will see this in following sections.

## The Problem, and the Solution Families

The root problem is that aliasing and mutation can cause surprising side effects. There are a few broad solution families to this problem:

1. Copying: Copying does not forbid mutation. Instead, it gives you a way to mutate a different object; in cases where mutating a shared reference would be dangerous, you are expected to make an independent copy first yourself.
2. Immutability and versioning: Immutability forbids mutation of existing data altogether. If you need to make a change, create a new value or version.
3. Ownership and borrowing: Ownership and borrowing control who is allowed to access or mutate data. Mutation is allowed, but only when access rules prove it is safe.

Different languages emphasize different families:

1. Copying: common in C-style and imperative languages, where programmers often choose when to copy.
2. Immutability and versioning: common in functional programming languages.
3. Ownership and borrowing: central to Rust.

## Copying

This section describes implementations to copy operations. Copying does not promise value semantics nor reference semantics.

### Assignment by Reference

Assignment by reference copies only the reference, pointer, or handle to the object.

This is the simplest way to produce reference semantics. It is cheap, but mutation through one reference affects the other.

### Shallow Copy

A shallow copy copies the outer object or container, but not necessarily the nested objects inside it.

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

A deep copy recursively copies the whole reachable object graph. After a deep copy, mutation of the copy should not affect the original.

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

![Lazy Copy](./assets/lazy-copy.excalidraw)

Lazy copy delays copying until the copy is actually needed. The most common form is copy-on-write.

Lazy copy can provide value-like behavior while sharing references under the hood until a copy is actually needed.

## Copy-on-Write

Copy-on-write is a lazy-copying technique.

Instead of copying data immediately, multiple values initially share the same underlying storage. The copy is created only when one value tries to mutate the shared data.

Python’s normal lists and dictionaries do not behave this way, but we can model the idea with a custom implementation:

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

Naively, `fork()` could copy all of the parent process’s memory immediately. That would be wasteful, especially when the child soon calls another program and replaces its address space.

Modern Unix-like operating systems avoid this by using copy-on-write memory pages. Parent and child initially map to the same physical memory pages. If either process writes to a shared page, the operating system copies that page so the write becomes private to that process.

## Immutability and Versioning

Immutability forbids an object from being modified after creation. For example, tuples in Python are immutable.

An immutable object can have either value semantics or reference semantics. Immutability alone does not determine the semantics.

### Persistent Data Structures

A persistent data structure is a data structure that always preserves the previous version of itself when it is modified. Such data structures are effectively immutable, as their operations do not (visibly) update the structure in-place, but instead always yield a new updated structure.

### Ephemeral vs Persistent Data Structures

An ephemeral data structure has one current version. Updates modify that version in place.

A persistent data structure preserves previous versions. Updates return new versions instead of destroying old ones.

So:

- Ephemeral data structure: update changes the current structure.
- Persistent data structure: update creates a new structure while the old one remains available.

## Structural Sharing

Structural sharing is an optimization technique where multiple values or versions reuse unchanged parts instead of copying everything.

This usually shows up together with immutability or persistent data structures. If every update to an immutable data structure required a full deep copy, immutable updates would be very expensive. Structural sharing makes immutable/versioned data cheaper by sharing the parts that did not change.

Consider this example of structural sharing in the context of a binary-tree:

![Structural Sharing](./assets/structural-sharing.excalidraw)

Structural sharing can also appear outside classic persistent data structures. For example, TanStack Query uses structural sharing as a UI optimization. When fresh JSON data arrives, parsing would normally create a new object graph. React Query tries to preserve references to unchanged parts, so components depending on unchanged data do not see unnecessary reference changes. [Source](https://tanstack.com/query/v5/docs/framework/react/guides/render-optimizations)

> Copy-on-write and structural sharing are related but answer different questions. Copy-on-write answers: "When should we copy?"; structural sharing answers "what should remain shared?" They can overlap, but not always.

## Ownership and Borrowing

Instead of always copying data or forbidding mutation, the system controls who is allowed to access or mutate data.

### Ownership

Ownership means some variable or scope is responsible for a value or resource.

If ownership is transferred, the old owner may no longer be allowed to use the value. This avoids unnecessary copying because the value itself does not need to be duplicated. Instead, control over the value moves from one owner to another.

### Borrowing

Borrowing means temporarily accessing a value without taking ownership of it.

In Rust-style borrowing, the usual rule is: many shared read-only borrows, or one exclusive mutable borrow, but not both at the same time.
