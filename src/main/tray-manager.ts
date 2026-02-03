import { Tray, Menu, nativeImage, BrowserWindow, Notification } from 'electron'
import { join } from 'node:path'
import type { UsageData } from '@types/index'

export class TrayManager {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow | null = null
  private currentUsage: UsageData | null = null

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.createTray()
  }

  private createTray(): void {
    // Use a simple colored icon for development
    // In production, load from resources
    const icon = this.createStatusIcon('healthy')
    this.tray = new Tray(icon)

    this.updateMenu()
  }

  private createStatusIcon(status: 'healthy' | 'warning' | 'critical'): nativeImage {
    // Create a simple colored square as icon
    const size = 16
    const canvas = {
      data: Buffer.alloc(size * size * 4),
      width: size,
      height: size,
    }

    let color = { r: 34, g: 197, b: 94 } // green
    if (status === 'warning') {
      color = { r: 234, g: 179, b: 8 } // yellow
    } else if (status === 'critical') {
      color = { r: 239, g: 68, b: 68 } // red
    }

    // Fill with color
    for (let i = 0; i < size * size; i++) {
      canvas.data[i * 4] = color.r
      canvas.data[i * 4 + 1] = color.g
      canvas.data[i * 4 + 2] = color.b
      canvas.data[i * 4 + 3] = 255 // alpha
    }

    return nativeImage.createFromBuffer(canvas.data, {
      width: canvas.width,
      height: canvas.height,
    })
  }

  updateUsage(usage: UsageData | null): void {
    this.currentUsage = usage

    if (!this.tray) return

    // Update icon based on usage
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (usage) {
      if (usage.sessionPercent >= 80) status = 'critical'
      else if (usage.sessionPercent >= 50) status = 'warning'
    }

    const newIcon = this.createStatusIcon(status)
    this.tray.setImage(newIcon)

    this.updateMenu()
    this.updateTooltip()
  }

  private updateMenu(): void {
    if (!this.tray) return

    const percentText = this.currentUsage
      ? `${this.currentUsage.sessionPercent}% (${Math.round(this.currentUsage.sessionUsage / 1000)}K/${Math.round(this.currentUsage.sessionLimit / 1000)}K)`
      : 'Loading...'

    const template = [
      {
        label: `Usage Tracker - ${percentText}`,
        enabled: false,
      },
      { type: 'separator' as const },
      {
        label: 'Show Dashboard',
        click: () => this.showWindow(),
      },
      {
        label: 'Refresh',
        click: () => this.refreshUsage(),
      },
      { type: 'separator' as const },
      {
        label: 'Quit',
        click: () => this.quit(),
      },
    ]

    const contextMenu = Menu.buildFromTemplate(template)
    this.tray.setContextMenu(contextMenu)
  }

  private updateTooltip(): void {
    if (!this.tray || !this.currentUsage) {
      this.tray?.setToolTip('Usage Tracker\nLoading...')
      return
    }

    const usage = this.currentUsage
    const resetTime = new Date(usage.sessionResetTime)
    const timeUntilReset = this.formatTimeUntil(resetTime)

    this.tray.setToolTip(
      `Usage Tracker\n` +
      `Session: ${usage.sessionPercent}% (${Math.round(usage.sessionUsage / 1000)}K/${Math.round(usage.sessionLimit / 1000)}K tokens)\n` +
      `Weekly: ${usage.weeklyPercent}%\n` +
      `Resets in: ${timeUntilReset}`
    )
  }

  private formatTimeUntil(date: Date): string {
    const now = new Date()
    const diff = date.getTime() - now.getTime()

    if (diff <= 0) return 'soon'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  showNotification(title: string, body: string): void {
    if (Notification.isSupported()) {
      new Notification({ title, body, silent: false }).show()
    }
  }

  private showWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore()
      }
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }

  private refreshUsage(): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('refresh-usage')
    }
  }

  private quit(): void {
    if (this.mainWindow) {
      this.mainWindow.close()
    }
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}
