// ZAI API Response Types
export interface ZAILimit {
  type: 'TOKENS_LIMIT' | 'TIME_LIMIT'
  percentage: number
  unit?: string
  number?: number
  usage: number
  currentValue: number
  remaining?: number
  nextResetTime: number
  usageDetails?: {
    unit: string
    window: string
  }
}

export interface ZAIUsageResponse {
  data: {
    limits: ZAILimit[]
  }
}

// Application Types
export interface UsageData {
  sessionUsage: number
  sessionLimit: number
  sessionPercent: number
  sessionResetTime: string
  weeklyUsage: number
  weeklyLimit: number
  weeklyPercent: number
  weeklyResetTime: string
  lastUpdated: string
}

export interface UsageHistoryEntry {
  date: string
  sessionUsage: number
  sessionPercent: number
  weeklyUsage: number
  weeklyPercent: number
}

export interface Account {
  id: string
  name: string
  provider: 'zai' | 'anthropic' | 'openai'
  apiKey: string
  baseUrl: string
  isActive: boolean
}

// Overlay Mode Types
export type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface OverlaySettings {
  enabled: boolean
  position: OverlayPosition
  opacity: number // 50-100
  compact: boolean
  clickThrough: boolean
  showPercentage: boolean
  showProgressBar: boolean
}

export interface Settings {
  apiKey: string
  baseUrl: string
  refreshInterval: number // seconds
  notificationsEnabled: boolean
  alertThresholds: number[] // [80, 90, 100]
  soundAlertEnabled: boolean
  retentionDays: number
  overlayMode: OverlaySettings
}

export interface UsageSnapshot extends UsageData {
  accountId: string
  timestamp: number
}

export interface StoreState {
  accounts: Account[]
  activeAccountId: string | null
  currentUsage: UsageData | null
  history: UsageHistoryEntry[]
  settings: Settings
  isLoading: boolean
  error: string | null
  lastFetchTime: number | null
}

// Usage Status
export type UsageStatus = 'healthy' | 'warning' | 'critical'

export function getUsageStatus(percent: number): UsageStatus {
  if (percent >= 80) return 'critical'
  if (percent >= 50) return 'warning'
  return 'healthy'
}

// IPC Channel Types
export interface IpcChannels {
  'fetch-usage': { apiKey: string; baseUrl: string }
  'store-get': { key: string; defaultValue?: unknown }
  'store-set': { key: string; value: unknown }
  'store-delete': { key: string }
  'store-clear': never
  'store-getAll': never
  'show-notification': { title: string; body: string }
  'update-tray': { usage: UsageData | null }
  'minimize-to-tray': never
  'get-app-version': never
}
