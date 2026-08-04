---
title: Binary Lifting
category: Algorithms
---

Binary lifting preprocesses a rooted tree so that ancestor queries can be answered in $O(\log n)$ time.

The canonical query is: what is the `k`-th ancestor of node `u`? In other words, which node is `k` edges above `u`? The same precomputation is also commonly used to find the lowest common ancestor (LCA) of two nodes.

## Idea

![Binary Lifting](./assets/binary-lifting.excalidraw)

Instead of storing only each node's parent, store ancestors at power-of-two distances:

$$
\begin{aligned}
\operatorname{up}[u][0] &= \text{1st ancestor of } u \text{ (its parent)} \\
\operatorname{up}[u][1] &= \text{2nd ancestor of } u \\
\operatorname{up}[u][2] &= \text{4th ancestor of } u \\
\operatorname{up}[u][3] &= \text{8th ancestor of } u \\
&\ \vdots
\end{aligned}
$$

Any non-negative integer is a sum of powers of two. Therefore, to move `k` steps upward, decompose `k` into its set bits and take the corresponding jumps.

For example, $13 = 8 + 4 + 1 = 1101_2$. To find the 13th ancestor, make jumps of 8, 4, and 1 edges.

## Building the Jump Table

Let $\operatorname{up}[u][j]$ be the $2^j$-th ancestor of node $u$. If the tree has $n$ nodes, the largest useful jump is less than $n$, so use:

$$
\operatorname{LOG} = \lceil \log_2 n \rceil + 1
$$

The first column is given by the tree's parent relation:

$$
\operatorname{up}[u][0] = \operatorname{parent}[u]
$$

Every later column follows from two half-sized jumps:

$$
\operatorname{up}[u][j] = \operatorname{up}[\operatorname{up}[u][j - 1]][j - 1]
$$

This recurrence says that a $2^j$-edge jump is two consecutive $2^{j - 1}$-edge jumps.

> Use a sentinel such as `-1` for a nonexistent ancestor. The root's parent is then `-1`, and the recurrence must not index through `-1`.

```python
# Assuming parent[u] = -1 if u has no parent
def build_jump_table(parent: list[int]) -> list[list[int]]:
    n = len(parent)
    log = max(1, n.bit_length())
    up = [[-1] * log for _ in range(n)]

    for u in range(n):
        up[u][0] = parent[u]

    for j in range(1, log):
        for u in range(n):
            mid = up[u][j - 1]
            if mid != -1:
                up[u][j] = up[mid][j - 1]

    return up
```

The parent array can be supplied directly, or computed with a DFS/BFS from a chosen root.

## Finding the `k`-th Ancestor

For each set bit `j` of `k`, jump from the current node to `up[u][j]`.

```python
def kth_ancestor(u: int, k: int, up: list[list[int]]) -> int:
    log = len(up[0])
    if k >= 1 << log:
        return -1

    for j in range(log):
        if (k >> j) & 1:
            u = up[u][j]
            if u == -1:
                return -1

    return u
```

For $k = 13 = 1101_2$, this takes the jumps at bit positions $0$, $2$, and $3$: 1, 4, and 8 edges. Their order does not affect the result because every jump follows the same path towards the root.

> A query with `k = 0` returns `u` itself. If `k` is greater than `depth[u]`, the requested ancestor does not exist.

## Lowest Common Ancestor

The lowest common ancestor of `u` and `v` is their deepest shared ancestor.

1. Lift the deeper node until both nodes have the same depth.
2. If they now match, that node is the LCA.
3. Otherwise, try jumps from largest to smallest. Whenever the two nodes would land on different ancestors, take that jump for both.
4. Their parents are now the LCA.

```python
def lca(u: int, v: int, depth: list[int], up: list[list[int]]) -> int:
    if depth[u] < depth[v]:
        u, v = v, u

    u = kth_ancestor(u, depth[u] - depth[v], up)
    if u == v:
        return u

    for j in range(len(up[0]) - 1, -1, -1):
        if up[u][j] != -1 and up[u][j] != up[v][j]:
            u = up[u][j]
            v = up[v][j]

    return up[u][0]
```

## Complexity

| Operation | Time | Space |
| --- | --- | --- |
| Build the table | $O(n \log n)$ | $O(n \log n)$ |
| $k$-th ancestor | $O(\log n)$ | — |
| LCA | $O(\log n)$ | — |
