import { ICacheService } from './cache.interface.js';
import { MemoryLruCache } from './memory.lru.cache.js';
import { RedisCache } from './redis.cache.js';
import { env } from '../config/env.js';
import { logger } from '../logger/logger.js';

let cacheInstance: ICacheService | null = null;
let memoryFallback: MemoryLruCache | null = null;

export function getCacheService(): ICacheService {
  if (cacheInstance) {
    return cacheInstance;
  }

  memoryFallback = new MemoryLruCache(
    env.CACHE_MAX_MEMORY_ITEMS,
    env.CACHE_TTL_SECONDS
  );

  if (env.REDIS_URL && env.REDIS_URL.trim() !== '') {
    try {
      const redis = new RedisCache(env.REDIS_URL, env.CACHE_TTL_SECONDS);
      cacheInstance = {
        async get<T>(key: string): Promise<T | null> {
          if (await redis.isHealthy()) {
            const val = await redis.get<T>(key);
            if (val !== null) return val;
          }
          return memoryFallback!.get<T>(key);
        },
        async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
          if (await redis.isHealthy()) {
            await redis.set(key, value, ttlSeconds);
          }
          await memoryFallback!.set(key, value, ttlSeconds);
        },
        async del(key: string): Promise<void> {
          if (await redis.isHealthy()) {
            await redis.del(key);
          }
          await memoryFallback!.del(key);
        },
        async clear(): Promise<void> {
          if (await redis.isHealthy()) {
            await redis.clear();
          }
          await memoryFallback!.clear();
        },
        async isHealthy(): Promise<boolean> {
          return true; // We always have memory fallback
        },
        getStats() {
          return redis.getStats().isHealthy ? redis.getStats() : memoryFallback!.getStats();
        }
      };
      logger.info('Initialized hybrid Redis/Memory cache tier');
      return cacheInstance;
    } catch (err) {
      logger.warn('Failed to initialize Redis tier, falling back to in-memory LRU', {}, err);
    }
  }

  cacheInstance = memoryFallback;
  return cacheInstance;
}

/**
 * Creates standardized cache keys separating canonical ID, query type, and date range.
 */
export function buildCacheKey(
  type: 'contributor' | 'summary' | 'changes' | 'reviews' | 'report',
  identifier: string | number,
  options?: { after?: string; before?: string; version?: string }
): string {
  const version = options?.version || 'v1';
  const range = `${options?.after || 'all'}_${options?.before || 'all'}`;
  return `wgt:${type}:${String(identifier).toLowerCase()}:${range}:${version}`;
}
