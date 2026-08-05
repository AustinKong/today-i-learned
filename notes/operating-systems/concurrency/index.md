---
title: Concurrency
category: Operating Systems
---

The following diagram contrasts interleaved execution on one CPU core with parallel execution across multiple cores:

![Interleaved execution on one core versus parallel execution across cores](./assets/concurrency-interleaving-parallelism.excalidraw)

*Concurrency* is the broader problem of managing multiple tasks whose execution overlaps in time. It includes *interleaving execution* (switching between tasks) and *parallel execution* (running tasks simultaneously on different cores).

When concurrent tasks access the same mutable object, [[Shared Mutation]] is what makes their interleavings observable and potentially unsafe.

> "Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once." — Rob Pike.

## Interleaving Execution

Interleaving execution allows multiple tasks to make progress on a single CPU core by switching between them.

Useful for I/O-bound workflows

Common examples include:

- Operating system thread scheduling
- Event loops
- `async`/`await`
- Coroutines

## Parallel Execution

Parallel execution allows multiple tasks to execute simultaneously on different CPU cores or processors. Unlike interleaving, more than one task is actively running at the same instant.

Useful for CPU-bound workflows

## Note on Definitions

The term "concurrency" is overloaded.

Some sources define concurrency narrowly as interleaved execution achieved through context switching. This corresponds to interleaving execution in this note.

Other sources define concurrency more broadly as managing multiple tasks whose lifetimes overlap. This makes both interleaving and parallelism mechanisms for achieving concurrency, which is the definition used in this note.

This note uses the broader definition, which aligns with [Sun's Multithreaded Programming Guide](https://docs.oracle.com/cd/E19455-01/806-5257/6je9h032b/index.html), [Wikipedia's definition of concurrency](https://en.wikipedia.org/wiki/Concurrency_(computer_science)), and [Rob Pike's explanation of concurrency](https://www.youtube.com/watch?v=oV9rvDllKEg).

## Relationship to Threads, Processes, and CPU Cores

Interleaving and parallelism describe execution patterns, whereas threads, processes, and CPU cores describe execution mechanisms and resources.

- Threads and processes can be interleaved.
- Threads and processes can be executed in parallel.
- Multiple CPU cores enable parallel execution.
- Multiple threads or processes don't imply parallelism.
