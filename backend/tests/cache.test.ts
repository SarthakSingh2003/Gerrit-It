import { describe, it, expect } from 'vitest';
import { MemoryLruCache } from '../src/cache/memory.lru.cache.js';
import { buildCacheKey } from '../src/cache/index.js';

describe('Cache Layer & In-Memory LRU Fallback', () => {
  it('stores and retrieves cache entries within TTL', async () => {
    const cache = new MemoryLruCache(10, 60);
    await cache.set('test_key', { foo: 'bar' });

    const result = await cache.get<{ foo: string }>('test_key');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('evicts oldest items when max items limit is reached', async () => {
    const cache = new MemoryLruCache(2, 60);
    await cache.set('k1', 'val1');
    await cache.set('k2', 'val2');
    await cache.set('k3', 'val3');

    // k1 should be evicted because max is 2
    const k1 = await cache.get('k1');
    const k3 = await cache.get('k3');
    expect(k1).toBeNull();
    expect(k3).toBe('val3');
  });

  it('deletes and clears cache entries on request', async () => {
    const cache = new MemoryLruCache(10, 60);
    await cache.set('del_me', 123);
    await cache.del('del_me');
    expect(await cache.get('del_me')).toBeNull();

    await cache.set('c1', 1);
    await cache.set('c2', 2);
    await cache.clear();
    expect(await cache.get('c1')).toBeNull();
    expect(await cache.get('c2')).toBeNull();
  });

  it('builds standardized namespaced cache keys', () => {
    const key = buildCacheKey('summary', 458, { after: '2024-01-01', before: '2024-12-31' });
    expect(key).toBe('wgt:summary:458:2024-01-01_2024-12-31:v1');
  });
});
