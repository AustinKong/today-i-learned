---
title: Hashing
category: Algorithms
---

This note explains non-cryptographic or general-purpose hashing.

A hash function is a deterministic function that maps an input of arbitrary size to a fixed-size value called a hash (or hash value).

$$
\text{fixed-size hash} = \operatorname{hash\_function}(\text{arbitrary-length input})
$$

Since an infinite number of possible inputs are mapped to a finite number of outputs, different inputs must sometimes produce the same hash. This phenomenon is known as a collision.

Hash functions are applied throughout computer science:

- Hash tables
- Distributed caches
- Database indexing
- Bloom filters
- Checksums and integrity verficiation
- Cryptographic protocols

## Properties of a Good Hash Function

A hash function is defined only by its ability to deterministically map arbitrary inputs to fixed-size outputs. In practice, however, some hash functions perform significantly better than others.

> Note, some hash functions support variable length output.

### Uniformity

A good hash function should distribute its outputs as uniformly as possible. That is, every possible hash value should be generated with approximately equal probability for the expected set of inputs.

Uniformity minimizes clustering and allows hashing-based algorithms to achieve predictable performance.

#### Uniformity vs Randomness

Uniformity should not be confused with randomness.

Hash functions are deterministic by definition, which is incompatible with randomness. Instead, uniformity means that across the expected input set, every output value is approximately equally likely.

#### Pigeonhole Principle

Even a perfectly uniform hash function cannot eliminate collisions.

This follows directly from the pigeonhole principle: if $n$ items are put into $m$ containers, with $n > m$, then at least one container must contain more than one item.

Likewise, an unlimited number of possible inputs cannot be mapped uniquely into a finite number of hash values.

#### The Birthday Paradox

In probability theory, the birthday problem asks for the probability that, in a set of n randomly chosen people, at least two will share the same birthday.

The birthday paradox is the counterintuitive fact that only 23 people are needed for that probability to exceed 50%.

Similarly, for a hash function with an output space of size $n$, collisions become likely after approximately $\sqrt{n}$ randomly chosen inputs.

> More precisely, a 50% chance of collision occurs after approximately $1.177\sqrt{n}$ or $\sqrt{2n\ln 2}$ inputs.

#### Perfect Hash Functions

A perfect hash function maps every key in a known finite set to a unique hash value, producing no collisions.

Perfect hash functions are only practical when the complete set of keys is known beforehand and never changes.

> Modern algorithms can efficiently construct perfect hash functions for static key sets. However, if keys may be inserted or removed over time, maintaining a perfect hash generally requires rebuilding the hash function, making perfect hashing impractical for dynamic data structures such as hash tables.

### Avalanche Effect

A good hash function should exhibit the avalanche effect: a small change to the input should produce a large, seemingly unrelated change in the output.

For example, changing a single bit in the input should drastically change the resulting hash rather than only affecting a few output bits.

The formal version of this property is the Strict Avalanche Criterion (SAC): Flipping any single input bit should cause each output bit to change with a probability of 50%.

The 50% probability represents the ideal balance:

- 0%: The output bit completely ignores the input bit.
- 50%: Ideal, knowing the input bit changed tells you nothing about whether this output bit will change.
- 100%: There is a deterministic dependency between the input bit and output bit.

Modern hash functions achieve the avalanche effect through repeated bit-mixing operations such as XORs, rotations, shifts, and multiplications.

### Efficiency

A good hash function should be inexpensive to compute.

Most hash functions generally have linear time complexity with respect to the input size. In practice, efficiency is determined by the constant factors: the number of CPU instructions executed and the latency of those instructions.

> The simplest computationally being the bitwise methods (folding), followed by the multiplicative methods, and the most complex (slowest) are the division-based methods.

In practice, a slightly less uniform hash function that is substantially faster is often preferable to a slower one that only marginally reduces collisions.

## Building Hash Functions

### Constants

Hash functions often use carefully chosen constants during bit mixing. The choice of constants significantly affects the quality of mixing and avalanche behaviour.

Historically, many hash functions chose odd prime constants because they exhibited good statistical properties. Modern hash functions instead search empirically using statistical test suites (i.e. trial and error) to identify constants with good statiscal properties, and these constants are not necessarily prime.

### Seeds

Seeds are used to initialize the hash state. Use cases include:

- Preventing hash-flooding attacks: Suppose an attacker knows your hash function and can deliberately generate many keys that collide, degrading a hash table from $O(1)$ to $O(N)$ performance. This has been used for denial-of-service attacks against web servers. Instead, a program can choose a random seed every time it starts.
- Multiple independent hash functions: When multiple independent hash functions are needed (e.g. bloom filter,) instead of implementing N different hash functions, we can just supply N different seeds to the same hash function.

### Integer Overflow

Unsigned integer arithmetic naturally wraps around modulo $2^N$, where $N$ is the integer width (e.g., 32 or 64 bits). Hash functions intentionally rely on this behavior to keep the hash state bounded while repeatedly applying arithmetic operations without requiring explicit modulo operations.

### Bit Mixing

Bit mixing (or simply, mixing) is the process of distributing the influence of an input bit across the hash state, with no obvious statistical bias or correlation.

Common operators for doing this are:

- XOR: Combines two bit patterns without losing information.
- Addition: Produces carry bits that propagate information into higher-order bits.
- Multiplication: Produces many carry bits, spreading information throughout the word more effectively than addition alone.
- Bit shifts: Rearranges bit positions while discarding bits shifted out of the word, loses information.
- Bit rotations: Rearranges bit positions without discarding any bits.

> Since `a ^ b ^ a = b`, XOR actually preserves information.

### Finalizers

A finalizer performs one final round of aggressive bit mixing after all input has been processed. Its purpose is to remove any remaining statistical bias and improve the avalanche properties of the final hash.

Many hashing algorithms also use a finalizer, which consists of carefully chosen bit mixing operations.

### Block Processing and Parallel Accumulators

Modern hash functions process multiple bytes at a time (typically one machine word or more) instead of processing individual bytes. This better utilizes modern CPUs and significantly improves throughput, compared to doing one-byte-at-a-time processing.

Parallel accumulators maintain multiple independent hash states while processing a block of input. This exposes instruction-level parallelism, allowing modern CPUs to overlap independent operations and improve throughput. The accumulators are combined into a single hash at the end.

For example:

```c
// Without parallel accumulators, the CPU must process blocks in dependency order
h = mix(h, block1);
h = mix(h, block2);
h = mix(h, block3);
h = mix(h, block4);

// With parallel accumulators, the CPU can process blocks simultaneously
h1 = mix(h1, block1);
h2 = mix(h2, block2);
h3 = mix(h3, block3);
h4 = mix(h4, block4);
```

## Sample Hash Function: murmurhash3

Consider the full implementation of murmurhash3, as per [Wikipedia](https://en.wikipedia.org/wiki/MurmurHash):

```c
static inline uint32_t murmur_32_scramble(uint32_t k) {
  k *= 0xcc9e2d51;
  k = (k << 15) | (k >> 17);
  k *= 0x1b873593;
  return k;
}

uint32_t murmur3_32(const uint8_t* key, size_t len, uint32_t seed)
{
 uint32_t h = seed;
  uint32_t k;

  // Block processing: groups of 4 bytes
  for (size_t i = len >> 2; i; i--) {
    memcpy(&k, key, sizeof(uint32_t));
    key += sizeof(uint32_t);

    h ^= murmur_32_scramble(k);
    h = (h << 13) | (h >> 19);
    h = h * 5 + 0xe6546b64;
  }

  // If len is not divisble by 4, pack the remaining 1-3 bytes into a 32-bit integer so they contribute to the hash.
  k = 0;
  for (size_t i = len & 3; i; i--) {
    k <<= 8;
    k |= key[i - 1];
  }
  h ^= murmur_32_scramble(k);

  // Finalizer
 h ^= len;
 h ^= h >> 16;
 h *= 0x85ebca6b;
 h ^= h >> 13;
 h *= 0xc2b2ae35;
 h ^= h >> 16;
 return h;
}
```
