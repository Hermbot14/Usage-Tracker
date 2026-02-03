interface ElectronAPI {
  process: {
    platform: NodeJS.Platform
    versions: NodeJS.ProcessVersions
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fetchUsage: (apiKey: string, baseUrl: string) => Promise<{
        success: boolean
        data?: any
        error?: string
      }>
      store: {
        get: (key: string, defaultValue?: any) => Promise<any>
        set: (key: string, value: any) => Promise<{ success: boolean }>
        delete: (key: string) => Promise<{ success: boolean }>
        clear: () => Promise<{ success: boolean }>
        getAll: () => Promise<any>
      }
      showNotification: (title: string, body: string) => Promise<{ success: boolean }>
      updateTray: (usage: any) => Promise<{ success: boolean }>
      minimizeToTray: () => Promise<{ success: boolean }>
      getAppVersion: () => Promise<string>
      onRefreshUsage: (callback: () => void) => () => void
    }
  }
}

export {}
