---
title: Write Ahead Logging
category: Database Systems
---

*Write-ahead logging* (WAL) is a protocol used by many database systems to guarantee atomicity and durability while improving write performance.

The protocol requires that every modification be written to a durable append-only log before the corresponding database page is written to its final location on disk. This append-only log is called the *write-ahead log* (or transaction log).

> In many database systems, "WAL" is used interchangeably to describe both the protocol (write-ahead logging) and the log itself (write-ahead log).

The main benefits of write-ahead logging are:

- Durability: Committed transactions can be recovered even if the database crashes.
- *Crash recovery*: The database can replay the write-ahead log after a crash to restore committed changes.
- Performance: Changes are written to a sequential append-only log instead of requiring random writes to the main database files.
- [[Database Replication|Replication]]: The log can be streamed to replicas, allowing them to replay the same changes and stay synchronized with the primary database.

## WAL Records

A common misconception is that a write-ahead log stores SQL statements. In practice, most database systems record low-level storage operations instead.

By the time a WAL record is generated, the SQL statement has already been parsed, planned, and executed. The storage engine only needs enough information to reproduce the resulting modifications during recovery.

For example, consider the statement:

```sql
UPDATE users
SET age = 30
WHERE id = 42;
```

The WAL record in PostgreSQL conceptually looks like:

```text
LSN
Transaction ID

Resource Manager: Heap
Operation: Heap Update

Relation: users
Page: 500
Tuple Offset: 2

Payload: data bytes

CRC checksum
```

The *Log Sequence Number* (LSN) is a monotonically increasing unique identifier for every WAL record. It identifies a record's position in the log.

The *Cyclic Redundancy Check* (CRC) detects corrupted WAL records during recovery.

Conceptually, the "Resource Manager" and "Operation" fields can be treated as one "Operation" field. Their separation is a PostgreSQL-specific implementation detail. See [PostgreSQL WAL record details](https://www.interdb.jp/pg/pgsql09/04.html) for more information.

> The exact contents of a WAL record vary between storage engines. PostgreSQL primarily records low-level storage operations, while SQLite's WAL stores complete modified page images.

## Writing to WAL

When a transaction modifies data, the storage engine first generates one or more WAL records describing the modification. These records are appended to an in-memory WAL buffer.

When the transaction commits, the WAL buffer is flushed to the write-ahead log on disk. Only after this succeeds can the transaction be considered committed.

The modified database pages themselves are not written immediately. Instead, they remain in-memory and are written back later by a background process during checkpointing.

The following diagram shows the write path:

![Write path from a transaction through the WAL buffer to durable storage](./assets/writing-to-wal.excalidraw)

The WAL buffer is flushed to WAL whenever (for PostgreSQL):

- A running transaction commits or aborts.
- The WAL buffer becomes full.
- A WAL writer process writes periodically.

> The database still writes to an in-memory page because the page holds current state, while WAL holds history. A storage engine that treats its log as the source of data begins to resemble a [[Log-Structured Merge-Tree|log-structured merge-tree]].

## Checkpointing

After a transaction commits, its modifications are durable because the write-ahead log has been flushed. However, the modified database pages may still exist only in memory. *Checkpointing* is the process of writing these dirty pages back to the main database files.

A checkpoint also records the location in the WAL when checkpointing begins, regardless of whether the database is in the middle of a transaction. This location is called the *REDO point* and is represented by a corresponding LSN.

> The REDO point can be recorded directly from the in-memory WAL buffer without reading from the on-disk WAL. This works because all earlier WAL records must be flushed before the checkpoint record can be flushed, because the WAL is append-only.

During checkpointing, the database flushes dirty pages and records the checkpoint location as follows:

![Checkpointing flushing dirty pages and recording a REDO point](./assets/checkpointing.excalidraw)

> The control metadata only stores a "pointer" to the checkpoint record holding the actual REDO point.

### Full-Page Images

When writing a database page to disk (typically during checkpointing), a crash or power failure may interrupt the write, leaving only part of the page updated. This is known as a *torn page*. Recovery can no longer assume that the page on disk represents either the old or the new version.

To protect against torn pages, PostgreSQL logs a *full-page image* (FPI) to the WAL the first time a page is modified after each checkpoint. If recovery encounters a torn page, it can restore the entire page from the FPI before replaying subsequent WAL records.

Subsequent modifications to the same page only log the normal delta records until the next checkpoint.

## Crash Recovery

If the database crashes before the next checkpoint, some committed modifications may exist only in the write-ahead log. The corresponding database pages on disk may still contain older data.

During startup, the database begins recovery from the REDO point stored in the latest checkpoint. Starting from this LSN, it scans the WAL sequentially and replays each WAL record until it reaches the end of the log.

Recovery applies this replay to in-memory pages as follows:

1. Read control metadata to locate the latest checkpoint record.
2. Read the checkpoint record to obtain the REDO point.
3. Replay WAL records starting from the REDO point.
4. Load pages into memory as needed and apply the WAL records, marking pages as dirty.
5. Dirty pages are eventually written back to disk via checkpointing.

Modifications belonging to incomplete transactions are replayed but not made visible after recovery, for example:

```sql
BEGIN;
UPDATE A;
UPDATE B;
-- Crash
```

Updates A and B are still replayed to restore the disk state to the exact moment of the crash. However, they are never made visible and are subsequently rolled back:

- In PostgreSQL, the changes are replayed, but the transaction status remains "in-progress/aborted" in the commit log (clog). MVCC rules ensure these changes are invisible to users.
- In ARIES-style systems, an Undo phase runs after the Redo phase to reverse these uncommitted changes.

Conceptually, WAL itself only records and replays storage modifications. Determining which transactions ultimately become visible is the responsibility of the database's recovery algorithm.

> Recovery is idempotent. If the database crashes during a recovery operation, it can restart safely.

## WAL Integrity

Several mechanisms enforce durability for different parts of the database:

- In-memory pages to database files: Write-ahead logging and checkpointing.
- Database page writes: Full-page images protect against torn pages.

Another problem occurs if the database crashes while writing the WAL buffer to the WAL.

To detect incomplete or corrupted WAL records, each record stores metadata such as its length and a CRC checksum. During recovery, the database validates each record before replaying it. If a record is truncated or its checksum is invalid, recovery stops at the last valid record.

The database verifies a WAL record as follows:

1. Read record header
2. Read the record length
3. Decode the remaining bytes based on the record structure
4. Extract the record's CRC
5. Compute the CRC over the record contents
6. Compare the computed CRC with the stored CRC
