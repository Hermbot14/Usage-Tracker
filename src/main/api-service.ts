import type { ZAIUsageResponse, UsageData } from '@types/index'

const ALLOWED_DOMAINS = new Set(['api.z.ai', 'z.ai', 'api.anthropic.com'])

export class ApiService {
  private baseUrl: string
  private apiKey: string

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async fetchUsage(): Promise<UsageData> {
    // Validate domain
    const url = new URL(this.baseUrl)
    if (!ALLOWED_DOMAINS.has(url.hostname)) {
      throw new Error(`Unauthorized domain: ${url.hostname}`)
    }

    // Construct usage endpoint
    const usageUrl = new URL('/api/monitor/usage/quota/limit', this.baseUrl)

    const response = await fetch(usageUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key or unauthorized access')
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later')
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data: ZAIUsageResponse = await response.json()
    return this.normalizeResponse(data)
  }

  private normalizeResponse(data: ZAIUsageResponse): UsageData {
    if (!data?.data?.limits || !Array.isArray(data.data.limits)) {
      throw new Error('Invalid API response format')
    }

    const tokensLimit = data.data.limits.find((item) => item.type === 'TOKENS_LIMIT')
    const timeLimit = data.data.limits.find((item) => item.type === 'TIME_LIMIT')

    const sessionPercent = tokensLimit?.percentage !== undefined
      ? Math.round(tokensLimit.percentage)
      : 0

    const weeklyPercent = timeLimit?.percentage !== undefined
      ? Math.round(timeLimit.percentage)
      : 0

    const now = new Date()
    let sessionResetTime: string

    if (tokensLimit?.nextResetTime && typeof tokensLimit.nextResetTime === 'number') {
      sessionResetTime = new Date(tokensLimit.nextResetTime).toISOString()
    } else {
      // Default: 5 hours from now
      sessionResetTime = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString()
    }

    // Weekly/monthly resets at the beginning of next month
    const nextMonth = new Date(now)
    nextMonth.setUTCMonth(now.getUTCMonth() + 1, 1)
    nextMonth.setUTCHours(0, 0, 0, 0)
    const weeklyResetTime = nextMonth.toISOString()

    return {
      sessionUsage: tokensLimit?.currentValue ?? 0,
      sessionLimit: tokensLimit?.usage ?? 500000,
      sessionPercent,
      sessionResetTime,
      weeklyUsage: timeLimit?.currentValue ?? 0,
      weeklyLimit: timeLimit?.usage ?? 1000,
      weeklyPercent,
      weeklyResetTime,
      lastUpdated: now.toISOString(),
    }
  }

  static credentialFingerprint(credential: string): string {
    if (!credential) return 'null'
    if (credential.length <= 16) {
      return credential.slice(0, 4) + '...' + credential.slice(-2)
    }
    return credential.slice(0, 8) + '...' + credential.slice(-4)
  }
}
