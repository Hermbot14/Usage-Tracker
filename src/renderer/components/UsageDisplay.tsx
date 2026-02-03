import { useUsageStore } from '@stores/useUsageStore'
import { formatTimeRemaining, getUsageColor, getProgressColor, formatNumber } from '@lib/utils'
import { format } from 'date-fns'

export function UsageDisplay() {
  const { currentUsage, isLoading, error, settings } = useUsageStore()

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-status-red rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-red-800 dark:text-red-200 font-semibold">Connection Error</h3>
            <p className="text-red-600 dark:text-red-400 text-sm break-words">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUsage && isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentUsage) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your API key in settings to view usage data
        </p>
      </div>
    )
  }

  const sessionStatusColor = getUsageColor(currentUsage.sessionPercent)
  const sessionProgressColor = getProgressColor(currentUsage.sessionPercent)
  const weeklyStatusColor = getUsageColor(currentUsage.weeklyPercent)
  const weeklyProgressColor = getProgressColor(currentUsage.weeklyPercent)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Token Usage
        </h2>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Updated {format(new Date(currentUsage.lastUpdated), 'HH:mm:ss')}
          </span>
        </div>
      </div>

      {/* Session Usage (5 Hours) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Session Usage (5 Hours)
          </span>
          <span className={`text-sm font-semibold ${sessionStatusColor}`}>
            {currentUsage.sessionPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${sessionProgressColor} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(currentUsage.sessionPercent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatNumber(currentUsage.sessionUsage)} / {formatNumber(currentUsage.sessionLimit)} tokens</span>
          <span>Resets in: {formatTimeRemaining(currentUsage.sessionResetTime)}</span>
        </div>
      </div>

      {/* Weekly Usage (Monthly Tools) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Monthly Tools Usage
          </span>
          <span className={`text-sm font-semibold ${weeklyStatusColor}`}>
            {currentUsage.weeklyPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${weeklyProgressColor} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(currentUsage.weeklyPercent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{currentUsage.weeklyUsage} / {currentUsage.weeklyLimit} calls</span>
          <span>Resets: {format(new Date(currentUsage.weeklyResetTime), 'MMM d')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Session Remaining</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(currentUsage.sessionLimit - currentUsage.sessionUsage)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Session Used</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(currentUsage.sessionUsage)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tools Remaining</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {currentUsage.weeklyLimit - currentUsage.weeklyUsage}
          </p>
        </div>
      </div>

      {/* Critical Warning */}
      {currentUsage.sessionPercent >= 80 && settings.notificationsEnabled && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-status-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>High Usage Alert:</strong> You've used {currentUsage.sessionPercent}% of your token quota.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
