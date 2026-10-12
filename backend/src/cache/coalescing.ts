import { logger } from '../logger/logger.js';

export class RequestCoalescer {
  private inFlight = new Map<string, Promise<unknown>>();

  /**
   * Coalesces concurrent operations for the same key onto a single shared promise.
   */
  async coalesce<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      logger.debug(`Coalescing request for in-flight key: ${key}`);
      return existing as Promise<T>;
    }

    const promise = (async () => {
      try {
        return await fn();
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  getPendingCount(): number {
    return this.inFlight.size;
  }
}

export const requestCoalescer = new RequestCoalescer();
