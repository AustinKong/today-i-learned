---
title: Python Assignment Semantics
category: Programming Languages
---

In Python, assignment has a few quirks to take note of, especially for tuple assignment:

- RHS is evaluated before any assignment
- LHS targets are assigned left-to-right
- Augmented assignment isn't always the same as normal assignment

## RHS is Evaluated Before Assignment, LHS is Assigned Left-to-Right

Tuple assignment doesn't happen "simultaneously", instead Python first evaluates ("snapshots") very expression on the RHS, then assigns the resulting values to LHS from left-to-right.

This has implications when reversing a linked list:

```python
# Case 1 and 2: Correct assignment
curr.next, curr, prev = prev, curr.next, curr
curr.next, prev, curr = prev, curr, curr.next

# Case 3 and 4: Incorrect assignment
prev, curr, curr.next = curr, curr.next, prev
curr, prev, curr.next = curr.next, curr, prev
```

Consider case 3, the interpreter first snapshots RHS to produce `temp1, temp2, temp3 = (curr, curr.next, prev)`. Then, it does assignment left-to-right:

![Linked List](./assets/linked-list.excalidraw)

Rule of thumb: When in doubt, write out line-by-line instead of relying on tuple assignment.

### Augmented Assignment vs Normal Assignment

In some cases, augmented assignment (`+=`, `*=`) might produce different results than normal assignment. Consider:

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

Augmented assignment (`+=`, `*=`, etc.) first attempts to call the in-place special method (such as `__iadd__`). If that method exists and performs an in-place update, other references to the same mutable object will observe the change. If `__iadd__` is not implemented (or returns `NotImplemented`), Python falls back to the normal operation (`__add__`) and rebinds the variable to the result.

For immutable built-in types like int, str, and tuple, `+=` necessarily creates a new object because the original object cannot be modified. For mutable built-in types like list, set, and dict, the in-place operators typically modify the existing object.
