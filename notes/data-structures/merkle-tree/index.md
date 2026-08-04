---
title: Merkle Tree
category: Data Structures
---

![Merkle Tree](./assets/merkle-tree.excalidraw)

Also known as a hash tree. It is a tree data structure that labels nodes with cryptographic hashes:

- Leaf node: Labelled with hash of a data block
- Inner node: Labelled with hash of the labels of child nodes

<!-- TODO: Link to Cryptographic Hash functions note when ready -->
For the general mechanics and properties of hash functions, see [[Hashing]]. Merkle trees specifically require cryptographic hash functions.

Merkle trees don't need to be binary, and inner nodes could also store data blocks. The concatenation function just needs to be able to handle these.

> In general, our hashing process can be described as $\operatorname{label} = h(f(\operatorname{left}, \operatorname{right}))$. The most common combining function is concatenation: $f(A, B) = A \mathbin\Vert B$. Any combining function $f$ is possible, provided it preserves the desired security properties. Here, $h$ is the hash function.

## Verification and Merkle Proofs

Demonstrating that a leaf node is part of a given Merkle tree requires $O(\log n)$ hash computations, where $n$ is the number of leaf nodes in a balanced tree.

> We say `n` is number of leaf nodes, but asymptotically `n` could also mean the total number of nodes. However, it commonly refers to leaf nodes in papers/articles as data blocks are conventionally stored in leaves, and thats the quantity users care about.

A Merkle proof is the set of sibling hashes required to reconstruct the path from a leaf node to the root hash.

In the example above, to prove that `D1` is correctly part of the tree, we must compute:

$$
\begin{aligned}
H_1 &= h(D_1) \\
H_{12} &= h(H_1 \mathbin\Vert H_2) && \text{assuming } H_2 \text{ is already known} \\
H_{\text{root}} &= h(H_{12} \mathbin\Vert H_{34}) && \text{assuming } H_{34} \text{ is already known}
\end{aligned}
$$

The proof consists of the hashes `[H2, H34]`.

> One might wonder why an attacker cannot simply fabricate a Merkle proof for malicious data. The security of Merkle trees comes from the underlying cryptographic hash function: given a trusted root hash, finding a different data block and proof that produce the same root is assumed to be computationally infeasible.

## Applications

A Merkle tree allows verification of a small piece of data without downloading or hashing the entire dataset. To verify a leaf, only its Merkle proof and the trusted root hash are needed.

Thus, they are widely used in applications like: distributed version control systems (Git), crypto networks (Bitcoin, Ethereum), package managers (Nix) etc.

For example, in P2P networks:

- A trusted source provides the Merkle root hash.
- File chunks and Merkle proofs can be downloaded from untrusted peers.
- Each chunk can be verified independently by hashing the chunk and combining it with its Merkle proof to reconstruct the root hash.
- The reconstructed root hash is compared against the trusted root hash.
  - Chunks with valid proofs are kept.
  - Corrupted or malicious chunks are discarded and re-downloaded from other peers.

Thus, Merkle trees enable efficient integrity checking of large downloads: only invalid chunks need to be re-downloaded, while valid chunks can be kept.

## Domain Separation

Some Merkle tree implementations distinguish leaf and internal nodes when hashing:

$$
\begin{aligned}
\operatorname{leaf} &= h(0x00 \mathbin\Vert \operatorname{data}) \\
\operatorname{internal} &= h(0x01 \mathbin\Vert \operatorname{left} \mathbin\Vert \operatorname{right})
\end{aligned}
$$

This prevents ambiguity between leaf and internal-node hashes and avoids second-preimage attacks.

> Without domain separation, a hash representing an internal node could be interpreted as leaf data. This can allow an attacker to construct a different tree with the same root hash
