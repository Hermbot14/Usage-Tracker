export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatTimeRemaining(resetTime: string): string {
  const now = new Date()
  const reset = new Date(resetTime)
  const diff = reset.getTime() - now.getTime()

  if (diff <= 0) return 'Reseting soon...'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

export function getUsageColor(percent: number): string {
  if (percent >= 80) return 'text-status-red'
  if (percent >= 50) return 'text-status-yellow'
  return 'text-status-green'
}

export function getProgressColor(percent: number): string {
  if (percent >= 80) return 'bg-status-red'
  if (percent >= 50) return 'bg-status-yellow'
  return 'bg-status-green'
}

export function getUsageStatus(percent: number): 'healthy' | 'warning' | 'critical' {
  if (percent >= 80) return 'critical'
  if (percent >= 50) return 'warning'
  return 'healthy'
}
