import type { CacheConfig } from '@/types/trading';

export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  static getInstance(config?: CacheConfig): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config || {
        enabled: true,
        ttl: 300,
        maxSize: 1000
      });
    }
    return CacheService.instance;
  }

  set(key: string, data: any): void {
    if (!this.config.enabled) return;

    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    if (!this.config.enabled) return null;

    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.config.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0
    };
  }
}

export const cacheService = CacheService.getInstance();