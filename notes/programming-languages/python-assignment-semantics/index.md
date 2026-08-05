---
title: Python Assignment Semantics
category: Programming Languages
---

In Python, assignment has a few quirks, especially for tuple assignment:

- The right-hand side (RHS) is evaluated before any assignment.
- The left-hand side (LHS) targets are assigned from left to right.
- Augmented assignment isn't always the same as normal assignment.

## RHS is Evaluated Before Assignment, LHS is Assigned Left-to-Right

Tuple assignment doesn't happen "simultaneously." Instead, Python first evaluates (or "snapshots") every expression on the RHS, then assigns the resulting values to LHS targets from left to right.

This has implications when reversing a linked list:

```python
# Case 1 and 2: Correct assignment
curr.next, curr, prev = prev, curr.next, curr
curr.next, prev, curr = prev, curr, curr.next

# Case 3 and 4: Incorrect assignment
prev, curr, curr.next = curr, curr.next, prev
curr, prev, curr.next = curr.next, curr, prev
```

In case 3, the interpreter first snapshots the RHS as `temp1, temp2, temp3 = (curr, curr.next, prev)`. It then assigns the values from left to right:

![Linked-list assignment showing left-to-right target updates](./assets/linked-list.excalidraw)

When in doubt, write the operations line by line instead of relying on tuple assignment.

### Augmented Assignment vs Normal Assignment

In some cases, augmented assignment (such as `+=` or `*=`) produces different results from normal assignment. Consider:

```python
# Augmented assignment
x = y = []
x += [1]
print(x) # [1]
print(y) # [1]

# Normal assignment
x = y = []
x = x + [1]
print(x) # [1]
print(y) # []
```

Augmented assignment first attempts to call the in-place special method, such as `__iadd__`. If that method exists and performs an in-place update, other references to the same mutable object observe the change. If `__iadd__` isn't implemented or returns `NotImplemented`, Python falls back to the normal operation (`__add__`) and rebinds the variable to the result.

For immutable built-in types such as `int`, `str`, and `tuple`, `+=` necessarily creates a new object because the original object can't be modified. For mutable built-in types such as `list`, `set`, and `dict`, the in-place operators typically modify the existing object.
