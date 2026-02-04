import { ipcMain, app, BrowserWindow, screen } from 'electron'
import { ApiService } from './api-service'
import { StoreService } from './store-service'
import type { UsageData } from '../renderer/types'

let trayManager: any = null
let usageRefreshInterval: NodeJS.Timeout | null = null
let getMainWindow: () => BrowserWindow | null = () => null
let recreateWindow: ((overlayMode: boolean) => void) | null = null

export function registerIpcHandlers(
  storeService: StoreService,
  getTrayManager: () => any,
  getWindow: () => BrowserWindow | null,
  recreateWindowFn?: (overlayMode: boolean) => void
): void {
  trayManager = getTrayManager
  getMainWindow = getWindow
  recreateWindow = recreateWindowFn || null

  // Fetch usage data
  ipcMain.handle('fetch-usage', async (_event, apiKey: string, baseUrl: string) => {
    try {
      const service = new ApiService(apiKey, baseUrl)
      const usage = await service.fetchUsage()

      // Update tray with new data
      if (trayManager) {
        trayManager().updateUsage(usage)
      }

      // Check for alerts
      await checkAlertThresholds(usage, storeService)

      return { success: true, data: usage }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch usage'
      return { success: false, error: message }
    }
  })

  // Store operations
  ipcMain.handle('store-get', async (_event, key: string, defaultValue?: unknown) => {
    return storeService.get(key, defaultValue)
  })

  ipcMain.handle('store-set', async (_event, key: string, value: unknown) => {
    await storeService.set(key, value)
    return { success: true }
  })

  ipcMain.handle('store-delete', async (_event, key: string) => {
    await storeService.delete(key)
    return { success: true }
  })

  ipcMain.handle('store-clear', async () => {
    await storeService.clear()
    return { success: true }
  })

  ipcMain.handle('store-getAll', async () => {
    return storeService.getAll()
  })

  // Show notification
  ipcMain.handle('show-notification', async (_event, title: string, body: string) => {
    if (trayManager) {
      trayManager().showNotification(title, body)
    }
    return { success: true }
  })

  // Update tray
  ipcMain.handle('update-tray', async (_event, usage: UsageData | null) => {
    if (trayManager) {
      trayManager().updateUsage(usage)
    }
    return { success: true }
  })

  // Get app version
  ipcMain.handle('get-app-version', async () => {
    return app.getVersion()
  })

  // Minimize to tray
  ipcMain.handle('minimize-to-tray', async (_event) => {
    const window = BrowserWindow.fromWebContents(_event.sender)
    if (window) {
      window.hide()
    }
    return { success: true }
  })

  // Set overlay mode (toggles overlay mode, requires window recreation)
  ipcMain.handle('set-overlay-mode', async (_event, enabled: boolean) => {
    try {
      const window = BrowserWindow.fromWebContents(_event.sender)
      if (!window) {
        return { success: false, error: 'Window not found' }
      }

      // Get current window bounds before closing
      const bounds = window.getBounds()

      // Store bounds for later restoration (only when NOT already in overlay mode)
      // This preserves the normal window bounds before switching to overlay
      const currentOverlayMode = storeService.get('overlayMode', false)
      if (!currentOverlayMode && enabled) {
        await storeService.set('windowBounds', bounds)
      }

      // If exiting overlay mode, restore the previous window bounds
      if (!enabled) {
        const previousBounds = storeService.get('windowBounds')
        if (previousBounds) {
          window.setBounds(previousBounds)
        }
      }

      // Close current window
      window.close()

      // Recreate window with new overlay mode configuration
      if (recreateWindow) {
        recreateWindow(enabled)
      } else {
        return { success: false, error: 'Window recreation not available' }
      }

      // Store overlay mode state
      await storeService.set('overlayMode', enabled)

      // Update window reference in tray manager after delay
      setTimeout(() => {
        const newWindow = getMainWindow()
        if (newWindow && trayManager) {
          trayManager().updateMainWindow(newWindow)
        }
      }, 100)

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set overlay mode'
      return { success: false, error: message }
    }
  })

  // Set click-through (enables/disables click-through)
  ipcMain.handle('set-click-through', async (_event, enabled: boolean) => {
    try {
      const window = BrowserWindow.fromWebContents(_event.sender)
      if (!window) {
        return { success: false, error: 'Window not found' }
      }

      // Set ignore mouse events (click-through)
      window.setIgnoreMouseEvents(enabled)

      // Store click-through state
      await storeService.set('clickThrough', enabled)

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set click-through'
      return { success: false, error: message }
    }
  })

  // Set overlay position (moves overlay to corners)
  ipcMain.handle('set-overlay-position', async (_event, position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    try {
      const window = BrowserWindow.fromWebContents(_event.sender)
      if (!window) {
        return { success: false, error: 'Window not found' }
      }

      // Get screen bounds
      const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
      const { width, height } = display.workArea
      const windowBounds = window.getBounds()
      const margin = 20

      // Calculate coordinates for each corner
      let x: number
      let y: number

      switch (position) {
        case 'top-left':
          x = margin
          y = margin
          break
        case 'top-right':
          x = width - windowBounds.width - margin
          y = margin
          break
        case 'bottom-left':
          x = margin
          y = height - windowBounds.height - margin
          break
        case 'bottom-right':
          x = width - windowBounds.width - margin
          y = height - windowBounds.height - margin
          break
        default:
          return { success: false, error: 'Invalid position' }
      }

      // Set window bounds
      window.setBounds({ x, y })

      // Store overlay position
      await storeService.set('overlayPosition', position)

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set overlay position'
      return { success: false, error: message }
    }
  })
}

async function checkAlertThresholds(
  usage: UsageData,
  storeService: StoreService
): Promise<void> {
  const settings = storeService.get('settings', {
    notificationsEnabled: true,
    alertThresholds: [80, 90, 100],
  })

  if (!settings.notificationsEnabled) return

  const lastAlertLevel = storeService.get('lastAlertLevel', -1)

  for (const threshold of settings.alertThresholds) {
    if (usage.sessionPercent >= threshold && lastAlertLevel < threshold) {
      // Store the alert level so we don't alert again for this threshold
      await storeService.set('lastAlertLevel', threshold)

      // Show notification
      if (trayManager) {
        const urgency = threshold >= 90 ? 'URGENT' : 'Warning'
        trayManager().showNotification(
          `${urgency}: Usage at ${usage.sessionPercent}%`,
          `You've used ${usage.sessionUsage.toLocaleString()} of ${usage.sessionLimit.toLocaleString()} tokens.`
        )
      }
      break
    }
  }

  // Reset alert level if usage dropped
  if (usage.sessionPercent < settings.alertThresholds[0]) {
    await storeService.set('lastAlertLevel', -1)
  }
}
