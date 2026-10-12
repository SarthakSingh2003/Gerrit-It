import { Redis } from 'ioredis';
import type { Redis as RedisClient } from 'ioredis';
import { ICacheService, CacheEntry } from './cache.interface.js';
import { logger } from '../logger/logger.js';

export class RedisCache implements ICacheService {
  private client: RedisClient | null = null;
  private isConnected = false;
  private defaultTtlSeconds: number;

  constructor(redisUrl: string, defaultTtlSeconds = 14400) {
    this.defaultTtlSeconds = defaultTtlSeconds;
    try {
      const redisInstance = new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        connectTimeout: 5000,
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.warn('Redis reconnection limit reached, running in degraded mode');
            return null; // Stop retrying
          }
          return Math.min(times * 500, 2000);
        }
      });

      this.client = redisInstance;

      redisInstance.on('connect', () => {
        this.isConnected = true;
        logger.info('Connected to Redis cache server');
      });

      redisInstance.on('error', (err: Error) => {
        this.isConnected = false;
        logger.warn('Redis cache connection error, gracefully degrading to fallback', {}, err);
      });

      redisInstance.on('close', () => {
        this.isConnected = false;
      });
    } catch (err) {
      this.client = null;
      this.isConnected = false;
      logger.warn('Failed to initialize Redis client, using fallback', {}, err);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) return null;
    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() > entry.expiresAt) {
        await this.del(key);
        return null;
      }
      return entry.value;
    } catch (err) {
      logger.warn(`Redis get failed for key ${key}`, {}, err);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      const ttl = ttlSeconds ?? this.defaultTtlSeconds;
      const now = Date.now();
      const entry: CacheEntry<T> = {
        value,
        storedAt: now,
        expiresAt: now + ttl * 1000,
        version: '1.0'
      };
      await this.client.set(key, JSON.stringify(entry), 'EX', ttl);
    } catch (err) {
      logger.warn(`Redis set failed for key ${key}`, {}, err);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (err) {
      logger.warn(`Redis del failed for key ${key}`, {}, err);
    }
  }

  async clear(): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.flushdb();
    } catch (err) {
      logger.warn('Redis clear failed', {}, err);
    }
  }

  async isHealthy(): Promise<boolean> {
    return this.isConnected;
  }

  getStats(): { type: 'redis'; size: number; isHealthy: boolean } {
    return {
      type: 'redis',
      size: -1,
      isHealthy: this.isConnected
    };
  }
}
