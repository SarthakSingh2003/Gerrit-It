import { LRUCache } from 'lru-cache';
import { ICacheService, CacheEntry } from './cache.interface.js';
import { logger } from '../logger/logger.js';

export class MemoryLruCache implements ICacheService {
  private cache: LRUCache<string, CacheEntry<unknown>>;
  private defaultTtlMs: number;

  constructor(maxItems = 1000, defaultTtlSeconds = 14400) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
    this.cache = new LRUCache<string, CacheEntry<unknown>>({
      max: maxItems,
      ttl: this.defaultTtlMs,
      updateAgeOnGet: false
    });
    logger.info('Initialized bounded in-memory LRU cache', {
      maxItems,
      defaultTtlSeconds
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttlMs = (ttlSeconds ?? this.defaultTtlMs / 1000) * 1000;
    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      storedAt: now,
      expiresAt: now + ttlMs,
      version: '1.0'
    };

    this.cache.set(key, entry as CacheEntry<unknown>, { ttl: ttlMs });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  getStats(): { type: 'memory'; size: number; isHealthy: boolean } {
    return {
      type: 'memory',
      size: this.cache.size,
      isHealthy: true
    };
  }
}
