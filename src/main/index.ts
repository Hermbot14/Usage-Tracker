import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { registerIpcHandlers } from './ipc-handlers'
import { StoreService } from './store-service'
import { TrayManager } from './tray-manager'

let mainWindow: BrowserWindow | null = null
let trayManager: TrayManager | null = null
let storeService: StoreService | null = null

// Simple is.dev check
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    resizable: true,
    backgroundColor: '#f9fafb',
    title: 'Usage Tracker',
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

  // Handle window close - hide to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!(app as any).isQuitting && mainWindow) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // When opening second instance, focus the main window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    app.setAppUserModelId('com.usage-tracker.app')

    // Initialize store service
    storeService = new StoreService()

    // Create window
    createWindow()

    // Initialize tray manager after window creation
    trayManager = new TrayManager(mainWindow!)

    // Register IPC handlers
    registerIpcHandlers(storeService, () => trayManager)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      // Don't quit, just hide to tray
      // User must explicitly quit from tray menu
    }
  })

  app.on('before-quit', () => {
    ;(app as any).isQuitting = true
    trayManager?.destroy()
  })

  app.on('will-quit', () => {
    trayManager?.destroy()
  })
}
