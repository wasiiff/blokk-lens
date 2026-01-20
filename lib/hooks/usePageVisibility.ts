import { useEffect, useState } from 'react'

/**
 * Hook to detect if page is visible
 * Prevents API calls when user is not on the page
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check if document is visible on mount
    setIsVisible(!document.hidden)

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
      console.log(`[PageVisibility] Page is now ${document.hidden ? 'hidden' : 'visible'}`)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}
