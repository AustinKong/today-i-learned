---
title: Merkle Tree
category: Data Structures
---

A *Merkle tree* is a tree data structure whose nodes are labeled with cryptographic hashes. The following diagram shows how child labels combine into parent labels:

![Merkle tree showing child hashes combined into parent hashes](./assets/merkle-tree.excalidraw)

Each leaf node is labeled with the hash of a data block. Each internal node is labeled with the hash of its child labels.

For the general mechanics and properties of hash functions, see [[Hashing]]. Merkle trees specifically require cryptographic hash functions.

Merkle trees don't need to be binary, and internal nodes can also store data blocks. The combining function only needs to handle the selected inputs.

In general, the labeling process can be described as:

$$
\operatorname{label} = h(f(\operatorname{left}, \operatorname{right}))
$$

The most common combining function is concatenation, where $f(A, B) = A \mathbin\Vert B$. Any combining function $f$ is possible if it preserves the desired security properties. Here, $h$ is the hash function.

## Verification and Merkle Proofs

Demonstrating that a leaf node is part of a given Merkle tree requires $O(\log n)$ hash computations, where $n$ is the number of leaf nodes in a balanced tree.

> The variable $n$ denotes the number of leaf nodes here. Asymptotically, $n$ could also denote the total number of nodes, but papers commonly use it for the number of leaf nodes because data blocks are conventionally stored in leaves.

A *Merkle proof* is the set of sibling hashes required to reconstruct the path from a leaf node to the root hash.

To prove that `D1` is part of the tree, compute the following hashes:

$$
\begin{aligned}
H_1 &= h(D_1) \\
H_{12} &= h(H_1 \mathbin\Vert H_2) && \text{assuming } H_2 \text{ is already known} \\
H_{\text{root}} &= h(H_{12} \mathbin\Vert H_{34}) && \text{assuming } H_{34} \text{ is already known}
\end{aligned}
$$

The proof consists of the hashes `[H2, H34]`.

> An attacker can't generally fabricate a valid proof for malicious data because, given a trusted root hash, finding a different data block and proof that produce the same root is assumed to be computationally infeasible.

## Applications

A Merkle tree allows verification of a small piece of data without downloading or hashing the entire dataset. To verify a leaf, only its Merkle proof and the trusted root hash are needed.

They're widely used in distributed version control systems such as Git, cryptocurrency networks such as Bitcoin and Ethereum, and package managers such as Nix.

For example, in P2P networks:

- A trusted source provides the Merkle root hash.
- File chunks and Merkle proofs can be downloaded from untrusted peers.
- Each chunk can be verified independently by hashing it and combining it with its Merkle proof to reconstruct the root hash.
- The reconstructed root hash is compared with the trusted root hash.
- Chunks with valid proofs are kept, while corrupted or malicious chunks are discarded and downloaded again from other peers.

Thus, Merkle trees enable efficient integrity checking of large downloads: only invalid chunks need to be re-downloaded, while valid chunks can be kept.

## Domain Separation

Some Merkle tree implementations use *domain separation* to distinguish leaf and internal nodes when hashing:

$$
\begin{aligned}
\operatorname{leaf} &= h(0x00 \mathbin\Vert \operatorname{data}) \\
\operatorname{internal} &= h(0x01 \mathbin\Vert \operatorname{left} \mathbin\Vert \operatorname{right})
\end{aligned}
$$

This prevents ambiguity between leaf and internal-node hashes and avoids second-preimage attacks.

> Without domain separation, a hash representing an internal node could be interpreted as leaf data. This can allow an attacker to construct a different tree with the same root hash.
