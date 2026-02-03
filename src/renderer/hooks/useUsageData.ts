import { useEffect, useCallback, useRef } from 'react'
import { useUsageStore } from '@stores/useUsageStore'

export function useUsageData() {
  const {
    settings,
    setCurrentUsage,
    setLoading,
    setError,
    currentUsage,
    isInitialized,
  } = useUsageStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isFetchingRef = useRef(false)

  const fetchUsage = useCallback(async () => {
    if (!settings.apiKey) {
      setError('API key not configured')
      return
    }

    if (isFetchingRef.current) return

    isFetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await window.api.fetchUsage(settings.apiKey, settings.baseUrl)

      if (response.success && response.data) {
        setCurrentUsage(response.data)
        await window.api.updateTray(response.data)
      } else {
        setError(response.error || 'Failed to fetch usage')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch usage')
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [settings.apiKey, settings.baseUrl, setCurrentUsage, setLoading, setError])

  // Initialize from storage
  useEffect(() => {
    const initialize = async () => {
      try {
        const storedSettings = await window.api.store.get('settings', null)
        if (storedSettings) {
          useUsageStore.getState().initializeFromStorage(storedSettings)
        }

        // Load last known usage
        const storedUsage = await window.api.store.get('currentUsage', null)
        if (storedUsage) {
          useUsageStore.setState({ currentUsage: storedUsage })
          await window.api.updateTray(storedUsage)
        }

        // Load history
        const storedHistory = await window.api.store.get('history', [])
        if (storedHistory.length > 0) {
          useUsageStore.setState({ history: storedHistory })
        }
      } catch (error) {
        console.error('Failed to initialize from storage:', error)
      }
    }

    initialize()
  }, [])

  // Set up polling
  useEffect(() => {
    if (!settings.apiKey) return

    // Initial fetch
    fetchUsage()

    // Set up interval
    intervalRef.current = setInterval(() => {
      fetchUsage()
    }, settings.refreshInterval * 1000)

    // Listen for manual refresh requests
    const cleanupListener = window.api.onRefreshUsage(() => {
      fetchUsage()
    })

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      cleanupListener()
    }
  }, [fetchUsage, settings.refreshInterval, settings.apiKey])

  return { fetchUsage, currentUsage }
}
