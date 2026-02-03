import { useUsageStore } from '@stores/useUsageStore'
import { format } from 'date-fns'

export function HistoryChart() {
  const { history } = useUsageStore()

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage History</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No history data available yet.</p>
      </div>
    )
  }

  const maxUsage = Math.max(...history.map((h) => h.sessionUsage))
  const avgUsage = history.reduce((sum, h) => sum + h.sessionUsage, 0) / history.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage History</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Last {history.length} days
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Peak</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {(maxUsage / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {(avgUsage / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {((history[history.length - 1]?.sessionUsage || 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-2">
        {history.slice(-7).map((entry, index) => {
          const heightPercent = maxUsage > 0 ? (entry.sessionUsage / maxUsage) * 100 : 0
          const barColor = entry.sessionPercent >= 80 ? 'bg-status-red' : entry.sessionPercent >= 50 ? 'bg-status-yellow' : 'bg-status-green'

          return (
            <div key={entry.date} className="flex items-center gap-3">
              <span className="w-20 text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(entry.date), 'MMM d')}
              </span>
              <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-300`}
                  style={{ width: `${heightPercent}%` }}
                />
              </div>
              <span className="w-16 text-right text-xs text-gray-600 dark:text-gray-400">
                {(entry.sessionUsage / 1000).toFixed(0)}K
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
