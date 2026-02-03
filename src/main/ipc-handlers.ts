import { ipcMain, app, BrowserWindow } from 'electron'
import { ApiService } from './api-service'
import { StoreService } from './store-service'
import type { UsageData } from '../renderer/types'

let trayManager: any = null
let usageRefreshInterval: NodeJS.Timeout | null = null

export function registerIpcHandlers(
  storeService: StoreService,
  getTrayManager: () => any
): void {
  trayManager = getTrayManager

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
