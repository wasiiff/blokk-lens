import { useCallback } from 'react'
import { cacheManager } from '@/lib/cache-manager'

/**
 * Hook to manually bust cache when needed
 */
export function useCacheBuster() {
  const bustCache = useCallback((pattern?: string | RegExp) => {
    if (!pattern) {
      cacheManager.clear()
      console.log('[CacheBuster] Cleared all cache')
    } else if (typeof pattern === 'string') {
      cacheManager.invalidate(pattern)
      console.log(`[CacheBuster] Invalidated: ${pattern}`)
    } else {
      cacheManager.invalidatePattern(pattern)
      console.log(`[CacheBuster] Invalidated pattern: ${pattern}`)
    }
  }, [])

  const getCacheStats = useCallback(() => {
    return cacheManager.getStats()
  }, [])

  return {
    bustCache,
    getCacheStats,
  }
}
