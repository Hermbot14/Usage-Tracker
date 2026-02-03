import { create } from 'zustand'
import type { UsageData, UsageHistoryEntry, Settings } from '@/types'

interface UsageStore {
  // State
  currentUsage: UsageData | null
  history: UsageHistoryEntry[]
  settings: Settings
  isLoading: boolean
  error: string | null
  lastFetchTime: number | null
  isInitialized: boolean

  // Actions
  setCurrentUsage: (usage: UsageData) => void
  addToHistory: (entry: UsageHistoryEntry) => void
  updateSettings: (settings: Partial<Settings>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearHistory: () => void
  initializeFromStorage: (storedSettings: Settings) => void
}

const defaultSettings: Settings = {
  apiKey: '',
  baseUrl: 'https://api.z.ai/api/anthropic',
  refreshInterval: 30, // 30 seconds
  notificationsEnabled: true,
  alertThresholds: [80, 90, 100],
  soundAlertEnabled: false,
  retentionDays: 90,
}

export const useUsageStore = create<UsageStore>((set, get) => ({
  // Initial state
  currentUsage: null,
  history: [],
  settings: defaultSettings,
  isLoading: false,
  error: null,
  lastFetchTime: null,
  isInitialized: false,

  // Actions
  setCurrentUsage: (usage) => {
    set({ currentUsage: usage, error: null, lastFetchTime: Date.now() })

    // Add to history (once per day)
    const { history, settings } = get()
    const today = new Date().toISOString().split('T')[0]
    const lastEntry = history[history.length - 1]

    if (lastEntry?.date !== today) {
      const newEntry: UsageHistoryEntry = {
        date: today,
        sessionUsage: usage.sessionUsage,
        sessionPercent: usage.sessionPercent,
        weeklyUsage: usage.weeklyUsage,
        weeklyPercent: usage.weeklyPercent,
      }

      // Keep entries within retention period
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays)

      const filteredHistory = history.filter(
        (entry) => new Date(entry.date) >= cutoffDate
      )

      set({ history: [...filteredHistory, newEntry] })
    }

    // Save to persistent storage
    window.api.store.set('currentUsage', usage)
    window.api.store.set('lastFetchTime', Date.now())
  },

  addToHistory: (entry) =>
    set((state) => ({
      history: [...state.history.slice(-89), entry], // Keep last 90 days
    })),

  updateSettings: async (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings }
    set({ settings: updatedSettings })

    // Save to persistent storage
    await window.api.store.set('settings', updatedSettings)
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearHistory: () => set({ history: [] }),

  initializeFromStorage: (storedSettings) => {
    set({
      settings: { ...defaultSettings, ...storedSettings },
      isInitialized: true,
    })
  },
}))
