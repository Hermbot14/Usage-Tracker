# Providers

This app tracks usage by normalizing every provider to one shape and fetching it
with a single authenticated request. Providers are declared in a registry, so
adding one is a small, localized change rather than a refactor.

## The model

```ts
// src/main/providers/types.ts
interface NormalizedUsage {
  sessionPercent: number      // short (~5h) window, 0–100
  weeklyPercent: number       // long (weekly/monthly) window, 0–100
  sessionResetTime: string    // ISO
  weeklyResetTime: string     // ISO
  // optional raw figures, labels, email, limitType, lastUpdated…
}
```

Each provider is a `ProviderDescriptor` in `src/main/providers/registry.ts`:

```ts
{
  id, label, shortLabel,
  baseUrl,                 // default API base
  usagePath,               // path appended to baseUrl origin, or null
  auth,                    // 'apiKey' | 'oauthLocal' | 'oauthPaste'
  capability,              // 'quota' | 'balance' | 'none'
  localCredential,         // 'claude' | 'codex' | 'qwen' (for oauthLocal)
  allowedHosts,            // SSRF allowlist
  sessionWindowLabel, weeklyWindowLabel,
  minPollMs,               // throttle floor (e.g. Anthropic = 60_000)
  implemented,             // false = scaffold; service returns "not wired yet"
  notes,
}
```

## Request flow

`usage-service.ts → fetchAccountUsage(account)`:

1. Look up the descriptor; if `!implemented` or `capability !== 'quota'`, return a clear
   "not wired yet" result.
2. Build the usage endpoint from the descriptor `usagePath` + account base URL and verify
   the host is in `allowedHosts` (SSRF guard).
3. Resolve the credential:
   - `apiKey` / `oauthPaste` → the stored key.
   - `oauthLocal` → read the CLI-stored token (`credentials.ts`); for Anthropic this also
     **auto-refreshes** an expired token (`claude-token.ts`).
4. Respect `minPollMs` and any active 429 cooldown — serve the last good snapshot instead
   of re-hitting the endpoint.
5. `GET` with provider-specific headers, then normalize via `normalizers.ts`.

## Live providers

| id | endpoint | auth | response → normalized |
|----|----------|------|------------------------|
| `anthropic` | `api.anthropic.com/api/oauth/usage` (beta headers) | local OAuth, auto-refresh | `five_hour.utilization` → session, `seven_day.utilization` → weekly |
| `openai` | `chatgpt.com/backend-api/wham/usage` | local OAuth (`~/.codex`) | `primary_window.used_percent` → session, `secondary_window` → weekly |
| `zai` / `zhipu` | `…/api/monitor/usage/quota/limit` | API key | `TOKENS_LIMIT` → session, `TIME_LIMIT` → weekly |

## Adding a provider

1. **Add a registry entry** in `registry.ts`. If it exposes a session/weekly quota endpoint,
   set `usagePath`, `capability: 'quota'`, `implemented: true`, and `allowedHosts`.
2. **Add a normalizer** in `normalizers.ts` only if the response shape is new; reuse
   `normalizeZai` for ZAI-compatible quota responses.
3. **Wire it** in `usage-service.ts`'s `normalize()` switch (and `resolveCredential` if it
   needs a new credential source).
4. For an `oauthLocal` provider, add a reader in `credentials.ts` (and a refresh module if
   its tokens expire, like `claude-token.ts`).

If a provider only exposes a balance (DeepSeek, Kimi) or no public usage window
(Qwen, MiniMax, OpenCode), leave `implemented: false` with a `notes` explanation rather
than inventing an endpoint.
