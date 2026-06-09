# Multi-Provider Revamp — Status

Revamping the ZAI GLM usage monitor into a **multi-provider coding-plan usage tracker**.
Usage-tracking engine extracted/adapted from **Aperant** (`AndyMik90/Aperant`, the
project formerly "Auto Claude"), specifically `apps/desktop/src/main/claude-profile/`.

## Core model

Every provider normalizes to one shape — a ~5h **session %** and a longer **weekly/monthly %**
plus reset timestamps (`NormalizedUsage`). One GET per provider, Bearer auth.

| Provider | Endpoint | Credential | Status |
|---|---|---|---|
| Claude Code (`anthropic`) | `api.anthropic.com/api/oauth/usage` (beta headers) | OAuth token auto-read from `~/.claude`, auto-refreshed on expiry | ✅ implemented |
| Z.AI GLM (`zai`) | `…/api/monitor/usage/quota/limit` | API key | ✅ implemented |
| Zhipu BigModel (`zhipu`) | `…/api/monitor/usage/quota/limit` | API key | ✅ implemented |
| OpenAI Codex (`openai`) | `chatgpt.com/backend-api/wham/usage` | OAuth token auto-read from `~/.codex` | ✅ implemented |
| DeepSeek, Kimi | balance API only | API key | 🟡 scaffolded |
| Qwen, MiniMax, OpenCode | no public usage window | — | 🟡 scaffolded |

Scaffolded = registry entry present, picker shows it, service returns a clear
"not wired yet" message. No fake endpoints. Adding one later = a registry entry
(+ a normalizer if the shape is new).

## What's built (`src/main/providers/`)

- `types.ts` — `ProviderDescriptor`, `NormalizedUsage`, `FetchUsageResult`
- `registry.ts` — declarative provider catalog + `detectProvider` / `getUsageEndpoint`
- `credentials.ts` — local OAuth token readers (Claude file + Windows Credential Manager
  CredRead fallback; Codex `~/.codex/auth.json`; Qwen best-effort)
- `normalizers.ts` — Anthropic / Codex / ZAI-Zhipu → `NormalizedUsage`
- `usage-service.ts` — resolve endpoint + credential, fetch (provider headers,
  SSRF host allowlist, 401/403/429 handling), normalize. `toLegacyUsageData()` keeps
  the existing UI working unchanged.

Wired into IPC (`ipc-handlers.ts` + `preload/index.ts`):
- `fetch-usage(apiKey, baseUrl)` — legacy signature, now provider-detected + routed through the engine
- `fetch-account-usage(account)` — explicit account
- `list-providers()` — for the account picker
- `discover-local-accounts()` — finds locally-signed-in Claude/Codex/Qwen

✅ `npm run build` passes. New modules add zero TypeScript errors (12 pre-existing
errors in index/tray/window-state are untouched and unrelated).

### Already usable today
Point the existing single-account UI's base URL at `https://api.anthropic.com` and it
auto-reads the local Claude Code token → shows Claude session/weekly %. (The API key
field is ignored for OAuth-local providers.)

## Remaining (task #5 — renderer multi-account UI)

- `accounts[]` in the store + store schema/migration
- Account cards in `UsageDisplay` (one per provider, using `NormalizedUsage`)
- Provider/account picker in `SettingsPanel` (uses `list-providers` + `discover-local-accounts`)
- Poll all accounts on the refresh interval; tray/overlay aggregate or active-account view

Repo already self-identifies as the new home: `package.json` name `zai-usage-tracker`,
repo URL `Hermbot14/Usage-Tracker.git`.
