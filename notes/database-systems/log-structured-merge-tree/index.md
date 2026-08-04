---
title: Log-Structured Merge-Tree
category: Database Systems
---

![Log-Structured Merge-Tree](./assets/lsm-tree.excalidraw)

A log-structured merge-tree, or LSM tree, is a storage engine design for maintaining sorted key-value data. It is optimized for write-heavy workloads by turning random writes into mostly sequential writes.

In an LSM tree, data is first written to an in-memory structure, then periodically flushed to disk as immutable sorted files. Over time, those files are merged through compaction.

The core trade-off is that LSM trees make writes fast by deferring cleanup work to later.

It is commonly used in systems like LevelDB, RocksDB, Cassandra, ScyllaDB, and many storage engines built on top of RocksDB.

## Sorted String Table

An SSTable, or Sorted String Table, is an immutable file of sorted key-value entries.

The important properties are:

- Entries are sorted by key.
- The file is immutable once written.
- Within a single SSTable, each key appears at most once.
- Across multiple SSTables, the same key may appear multiple times.

In the context of LSM trees, the term "segment" refers to a file containing a sequence of key-value records. When that segment is sorted by key, it is an SSTable. An LSM tree contains multiple segments/SSTables.

### Binary Search Inside an SSTable

We can use binary search to efficiently search in an SSTable, but this only works well with fixed-size records. For variable-length records, the physical byte position does not map cleanly to the logical record position, making binary search produce skewed results leading to worse than $O(\log n)$ complexity.

![SSTable Binary Search](./assets/sstable-binary-search.excalidraw)

> Note that binary search is not impossible with variable-length records, it just requires extra metadata.

### Blocks and Sparse Index

Instead of binary searching raw records directly, many systems use indexes and block metadata. A single SSTable is divided into blocks (typically few KB in size,) a sparse index can point to the beginning of a block.

![SSTable Block Index](./assets/sstable-block-index.excalidraw)

Searching across the entire SSTable is as follows:

1. Binary search over the sparse index to find the greatest indexed key $k_{\text{index}}$ such that $k_{\text{index}} \leq k_{\text{target}}$.
2. Read the entire data block from disk.
3. Perform a linear scan over the block, or perform binary search within the block if metadata supports it.

Another benefit is that blocks can be compressed as a unit, saving disk space and reducing disk I/O, but systems need to decompress the block before reading entries from it.

## Memtable

A memtable is an in-memory sorted data structure used to absorb new writes.

It may be implemented using a balanced tree, skip list, or another sorted data structure. The exact implementation depends on the storage engine.

When the LSM tree receives a write, it is inserted into the memtable. Since the memtable is in memory, this is fast.

Once the memtable grows beyond some threshold (typically few MB in size,) it is frozen and flushed to disk as an SSTable. While the old memtable is being written to disk, a new memtable can start accepting writes.

## Writing in an LSM Tree

When a new key-value pair is written:

1. Append the write to a write-ahead log.
2. Insert the key-value pair into the memtable.
3. Return success to the client.
4. Later, flush the memtable to disk as an SSTable.
5. Later still, compact SSTables in the background.

The [[Write Ahead Logging|write-ahead log]] is used for durability. If the process crashes before the memtable is flushed to disk, the storage engine can replay the log and rebuild the memtable.

## Deletes and Tombstones

If a key exists inside an SSTable, we cannot simply open the file and remove that key in place because SSTables are immutable. Instead, the storage engine writes a special marker called a tombstone.

This marker tells the storage engine that the key is in a deleted state. Eventually, during compaction, the storage engine can remove both the tombstone and the old value when safe.

## Reading in an LSM Tree

Reading is more complicated than writing because the latest value for a key may exist in several places.

To look up a single key (known as a "point lookup"), check the following in order until the key is found:

1. The active memtable.
2. Any immutable memtables waiting to be flushed.
3. SSTables on disk, from newest to oldest.

If the same key appears multiple times, the newest version wins.  If the newest entry is a tombstone, the key is treated as deleted.

LSM trees can also support range queries because memtables and SSTables are sorted by key. For a range query, the storage engine seeks to the start key in each relevant sorted source, then scans forward and merges the results until the end key is reached.

This merge may involve multiple sources:

- The active memtable,
- Immutable memtables,
- Multiple SSTables.

During the merge, duplicate keys must be resolved by keeping the newest entry. If the newest entry for a key is a tombstone, that key should be omitted from the result.

### Bloom Filter Optimization

Bloom filters can be used to store metadata about individual SSTables. They help answer whether a key might exist in a particular SSTable.

If the Bloom filter says the key is definitely not present, the storage engine can skip that SSTable. If the Bloom filter says the key might be present, the storage engine still has to check the SSTable.

This helps reduce unnecessary disk reads during point lookups.

## Compaction

![Compaction](./assets/compaction.excalidraw)

Compaction is the background process of merging SSTables. It does:

- Merges multiple SSTables into fewer SSTables.
- Removes overwritten values.
- Removes deleted values when it is safe.

This improves read performance by reducing number of SSTables, and reclaims disk space.

> Definition of "safe" in tombstone removal: Say we are compacting SSTables A and B, B contains a tombstone for the key "foo". If there could still be an even older SSTable elsewhere containing "foo", the tombstone may need to remain so old values don't reappear.

Because SSTables are sorted, merging them is efficient, similar to the merge step in merge sort.

> Compaction can merge multiple SSTables in one pass, not only pairwise.

## Leveling and Tiering

Compaction can be done in different ways. Two common strategies are tiered compaction and leveled compaction.

### Tiered Compaction

![Tiered Compaction](./assets/tiered-compaction.excalidraw)

In tiered compaction, the storage engine allows multiple SSTables of similar sizes to accumulate into tiers (sometimes also referred to as "levels" or "runs"). Once there are enough of them in a tier, it merges them together into a larger SSTable.

> When SSTables are merged, they may or may not be promoted to a larger tier. The merge output is simply placed into the appropriate tier for its size.

Tiered compaction is generally more write-friendly because data is rewritten less aggressively and avoids unnecessary merges of very large SSTs with much smaller ones.

> In some cases, tiered compaction may "cascade".

### Leveled Compaction

![Leveled Compaction](./assets/leveled-compaction.excalidraw)

In leveled compaction, SSTables are organized into levels. Unlike tiered compaction, where within a tier, key ranges could overlap heavily; leveled compaction enforces that within a level, key ranges should mostly not overlap.

To maintain this invariant: Leveled compaction compacts by key range, not just by file size. I.e. when compacting data into the next level, the storage engine merges the selected SSTable(s) with any SSTables in the next level whose key ranges overlap. The output is then written back as non-overlapping SSTables.

> SSTables are generally similar size across all levels, only the number of SSTables per level increases.

Importantly:

- In level 0: Key range overlap is generally not enforced, memtables are "dumped" directly.
- In Level 1 and below: key range overlap is generally avoided within each level.
- Lower levels contain more total data and are compacted less frequently.

Because in lower levels key ranges do not overlap, point lookup needs to check fewer SSTables. Thus, leveled compaction can reduce read amplification at the cost of write amplification.
