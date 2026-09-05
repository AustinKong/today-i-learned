---
title: Message Authentication Code
category: Cryptography
---

A *message authentication code (MAC)*, also called an *authentication tag*, is a short value used to verify a message's integrity and authenticity. A MAC algorithm combines a message with a shared secret key, allowing another party that holds the same key to detect unauthorized changes and verify that the message was produced by someone who possesses the key.

## Security Properties

A MAC provides two closely related guarantees:

- Integrity: An attacker cannot modify the message without invalidating its tag.
- Authentication: A valid tag demonstrates that its creator possessed the shared secret key.

Encryption and MACs solve different problems. Encryption provides confidentiality by hiding a message's contents, whereas a MAC provides integrity and authenticity without hiding the message. A protocol may use both when it needs all three properties.

### Replay Attacks

A MAC does not guarantee freshness and is therefore susceptible to [[Authentication Methods#Replay Attacks|replay attacks]].

### Cryptographic Hashes and Checksums

A cryptographic hash or checksum can detect accidental changes, but neither uses a secret key. An attacker can modify the message and calculate a new hash or checksum, so these mechanisms do not protect against unauthorized changes. A MAC does because the attacker cannot calculate a valid tag without the secret key.

### Digital Signatures

A MAC is not the same as a [[Digital Signature|digital signature]]. MAC algorithms use a shared secret key, while digital-signature algorithms use an asymmetric private and public key pair. MACs are generally faster to compute, but the participants must securely establish the shared key beforehand.

## Generating and Verifying a MAC

The sender passes the secret key and message to the MAC algorithm, then sends the message and resulting tag. The receiver applies the same algorithm to the received message with the shared key and compares the expected tag with the received tag:

![MAC generation and validation](./assets/mac-validation.excalidraw)

If the tags match, the message has not been changed since someone with the key created its tag. If they differ, verification fails and the message must not be trusted.

Implementations should compare tags with a constant-time comparison function to avoid [[Authentication Methods|timing attacks]]. Some implementations deliberately truncate tags at the cost of forgery resistance.

## Hash-Based Message Authentication Code

A *hash-based message authentication code (HMAC)*, also known as *keyed-hash message authentication code*, is a specific MAC construction that uses a cryptographic hash function and a secret key.

HMAC is standardized in [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104) and can be instantiated with different cryptographic hash functions.

### Naive Keyed-Hash MAC

A simple approach to constructing a MAC is to concatenate the secret key and message, then hash the result:

$$
\operatorname{MAC}(K,m) = H(K \mathbin\| m)
$$

This is a *prefix-keyed hash*. Although it incorporates a secret key, it is insecure with hash functions that are vulnerable to length-extension attacks.

### Length-Extension Attacks

Merkle-Damgård hash functions are vulnerable to a *length-extension attack*. Given $H(K \mathbin\| m)$ and the length of its input, an attacker can continue the hash computation without knowing $K$ and produce a valid tag for:

$$
K \mathbin\| m \mathbin\| \operatorname{pad} \mathbin\| x
$$

The attacker submits $m \mathbin\| \operatorname{pad} \mathbin\| x$ as the message. When the verifier prepends $K$, it computes the same tag, making the forgery valid.

The following diagram illustrates the attack. The initial blocks contain the key followed by the original message, and the attacker adds the malicious extension after the hash padding:

![Length-extension attack](./assets/length-extension-attack.excalidraw)

> [Computerphile: Length Extension Attacks](https://youtu.be/gOIBUe1fjX0?si=_nNq76LFs4MEaRzk) provides a visual explanation.

#### Appending the Key

The straightforward attack does not work when the key is appended because these hashes process data from left to right. An attacker can extend only after the secret key:

$$
H(m \mathbin\| K \mathbin\| \operatorname{pad} \mathbin\| x)
$$

The verifier instead appends the key after the extended message:

$$
H(m \mathbin\| \operatorname{pad} \mathbin\| x \mathbin\| K)
$$

The values do not match. $H(K \mathbin\| m \mathbin\| K)$ also blocks this straightforward attack, but both constructions still have security flaws that are fixed by HMAC's standard construction.

### HMAC Construction

HMAC uses an inner and an outer hash operation:

$$
\operatorname{HMAC}(K,m) = H\left((K' \oplus \operatorname{opad}) \mathbin\| H\left((K' \oplus \operatorname{ipad}) \mathbin\| m\right)\right)
$$

The block-sized key $K'$ is derived from $K$ as follows:

$$
K' =
\begin{cases}
\operatorname{pad}_B(H(K)) & \text{if } |K| > B \\
K & \text{if } |K| = B \\
\operatorname{pad}_B(K) & \text{if } |K| < B
\end{cases}
$$

Here, $B$ is the block size of the hash function used by HMAC, so its value depends on the selected hash function. $|K|$ is the key length, and $\operatorname{pad}_B$ pads its input on the right with zero bytes until it is $B$ bytes long. A key longer than one block is therefore hashed and then padded, a key exactly one block long is unchanged, and a shorter key is padded. This normalization is part of the HMAC construction; it is not a general-purpose [[Key Derivation|key derivation function]].

The `ipad` and `opad` values are each $B$ bytes long and consist of repeated `0x36` and `0x5c` bytes, respectively. Using different pads provides domain separation between the inner and outer hash operations, while the nested construction protects against length-extension attacks.

## Cipher-Based Message Authentication Code

Not every MAC is an HMAC. A *cipher-based message authentication code (CMAC)* constructs a MAC from a block cipher rather than a hash function. CMAC is based on the One-Key MAC (OMAC) family, which in turn is related to CBC-MAC.
