import { create } from 'zustand'
import type {
  UsageData,
  UsageHistoryEntry,
  Settings,
  AccountConfig,
  AccountUsageState,
  ProviderInfo,
  LocalAccountInfo,
} from '@/types'

interface UsageStore {
  // State
  currentUsage: UsageData | null
  history: UsageHistoryEntry[]
  settings: Settings
  isLoading: boolean
  error: string | null
  lastFetchTime: number | null
  isInitialized: boolean

  // Multi-account state
  accounts: AccountConfig[]
  accountUsage: Record<string, AccountUsageState>
  providers: ProviderInfo[]
  localAccounts: LocalAccountInfo[]

  // Actions
  setCurrentUsage: (usage: UsageData) => void
  addToHistory: (entry: UsageHistoryEntry) => void
  updateSettings: (settings: Partial<Settings>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearHistory: () => void
  initializeFromStorage: (storedSettings: Settings) => void

  // Multi-account actions
  setAccounts: (accounts: AccountConfig[]) => void
  addAccount: (account: AccountConfig) => Promise<void>
  removeAccount: (id: string) => Promise<void>
  setAccountUsage: (id: string, state: AccountUsageState) => void
  setProviders: (providers: ProviderInfo[]) => void
  setLocalAccounts: (local: LocalAccountInfo[]) => void
}

const defaultSettings: Settings = {
  apiKey: '',
  baseUrl: 'https://api.z.ai/api/anthropic',
  refreshInterval: 5, // 5 seconds
  notificationsEnabled: true,
  alertThresholds: [80, 90, 100],
  soundAlertEnabled: false,
  retentionDays: 90,
  overlayMode: {
    enabled: false,
    position: 'top-right',
    opacity: 95,
    compact: true,
    clickThrough: false,
    showPercentage: true,
    showProgressBar: true,
  },
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
  accounts: [],
  accountUsage: {},
  providers: [],
  localAccounts: [],

  // Actions
  setCurrentUsage: (usage) => {
    try {
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

      // Save to persistent storage with error handling
      try {
        window.api.store.set('currentUsage', usage)
        window.api.store.set('lastFetchTime', Date.now())
      } catch (storageError) {
        console.error('Failed to save usage to storage:', storageError)
        // Don't throw - storage errors shouldn't crash the app
      }
    } catch (error) {
      console.error('Error in setCurrentUsage:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  addToHistory: (entry) =>
    set((state) => ({
      history: [...state.history.slice(-89), entry], // Keep last 90 days
    })),

  updateSettings: async (newSettings) => {
    try {
      const updatedSettings = { ...get().settings, ...newSettings }
      set({ settings: updatedSettings })

      // Save to persistent storage
      await window.api.store.set('settings', updatedSettings)
    } catch (error) {
      console.error('Failed to update settings:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to save settings' })
      throw error // Re-throw for UI to handle
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearHistory: () => set({ history: [] }),

  initializeFromStorage: (storedSettings) => {
    try {
      // Safely merge with defaults - handle partial or invalid data
      const safeSettings: Settings = {
        apiKey: storedSettings?.apiKey || defaultSettings.apiKey,
        baseUrl: storedSettings?.baseUrl || defaultSettings.baseUrl,
        refreshInterval: storedSettings?.refreshInterval ?? defaultSettings.refreshInterval,
        notificationsEnabled: storedSettings?.notificationsEnabled ?? defaultSettings.notificationsEnabled,
        alertThresholds: Array.isArray(storedSettings?.alertThresholds)
          ? storedSettings.alertThresholds
          : defaultSettings.alertThresholds,
        soundAlertEnabled: storedSettings?.soundAlertEnabled ?? defaultSettings.soundAlertEnabled,
        retentionDays: storedSettings?.retentionDays ?? defaultSettings.retentionDays,
        overlayMode: {
          enabled: storedSettings?.overlayMode?.enabled ?? defaultSettings.overlayMode.enabled,
          position: storedSettings?.overlayMode?.position || defaultSettings.overlayMode.position,
          opacity: storedSettings?.overlayMode?.opacity ?? defaultSettings.overlayMode.opacity,
          compact: storedSettings?.overlayMode?.compact ?? defaultSettings.overlayMode.compact,
          clickThrough: storedSettings?.overlayMode?.clickThrough ?? defaultSettings.overlayMode.clickThrough,
          showPercentage: storedSettings?.overlayMode?.showPercentage ?? defaultSettings.overlayMode.showPercentage,
          showProgressBar: storedSettings?.overlayMode?.showProgressBar ?? defaultSettings.overlayMode.showProgressBar,
        },
      }

      set({
        settings: safeSettings,
        isInitialized: true,
      })
    } catch (error) {
      console.error('Failed to initialize from storage, using defaults:', error)
      set({
        settings: defaultSettings,
        isInitialized: true,
      })
    }
  },

  // ---- Multi-account actions ----------------------------------------------

  setAccounts: (accounts) => set({ accounts }),

  addAccount: async (account) => {
    const accounts = [...get().accounts.filter((a) => a.id !== account.id), account]
    set({ accounts })
    set((state) => ({ accountUsage: { ...state.accountUsage, [account.id]: { status: 'loading' } } }))
    try {
      await window.api.store.set('accounts', accounts)
    } catch (error) {
      console.error('Failed to persist accounts:', error)
    }
  },

  removeAccount: async (id) => {
    const accounts = get().accounts.filter((a) => a.id !== id)
    const accountUsage = { ...get().accountUsage }
    delete accountUsage[id]
    set({ accounts, accountUsage })
    try {
      await window.api.store.set('accounts', accounts)
    } catch (error) {
      console.error('Failed to persist accounts:', error)
    }
  },

  setAccountUsage: (id, state) =>
    set((s) => ({ accountUsage: { ...s.accountUsage, [id]: state } })),

  setProviders: (providers) => set({ providers }),

  setLocalAccounts: (localAccounts) => set({ localAccounts }),
}))
