/**
 * Super Fast API Cache Manager with Dynamic Cache Busting
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheConfig {
  ttl: number // Time to live in milliseconds
  staleTime: number // Time before data is considered stale
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, Promise<any>>()
  private defaultConfig: CacheConfig = {
    ttl: 180000, // 3 minutes
    staleTime: 60000, // 1 minute
  }

  /**
   * Get data from cache or fetch if not available
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: Partial<CacheConfig>
  ): Promise<T> {
    const { ttl, staleTime } = { ...this.defaultConfig, ...config }
    const now = Date.now()

    // Check if data exists in cache
    const cached = this.cache.get(key)
    
    if (cached) {
      const age = now - cached.timestamp
      
      // Return fresh data immediately
      if (age < staleTime) {
        console.log(`[Cache] Fresh hit: ${key}`)
        return cached.data
      }
      
      // Return stale data but trigger background refresh
      if (age < ttl) {
        console.log(`[Cache] Stale hit: ${key}, refreshing in background`)
        this.refreshInBackground(key, fetcher, config)
        return cached.data
      }
    }

    // Check if there's already a pending request for this key
    if (this.pendingRequests.has(key)) {
      console.log(`[Cache] Reusing pending request: ${key}`)
      return this.pendingRequests.get(key)!
    }

    // Fetch new data
    console.log(`[Cache] Miss: ${key}, fetching...`)
    const promise = this.fetchAndCache(key, fetcher, config)
    this.pendingRequests.set(key, promise)

    try {
      const data = await promise
      return data
    } finally {
      this.pendingRequests.delete(key)
    }
  }

  /**
   * Fetch data and store in cache
   */
  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: Partial<CacheConfig>
  ): Promise<T> {
    const { ttl } = { ...this.defaultConfig, ...config }
    
    try {
      const data = await fetcher()
      const now = Date.now()
      
      this.cache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + ttl,
      })
      
      return data
    } catch (error) {
      // If fetch fails, return stale data if available
      const cached = this.cache.get(key)
      if (cached) {
        console.log(`[Cache] Fetch failed, returning stale data: ${key}`)
        return cached.data
      }
      throw error
    }
  }

  /**
   * Refresh data in background without blocking
   */
  private refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: Partial<CacheConfig>
  ): void {
    // Don't wait for this
    this.fetchAndCache(key, fetcher, config).catch((error) => {
      console.error(`[Cache] Background refresh failed for ${key}:`, error)
    })
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
    console.log(`[Cache] Invalidated: ${key}`)
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keys = Array.from(this.cache.keys())
    keys.forEach((key) => {
      if (pattern.test(key)) {
        this.cache.delete(key)
        console.log(`[Cache] Invalidated: ${key}`)
      }
    })
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    console.log('[Cache] Cleared all cache')
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    const keys = Array.from(this.cache.keys())
    
    keys.forEach((key) => {
      const entry = this.cache.get(key)
      if (entry && entry.expiresAt < now) {
        this.cache.delete(key)
      }
    })
    
    console.log('[Cache] Cleanup completed')
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        expiresIn: entry.expiresAt - Date.now(),
      })),
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager()

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup()
  }, 300000)
}
