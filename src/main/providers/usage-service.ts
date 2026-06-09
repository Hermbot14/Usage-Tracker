/**
 * Multi-provider usage service
 *
 * Replaces the single-provider api-service.ts. Given an account, it resolves the
 * usage endpoint and credential from the registry, fetches, and normalizes the
 * response to NormalizedUsage. This is the runtime core extracted from Aperant's
 * usage-monitor.ts, minus the auto-switch/profile-scoring machinery (not needed
 * for a usage tracker).
 */

import type { UsageData } from '../../renderer/types'
import type { FetchUsageResult, NormalizedUsage, ProviderId } from './types'
import { getProvider, getUsageEndpoint } from './registry'
import { readLocalCredential } from './credentials'
import { normalizeAnthropic, normalizeCodex, normalizeZai } from './normalizers'

const REQUEST_TIMEOUT_MS = 12_000

export interface UsageAccount {
  id: string
  name: string
  provider: ProviderId
  /** API key for `apiKey`/`oauthPaste` providers. Ignored for `oauthLocal`. */
  apiKey?: string
  /** Optional base-URL override (e.g. a regional ZAI/Zhipu endpoint). */
  baseUrl?: string
}

interface ResolvedCredential {
  token: string | null
  accountId?: string | null
  email?: string | null
  error?: string
}

function resolveCredential(account: UsageAccount): ResolvedCredential {
  const desc = getProvider(account.provider)
  if (desc.auth === 'oauthLocal' && desc.localCredential) {
    const local = readLocalCredential(desc.localCredential)
    return { token: local.token, accountId: local.accountId, email: local.email, error: local.error }
  }
  // apiKey or pasted OAuth token
  const key = account.apiKey?.trim()
  return key ? { token: key } : { token: null, error: 'No API key configured for this account' }
}

function buildHeaders(provider: ProviderId, token: string, accountId?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  if (provider === 'anthropic') {
    // OAuth usage endpoint requires the Claude Code beta headers.
    headers['anthropic-beta'] = 'claude-code-20250219,oauth-2025-04-20'
    headers['anthropic-version'] = '2023-06-01'
  } else if (provider === 'openai' && accountId) {
    headers['ChatGPT-Account-Id'] = accountId
  }
  return headers
}

function normalize(provider: ProviderId, json: unknown): NormalizedUsage {
  switch (provider) {
    case 'anthropic':
      return normalizeAnthropic(json as never)
    case 'openai':
      return normalizeCodex(json as never)
    case 'zai':
    case 'zhipu':
      return normalizeZai(json as never, provider)
    default:
      throw new Error(`No normalizer for provider: ${provider}`)
  }
}

/** Fetch and normalize usage for a single account. */
export async function fetchAccountUsage(account: UsageAccount): Promise<FetchUsageResult> {
  const desc = getProvider(account.provider)

  if (!desc.implemented || desc.capability !== 'quota') {
    return {
      ok: false,
      code: 'unsupported',
      error: `${desc.label} usage tracking isn't wired yet${desc.notes ? ` — ${desc.notes}` : ''}`,
    }
  }

  const baseUrl = account.baseUrl || desc.baseUrl
  const endpoint = getUsageEndpoint(account.provider, baseUrl)
  if (!endpoint) {
    return { ok: false, code: 'unsupported', error: `No usage endpoint configured for ${desc.label}` }
  }

  // SSRF guard: only allow the provider's known hosts.
  let hostname: string
  try {
    hostname = new URL(endpoint).hostname
  } catch {
    return { ok: false, code: 'network', error: `Invalid usage endpoint: ${endpoint}` }
  }
  const hostAllowed = desc.allowedHosts.some((h) => hostname === h || hostname.endsWith(`.${h}`))
  if (!hostAllowed) {
    return { ok: false, code: 'network', error: `Unauthorized domain: ${hostname}` }
  }

  const cred = resolveCredential(account)
  if (!cred.token) {
    return {
      ok: false,
      code: 'no_credential',
      error:
        cred.error ??
        (desc.auth === 'oauthLocal'
          ? `No local ${desc.label} login found — sign in with the ${desc.label} CLI first`
          : 'No credential configured'),
    }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: buildHeaders(account.provider, cred.token, cred.accountId),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { ok: false, code: 'auth', error: `Authentication failed (${response.status}) for ${desc.label}` }
      }
      if (response.status === 429) {
        return { ok: false, code: 'rate_limit', error: `Rate limited by ${desc.label} — try again shortly` }
      }
      return { ok: false, code: 'network', error: `${desc.label} request failed: ${response.status} ${response.statusText}` }
    }

    const json = await response.json()
    const usage = normalize(account.provider, json)
    // Prefer the email the local credential gave us if the API didn't return one.
    if (!usage.email && cred.email) usage.email = cred.email
    return { ok: true, usage }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch usage'
    return { ok: false, code: 'network', error: message }
  }
}

/**
 * Map a NormalizedUsage to the legacy UsageData shape so existing renderer
 * components (UsageDisplay, tray, overlay) keep working unchanged.
 */
export function toLegacyUsageData(u: NormalizedUsage): UsageData {
  return {
    sessionUsage: u.sessionUsage ?? 0,
    sessionLimit: u.sessionLimit ?? 0,
    sessionPercent: u.sessionPercent,
    sessionResetTime: u.sessionResetTime,
    weeklyUsage: u.weeklyUsage ?? 0,
    weeklyLimit: u.weeklyLimit ?? 0,
    weeklyPercent: u.weeklyPercent,
    weeklyResetTime: u.weeklyResetTime,
    lastUpdated: u.lastUpdated,
  }
}
