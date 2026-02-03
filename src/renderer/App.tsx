import { UsageDisplay } from '@components/UsageDisplay'
import { SettingsPanel } from '@components/SettingsPanel'
import { HistoryChart } from '@components/HistoryChart'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Usage Tracker</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">ZAI/GLM API Monitor</p>
              </div>
            </div>
            <button
              onClick={() => window.api.minimizeToTray()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Minimize to tray"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <UsageDisplay />
        <HistoryChart />

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Running in background. Access anytime from the system tray.
          </p>
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsPanel />
    </div>
  )
}

export default App
