---
title: Log-Structured Merge-Tree
category: Database Systems
---

The following diagram shows how this storage design moves data from memory into sorted files and later merges those files through compaction:

![Log-structured merge-tree showing memtables, SSTables, and compaction](./assets/lsm-tree.excalidraw)

A *log-structured merge-tree* (LSM tree) is a storage engine design for maintaining sorted key-value data. It is optimized for write-heavy workloads by turning random writes into mostly sequential writes.

In an LSM tree, data is first written to an in-memory structure, then periodically flushed to disk as immutable sorted files. Over time, those files are merged through compaction.

The core trade-off is that LSM trees make writes fast by deferring cleanup work until later.

It is commonly used in systems like LevelDB, RocksDB, Cassandra, ScyllaDB, and many storage engines built on top of RocksDB.

## Sorted String Table

An *Sorted String Table* (SSTable)  is an immutable file of sorted key-value entries.

The important properties are:

- Entries are sorted by key.
- The file is immutable once written.
- Within a single SSTable, each key appears at most once.
- Across multiple SSTables, the same key may appear multiple times.

In the context of LSM trees, the term "segment" refers to a file containing a sequence of key-value records. When that segment is sorted by key, it is an SSTable. An LSM tree contains multiple segments or SSTables.

### Binary Search Inside an SSTable

Binary search can efficiently search an SSTable, but it works well only with fixed-size records. For variable-length records, the physical byte position doesn't map cleanly to the logical record position, so binary search can produce skewed results with worse-than-$O(\log n)$ complexity.

The following diagram shows why binary search is difficult when records have variable lengths:

![Binary search over variable-length SSTable records](./assets/sstable-binary-search.excalidraw)

Without additional metadata, a byte offset doesn't identify the corresponding logical record position reliably.

> Binary search isn't impossible with variable-length records; it requires extra metadata.

### Blocks and Sparse Index

Instead of binary-searching raw records directly, many systems use indexes and block metadata. A single SSTable is divided into blocks (typically a few KB in size), and a sparse index can point to the beginning of each block.

The following diagram shows how a sparse index narrows a search to one data block:

![Sparse index pointing to a block in an SSTable](./assets/sstable-block-index.excalidraw)

Searching across the entire SSTable is as follows:

1. Binary search over the sparse index to find the greatest indexed key $k_{\text{index}}$ such that $k_{\text{index}} \leq k_{\text{target}}$.
2. Read the entire data block from disk.
3. Perform a linear scan over the block, or perform binary search within the block if metadata supports it.

Another benefit is that blocks can be compressed as a unit, saving disk space and reducing disk I/O. However, systems need to decompress a block before reading entries from it.

## Memtable

A *memtable* is an in-memory sorted data structure used to absorb new writes.

It may be implemented using a balanced tree, skip list, or another sorted data structure. The exact implementation depends on the storage engine.

When the LSM tree receives a write, it is inserted into the memtable. Since the memtable is in memory, this is fast.

Once the memtable grows beyond a threshold (typically a few MB in size), it is frozen and flushed to disk as an SSTable. While the old memtable is being written to disk, a new memtable can start accepting writes.

## Writing in an LSM Tree

When a new key-value pair is written:

1. Append the write to a write-ahead log.
2. Insert the key-value pair into the memtable.
3. Return success to the client.
4. Later, flush the memtable to disk as an SSTable.
5. Later still, compact SSTables in the background.

The [[Write Ahead Logging|write-ahead log]] is used for durability. If the process crashes before the memtable is flushed to disk, the storage engine can replay the log and rebuild the memtable.

## Deletes and Tombstones

If a key exists inside an SSTable, the storage engine can't simply open the file and remove that key in place because SSTables are immutable. Instead, it writes a special marker called a *tombstone*.

This marker tells the storage engine that the key is in a deleted state. Eventually, during compaction, the storage engine can remove both the tombstone and the old value when safe.

## Reading in an LSM Tree

Reading is more complicated than writing because the latest value for a key may exist in several places.

To look up a single key (known as a *point lookup*), check the following in order until the key is found:

1. The active memtable.
2. Any immutable memtables waiting to be flushed.
3. SSTables on disk, from newest to oldest.

If the same key appears multiple times, the newest version wins. If the newest entry is a tombstone, the key is treated as deleted.

LSM trees can also support range queries because memtables and SSTables are sorted by key. For a range query, the storage engine seeks to the start key in each relevant sorted source, then scans forward and merges the results until the end key is reached.

This merge may involve multiple sources:

- The active memtable
- Immutable memtables
- Multiple SSTables

During the merge, duplicate keys must be resolved by keeping the newest entry. If the newest entry for a key is a tombstone, that key should be omitted from the result.

### Bloom Filter Optimization

A *Bloom filter* stores metadata about an individual SSTable and helps answer whether a key might exist in that SSTable.

If the Bloom filter says the key is definitely not present, the storage engine can skip that SSTable. If the Bloom filter says the key might be present, the storage engine still has to check the SSTable.

This helps reduce unnecessary disk reads during point lookups.

## Compaction

The following diagram shows how compaction merges SSTables and removes obsolete entries:

![Compaction merging SSTables and removing obsolete entries](./assets/compaction.excalidraw)

*Compaction* is the background process of merging SSTables. It:

- Merges multiple SSTables into fewer SSTables
- Removes overwritten values
- Removes deleted values when it is safe

This improves read performance by reducing the number of SSTables and reclaims disk space.

> Definition of "safe" in tombstone removal: A tombstone can be removed only when no older SSTable can still contain the deleted key. For example, if SSTable B contains a tombstone for "foo" while an older SSTable may still contain "foo", the tombstone must remain so the old value doesn't reappear.

Because SSTables are sorted, merging them is efficient, similar to the merge step in merge sort.

> Compaction can merge multiple SSTables in one pass, not only pairwise.

## Leveling and Tiering

Compaction can be done in different ways. Two common strategies are tiered compaction and leveled compaction.

### Tiered Compaction

The following diagram shows how tiered compaction accumulates similarly sized SSTables before merging them:

![Tiered compaction accumulating and merging SSTables](./assets/tiered-compaction.excalidraw)

In *tiered compaction*, the storage engine allows multiple SSTables of similar sizes to accumulate into tiers (sometimes also called levels or runs). Once enough SSTables accumulate in a tier, the storage engine merges them into a larger SSTable.

> When SSTables are merged, they may or may not be promoted to a larger tier. The merge output is simply placed into the appropriate tier for its size.

Tiered compaction is generally more write-friendly because data is rewritten less aggressively and avoids unnecessary merges of very large SSTables with much smaller ones.

> In some cases, tiered compaction may cascade.

### Leveled Compaction

The following diagram shows how leveled compaction organizes SSTables into levels with mostly non-overlapping key ranges:

![Leveled compaction organizing SSTables into levels](./assets/leveled-compaction.excalidraw)

In *leveled compaction*, SSTables are organized into levels. Unlike tiered compaction, where key ranges can overlap heavily within a tier, leveled compaction ensures that key ranges mostly don't overlap within a level.

To maintain this invariant, leveled compaction compacts by key range, not just by file size. When compacting data into the next level, the storage engine merges the selected SSTables with any SSTables in the next level whose key ranges overlap. The output is then written back as non-overlapping SSTables.

> SSTables are generally similar in size across all levels; only the number of SSTables per level increases.

Leveled compaction has several important properties:

- In level 0, key-range overlap is generally not enforced because memtables are dumped directly.
- In level 1 and below, key-range overlap is generally avoided within each level.
- Lower levels contain more total data and are compacted less frequently.

Because key ranges don't overlap in lower levels, point lookups need to check fewer SSTables. Thus, leveled compaction can reduce read amplification at the cost of write amplification.
