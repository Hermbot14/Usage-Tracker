import { useState } from 'react'
import { useUsageStore } from '@stores/useUsageStore'
import { useUsageData } from '@hooks/useUsageData'

export function SettingsPanel() {
  const { settings, updateSettings } = useUsageStore()
  const { fetchUsage } = useUsageData()
  const [isOpen, setIsOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState({ ...settings })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleChange = (field: keyof typeof localSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await updateSettings(localSettings)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)

      // Fetch usage with new settings
      if (localSettings.apiKey) {
        await fetchUsage()
      }
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const maskApiKey = (key: string) => {
    if (!key) return ''
    if (key.length <= 16) return key.slice(0, 4) + '...' + key.slice(-2)
    return key.slice(0, 8) + '...' + key.slice(-4)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Settings"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Configuration */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">API Configuration</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={localSettings.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  placeholder={settings.apiKey ? maskApiKey(settings.apiKey) : 'Enter your API key'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="baseUrl" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Base URL
                </label>
                <input
                  id="baseUrl"
                  type="text"
                  value={localSettings.baseUrl}
                  onChange={(e) => handleChange('baseUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Refresh Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Refresh Settings</h3>
            <div>
              <label htmlFor="refreshInterval" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Refresh Interval: {localSettings.refreshInterval} seconds
              </label>
              <input
                id="refreshInterval"
                type="range"
                min="10"
                max="300"
                step="10"
                value={localSettings.refreshInterval}
                onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>5 min</span>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Alert Thresholds</h3>
            <div className="flex gap-2">
              {[80, 90, 100].map((threshold) => (
                <label key={threshold} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.alertThresholds.includes(threshold)}
                    onChange={(e) => {
                      const newThresholds = e.target.checked
                        ? [...localSettings.alertThresholds, threshold]
                        : localSettings.alertThresholds.filter((t) => t !== threshold)
                      handleChange('alertThresholds', newThresholds)
                    }}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{threshold}%</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Notifications</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.notificationsEnabled}
                  onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Enable desktop notifications</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.soundAlertEnabled}
                  onChange={(e) => handleChange('soundAlertEnabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Enable sound alerts</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-600">Settings saved!</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-600">Failed to save</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
