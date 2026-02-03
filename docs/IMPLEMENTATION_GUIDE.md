# Usage Tracker Implementation Guide

## Overview

This guide provides step-by-step instructions for building the **Usage Tracker** desktop application. The Usage Tracker is a standalone Electron app that monitors and displays token usage from the ZAI API in real-time, with system tray integration, local data persistence, and historical tracking.

## Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Electron** | Desktop application framework | ^39.2.7 |
| **React** | UI framework | ^19.2.3 |
| **TypeScript** | Type-safe JavaScript | ^5.9.3 |
| **Vite** | Build tool and dev server | ^7.2.7 |
| **Tailwind CSS** | Utility-first CSS framework | ^4.1.17 |
| **Zustand** | State management | ^5.0.9 |
| **date-fns** | Date manipulation | ^4.1.0 |
| **electron-builder** | Application packaging | ^26.4.0 |

## Project Structure

```
usage-tracker/
├── package.json                    # Project dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── electron.vite.config.ts         # Electron + Vite build configuration
├── electron-builder.json           # Packaging configuration
├── src/
│   ├── main/                       # Main process (Node.js)
│   │   ├── index.ts                # Main entry point
│   │   ├── ipc-handlers.ts         # IPC communication handlers
│   │   ├── api-service.ts          # ZAI API integration
│   │   ├── store-service.ts        # Local data persistence
│   │   └── tray-manager.ts         # System tray integration
│   ├── preload/                    # Preload scripts (secure bridge)
│   │   └── index.ts                # Exposed APIs to renderer
│   └── renderer/                   # Renderer process (React UI)
│       ├── index.html              # HTML entry point
│       ├── main.tsx                # React entry point
│       ├── App.tsx                 # Root component
│       ├── components/             # React components
│       │   ├── UsageDisplay.tsx    # Main usage display
│       │   ├── UsageStats.tsx      # Statistics cards
│       │   ├── SettingsPanel.tsx   # Configuration UI
│       │   ├── HistoryChart.tsx    # Historical data visualization
│       │   └── TrayMenu.tsx        # Tray popup
│       ├── stores/                 # State management
│       │   └── useUsageStore.ts    # Zustand store
│       ├── hooks/                  # Custom React hooks
│       │   ├── useUsageData.ts     # Fetch usage data
│       │   └── useInterval.ts      # Polling hook
│       ├── types/                  # TypeScript types
│       │   └── index.ts            # Shared interfaces
│       └── lib/                    # Utilities
│           └── utils.ts            # Helper functions
├── resources/                      # Build resources
│   ├── icon.ico                    # Windows icon
│   ├── icon.icns                   # macOS icon
│   └── icons/                      # Linux icons
└── dist/                           # Build output (generated)
```

---

## Step-by-Step Implementation

### Step 1: Initialize Electron + React Project

#### 1.1 Create Project Directory

```bash
mkdir usage-tracker
cd usage-tracker
```

#### 1.2 Initialize Package.json

```bash
npm init -y
```

#### 1.3 Install Core Dependencies

```bash
# Runtime dependencies
npm install electron react react-dom zustand date-fns

# Dev dependencies
npm install -D @vitejs/plugin-react typescript @types/react @types/react-dom
npm install -D vite electron-vite electron-builder tailwindcss postcss autoprefixer
npm install -D @electron-toolkit/utils @electron-toolkit/preload
```

#### 1.4 Configure package.json

```json
{
  "name": "usage-tracker",
  "version": "1.0.0",
  "description": "ZAI Usage Tracker Desktop App",
  "main": "out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "package": "electron-builder",
    "start": "electron ."
  },
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "zustand": "^5.0.9",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@electron-toolkit/preload": "^3.0.2",
    "@electron-toolkit/utils": "^4.0.0",
    "@types/node": "^25.0.0",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.2",
    "autoprefixer": "^10.4.22",
    "electron": "^39.2.7",
    "electron-builder": "^26.4.0",
    "electron-vite": "^5.0.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.17",
    "typescript": "^5.9.3",
    "vite": "^7.2.7"
  }
}
```

---

### Step 2: Set up TypeScript and Tailwind CSS

#### 2.1 TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/renderer/*"],
      "@components/*": ["src/renderer/components/*"],
      "@stores/*": ["src/renderer/stores/*"],
      "@hooks/*": ["src/renderer/hooks/*"],
      "@lib/*": ["src/renderer/lib/*"],
      "@types/*": ["src/renderer/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "out", "dist"]
}
```

#### 2.2 Tailwind CSS Configuration (tailwind.config.js)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

#### 2.3 PostCSS Configuration (postcss.config.js)

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

### Step 3: Create API Service Layer

#### 3.1 Type Definitions (src/renderer/types/index.ts)

```typescript
export interface UsageData {
  totalTokens: number
  remainingTokens: number
  usedTokens: number
  percentageUsed: number
  resetDate: string
  lastUpdated: string
}

export interface UsageHistory {
  date: string
  usedTokens: number
  percentageUsed: number
}

export interface Settings {
  apiKey: string
  refreshInterval: number // in seconds
  notificationsEnabled: boolean
  lowTokenThreshold: number // percentage
}

export interface ApiResponse {
  data: {
    usage: {
      total_tokens: number
      remaining_tokens: number
      reset_date: string
    }
  }
}
```

#### 3.2 API Service (src/main/api-service.ts)

```typescript
import axios from 'axios'

const ZAI_API_BASE = 'https://api.z.ai'
const ZAI_USAGE_ENDPOINT = '/v1/usage'

export class ApiService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async fetchUsage(): Promise<UsageData> {
    try {
      const response = await axios.get<ApiResponse>(
        `${ZAI_API_BASE}${ZAI_USAGE_ENDPOINT}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      const { total_tokens, remaining_tokens, reset_date } = response.data.data.usage
      const usedTokens = total_tokens - remaining_tokens
      const percentageUsed = (usedTokens / total_tokens) * 100

      return {
        totalTokens: total_tokens,
        remainingTokens: remaining_tokens,
        usedTokens,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        resetDate: reset_date,
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key')
        }
        throw new Error(`API request failed: ${error.message}`)
      }
      throw error
    }
  }
}
```

---

### Step 4: Build Usage Display Components

#### 4.1 Zustand Store (src/renderer/stores/useUsageStore.ts)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UsageData, UsageHistory, Settings } from '@types/index'

interface UsageStore {
  // State
  currentUsage: UsageData | null
  history: UsageHistory[]
  settings: Settings
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentUsage: (usage: UsageData) => void
  addToHistory: (entry: UsageHistory) => void
  updateSettings: (settings: Partial<Settings>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearHistory: () => void
}

export const useUsageStore = create<UsageStore>()(
  persist(
    (set) => ({
      // Initial state
      currentUsage: null,
      history: [],
      settings: {
        apiKey: '',
        refreshInterval: 300, // 5 minutes
        notificationsEnabled: true,
        lowTokenThreshold: 20, // 20%
      },
      isLoading: false,
      error: null,

      // Actions
      setCurrentUsage: (usage) => set({ currentUsage: usage, error: null }),

      addToHistory: (entry) =>
        set((state) => ({
          history: [...state.history.slice(-29), entry], // Keep last 30 entries
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'usage-tracker-storage',
      partialize: (state) => ({
        settings: state.settings,
        history: state.history,
      }),
    }
  )
)
```

#### 4.2 Custom Hook (src/renderer/hooks/useUsageData.ts)

```typescript
import { useEffect, useCallback } from 'react'
import { useUsageStore } from '@stores/useUsageStore'

export function useUsageData() {
  const {
    settings,
    setCurrentUsage,
    addToHistory,
    setLoading,
    setError,
    currentUsage
  } = useUsageStore()

  const fetchUsage = useCallback(async () => {
    if (!settings.apiKey) {
      setError('API key not configured')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call main process via IPC
      const usageData = await window.electron.ipcRenderer.invoke(
        'fetch-usage',
        settings.apiKey
      )

      setCurrentUsage(usageData)

      // Add to history once per day
      const today = new Date().toISOString().split('T')[0]
      const lastEntry = currentUsage?.history?.[currentUsage.history.length - 1]

      if (lastEntry?.date !== today) {
        addToHistory({
          date: today,
          usedTokens: usageData.usedTokens,
          percentageUsed: usageData.percentageUsed,
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch usage')
    } finally {
      setLoading(false)
    }
  }, [settings.apiKey, setCurrentUsage, addToHistory, setLoading, setError, currentUsage])

  useEffect(() => {
    // Initial fetch
    fetchUsage()

    // Set up polling
    const interval = setInterval(
      fetchUsage,
      settings.refreshInterval * 1000
    )

    return () => clearInterval(interval)
  }, [fetchUsage, settings.refreshInterval])

  return { fetchUsage }
}
```

#### 4.3 Usage Display Component (src/renderer/components/UsageDisplay.tsx)

```tsx
import { useUsageStore } from '@stores/useUsageStore'
import { format } from 'date-fns'

export function UsageDisplay() {
  const { currentUsage, isLoading, error, settings } = useUsageStore()

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-800 dark:text-red-200 font-semibold">Error</h3>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUsage && isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (!currentUsage) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Configure your API key in settings to view usage data
        </p>
      </div>
    )
  }

  const isLowUsage = currentUsage.percentageUsed >= (100 - settings.lowTokenThreshold)
  const statusColor = isLowUsage ? 'text-red-600' : 'text-green-600'
  const progressColor = isLowUsage ? 'bg-red-500' : 'bg-green-500'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Token Usage
        </h2>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          <span className="text-xs text-gray-500">
            Updated {format(new Date(currentUsage.lastUpdated), 'HH:mm:ss')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentUsage.usedTokens.toLocaleString()} / {currentUsage.totalTokens.toLocaleString()} tokens
          </span>
          <span className={`text-sm font-semibold ${statusColor}`}>
            {currentUsage.percentageUsed.toFixed(1)}% used
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${currentUsage.percentageUsed}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {currentUsage.remainingTokens.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Used</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {currentUsage.usedTokens.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resets</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {format(new Date(currentUsage.resetDate), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Low Usage Warning */}
      {isLowUsage && settings.notificationsEnabled && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Low token warning: Only {currentUsage.remainingTokens.toLocaleString()} tokens remaining
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### Step 5: Implement Local Storage

#### 5.1 Store Service (src/main/store-service.ts)

```typescript
import { app } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const STORE_FILE_NAME = 'usage-tracker-store.json'

export class StoreService {
  private storePath: string
  private store: Record<string, unknown> = {}

  constructor() {
    this.storePath = join(app.getPath('userData'), STORE_FILE_NAME)
    this.load()
  }

  private async load(): Promise<void> {
    try {
      const data = await readFile(this.storePath, 'utf-8')
      this.store = JSON.parse(data)
    } catch {
      // File doesn't exist yet, use defaults
      this.store = {}
    }
  }

  private async save(): Promise<void> {
    await writeFile(this.storePath, JSON.stringify(this.store, null, 2))
  }

  get<T>(key: string, defaultValue: T): T {
    return (this.store[key] as T) ?? defaultValue
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store[key] = value
    await this.save()
  }

  async delete(key: string): Promise<void> {
    delete this.store[key]
    await this.save()
  }

  async clear(): Promise<void> {
    this.store = {}
    await this.save()
  }

  getAll(): Record<string, unknown> {
    return { ...this.store }
  }
}
```

---

### Step 6: Add System Tray Support

#### 6.1 Tray Manager (src/main/tray-manager.ts)

```typescript
import { Tray, Menu, nativeImage, BrowserWindow } from 'electron'
import { join } from 'node:path'

export class TrayManager {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow | null = null

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.createTray()
  }

  private createTray(): void {
    // Load icon based on platform
    const iconPath =
      process.platform === 'win32'
        ? join(__dirname, '../../resources/icon.ico')
        : join(__dirname, '../../resources/icon.png')

    const icon = nativeImage.createFromPath(iconPath)
    this.tray = new Tray(icon)

    this.updateMenu()
  }

  updateMenu(usageData?: { usedTokens: number; totalTokens: number; percentageUsed: number }): void {
    if (!this.tray) return

    const percentageText = usageData
      ? `${usageData.percentageUsed.toFixed(1)}% used (${usageData.usedTokens.toLocaleString()}/${usageData.totalTokens.toLocaleString()})`
      : 'Loading...'

    const template = [
      {
        label: `Usage: ${percentageText}`,
        enabled: false,
      },
      { type: 'separator' as const },
      {
        label: 'Show',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show()
            this.mainWindow.focus()
          }
        },
      },
      {
        label: 'Refresh',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.webContents.send('refresh-usage')
          }
        },
      },
      { type: 'separator' as const },
      {
        label: 'Quit',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.close()
          }
        },
      },
    ]

    const contextMenu = Menu.buildFromTemplate(template)
    this.tray.setContextMenu(contextMenu)

    // Set tooltip
    this.tray.setToolTip(`ZAI Usage Tracker\n${percentageText}`)
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}
```

---

### Step 7: Configure Electron Builder

#### 7.1 electron-builder.json

```json
{
  "appId": "com.yourcompany.usage-tracker",
  "productName": "Usage Tracker",
  "directories": {
    "output": "dist",
    "buildResources": "resources"
  },
  "files": [
    "out/**/*",
    "package.json"
  ],
  "mac": {
    "category": "public.app-category.utilities",
    "icon": "resources/icon.icns",
    "target": [
      "dmg",
      "zip"
    ]
  },
  "win": {
    "icon": "resources/icon.ico",
    "target": [
      "nsis",
      "zip"
    ]
  },
  "linux": {
    "icon": "resources/icons",
    "target": [
      "AppImage",
      "deb"
    ],
    "category": "Utility"
  },
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "usage-tracker"
  }
}
```

---

## IPC Handlers (src/main/ipc-handlers.ts)

```typescript
import { ipcMain } from 'electron'
import { ApiService } from './api-service'
import { StoreService } from './store-service'

export function registerIpcHandlers(
  apiService: ApiService,
  storeService: StoreService
): void {
  // Fetch usage data
  ipcMain.handle('fetch-usage', async (_event, apiKey: string) => {
    const service = new ApiService(apiKey)
    return await service.fetchUsage()
  })

  // Store operations
  ipcMain.handle('store-get', async (_event, key: string, defaultValue: unknown) => {
    return storeService.get(key, defaultValue)
  })

  ipcMain.handle('store-set', async (_event, key: string, value: unknown) => {
    await storeService.set(key, value)
  })

  ipcMain.handle('store-delete', async (_event, key: string) => {
    await storeService.delete(key)
  })

  ipcMain.handle('store-clear', async () => {
    await storeService.clear()
  })

  ipcMain.handle('store-getAll', async () => {
    return storeService.getAll()
  })
}
```

---

## Main Process Entry (src/main/index.ts)

```typescript
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc-handlers'
import { StoreService } from './store-service'
import { TrayManager } from './tray-manager'

let mainWindow: BrowserWindow | null = null
let trayManager: TrayManager | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    resizable: true,
    backgroundColor: '#f9fafb',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Initialize tray
  trayManager = new TrayManager(mainWindow)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.yourcompany.usage-tracker')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize services
  const storeService = new StoreService()
  registerIpcHandlers(null as never, storeService)

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  trayManager?.destroy()
})
```

---

## Testing Strategy

### Unit Tests (Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// components/UsageDisplay.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UsageDisplay } from './UsageDisplay'

describe('UsageDisplay', () => {
  it('shows loading state', () => {
    render(<UsageDisplay />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays usage data', () => {
    // Test implementation
  })
})
```

### E2E Tests (Playwright)

```bash
npm install -D @playwright/test
```

```typescript
// e2e/usage-tracker.spec.ts
import { test, expect } from '@playwright/test'

test('displays token usage', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await expect(page.locator('text=Token Usage')).toBeVisible()
})

test('allows API key configuration', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('button:has-text("Settings")')
  await page.fill('input[name="apiKey"]', 'test-key')
  await page.click('button:has-text("Save")')
  await expect(page.locator('text=Settings saved')).toBeVisible()
})
```

---

## Building & Packaging

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Package Applications

```bash
# All platforms
npm run package

# Specific platform
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

### Output Location

Built applications will be in the `dist/` directory:
- Windows: `dist/Usage Tracker Setup 1.0.0.exe`
- macOS: `dist/Usage Tracker-1.0.0.dmg`
- Linux: `dist/Usage Tracker-1.0.0.AppImage`

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Development
VITE_DEV_MODE=true

# API Configuration (for development testing)
VITE_ZAI_API_KEY=your-test-key-here

# Application Settings
VITE_DEFAULT_REFRESH_INTERVAL=300
VITE_DEFAULT_NOTIFICATION_THRESHOLD=20
```

---

## Quick Start Checklist

- [ ] Initialize project with `npm init`
- [ ] Install all dependencies
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Set up Tailwind CSS
- [ ] Create type definitions
- [ ] Implement API service
- [ ] Build Zustand store
- [ ] Create React components
- [ ] Set up IPC handlers
- [ ] Configure system tray
- [ ] Add local storage service
- [ ] Test all functionality
- [ ] Configure electron-builder
- [ ] Build and package

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution:** Ensure all dependencies are installed and `tsconfig.json` paths are correct.

### Issue: Tray icon not showing

**Solution:** Verify icon files exist in `resources/` directory and paths are correct for each platform.

### Issue: API returns 401 Unauthorized

**Solution:** Check that the API key is valid and properly formatted in settings.

### Issue: Data not persisting

**Solution:** Verify the `userData` path is writable and the store service is properly initialized.

---

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [electron-builder Documentation](https://www.electron.build/)
