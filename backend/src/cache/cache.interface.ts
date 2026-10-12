export interface CacheEntry<T> {
  value: T;
  storedAt: number; // epoch ms
  expiresAt: number; // epoch ms
  version: string;
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
  isHealthy(): Promise<boolean>;
  getStats(): { type: 'redis' | 'memory'; size: number; isHealthy: boolean };
}
