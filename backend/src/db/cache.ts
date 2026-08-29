import { createClient } from 'redis';
import { ENV } from '../config/env.js';

interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  clearPattern(pattern: string): Promise<void>;
}

// Memory Fallback Cache Client
class MemoryCacheClient implements CacheClient {
  private cache = new Map<string, { value: any; expiry: number | null }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiry !== null && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Redis Cache Client with Automatic Graceful Fallback
class RedisCacheClient implements CacheClient {
  private client: any = null;
  private isConnected = false;
  private fallback = new MemoryCacheClient();

  constructor() {
    if (!ENV.USE_REDIS) {
      console.log('ℹ️ Redis caching is disabled (USE_REDIS=false). Using in-memory fallback cache.');
      return;
    }

    try {
      this.client = createClient({
        url: ENV.REDIS_URL,
      });

      this.client.on('error', (err: any) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔌 Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        this.isConnected = true;
      });

      this.client.on('end', () => {
        this.isConnected = false;
      });

      // Async connection
      this.client.connect().catch((err: any) => {
        console.error('❌ Failed to connect to Redis on startup. Operating with in-memory fallback.', err);
        this.isConnected = false;
      });
    } catch (err) {
      console.error('❌ Redis initialization failed. Operating with in-memory fallback.', err);
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const val = await this.client.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        console.warn(`[Cache] Redis get failed for ${key}, falling back to memory.`, err);
      }
    }
    return this.fallback.get<T>(key);
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        const valStr = JSON.stringify(value);
        if (ttlSeconds) {
          await this.client.setEx(key, ttlSeconds, valStr);
        } else {
          await this.client.set(key, valStr);
        }
        return;
      } catch (err) {
        console.warn(`[Cache] Redis set failed for ${key}, falling back to memory.`, err);
      }
    }
    await this.fallback.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        console.warn(`[Cache] Redis del failed for ${key}, falling back to memory.`, err);
      }
    }
    await this.fallback.del(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    // Invalidate local fallback first
    await this.fallback.clearPattern(pattern);

    if (this.isConnected && this.client) {
      try {
        const keysToDelete: string[] = [];
        for await (const key of this.client.scanIterator({ MATCH: pattern })) {
          keysToDelete.push(key);
        }
        if (keysToDelete.length > 0) {
          await this.client.del(keysToDelete);
        }
      } catch (err) {
        console.warn(`[Cache] Redis clearPattern failed for ${pattern}`, err);
      }
    }
  }
}

export const cache = new RedisCacheClient();
