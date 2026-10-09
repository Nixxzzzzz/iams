/**
 * In-Process Concurrency Mutex
 * Source of Truth: docs/GOOGLE_SHEETS_INTEGRATION.md §4.2, docs/DATABASE_DESIGN.md §6.2
 *
 * Guarantees that asynchronous operations (such as sequential natural ID generation
 * and sheet updates) execute in a strictly serialized FIFO queue to prevent race conditions.
 */

export class Mutex {
  private queue: Promise<void> = Promise.resolve();

  /**
   * Acquires lock, executes critical section, and releases lock.
   */
  async runExclusive<T>(callback: () => Promise<T> | T): Promise<T> {
    let release: () => void = () => {};
    const waitPromise = new Promise<void>((resolve) => {
      release = resolve;
    });

    const previous = this.queue;
    this.queue = previous.then(() => waitPromise, () => waitPromise);

    await previous;
    try {
      return await callback();
    } finally {
      release();
    }
  }
}
