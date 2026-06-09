# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); this project uses semantic versioning.

## [2.0.0] — 2026-06-09

Multi-provider revamp. The ZAI-only monitor is now a general coding-plan usage
tracker. The usage-tracking engine was extracted and generalized from
[Aperant](https://github.com/AndyMik90/Aperant).

### Added
- **Provider registry** (`src/main/providers/`) — declarative catalog of providers,
  each normalized to one `{ sessionPercent, weeklyPercent, resets }` shape.
- **Live providers**: Claude Code (`anthropic`), Z.AI GLM (`zai`), Zhipu (`zhipu`),
  OpenAI Codex (`openai`).
- **Scaffolded providers** (picker entries, no fabricated endpoints): DeepSeek, Kimi,
  Qwen, MiniMax, OpenCode.
- **Local-login auto-detection** — reads the OAuth token the Claude Code / Codex CLI
  already stored (`~/.claude`, `~/.codex`); no key to paste.
- **Claude token auto-refresh** — refreshes the expired OAuth token via the Claude Code
  refresh grant and writes the rotated tokens back to `~/.claude/.credentials.json`
  atomically (one-time `.bak` backup), keeping the CLI in sync.
- **Rate-limit handling** — per-provider minimum poll interval (Claude/Codex = 60s) and a
  5-minute cooldown on HTTP 429 that serves the last good snapshot.
- **Multi-account UI** — `AccountsView` / `AccountCard` / `AccountsManager`; track several
  providers at once, each as its own card. New IPC: `fetch-account-usage`,
  `list-providers`, `discover-local-accounts`.
- **Playwright Electron E2E** (`e2e/app.spec.ts`, `npm run test:e2e`).
- Docs: rewritten README, this changelog, and `docs/PROVIDERS.md`.

### Changed
- Repository renamed `zai-glm-usage-monitor` → **`Usage-Tracker`**.
- Legacy `fetch-usage(apiKey, baseUrl)` now provider-detects and routes through the engine.
- `package.json` name → `usage-tracker`.

### Fixed
- Claude usage returned `401` (expired token) / `429` (over-polling) — both resolved by the
  auto-refresh + rate-limit handling above.
- **Accessibility**: removed `aria-hidden="true"` from the settings backdrop, which had
  hidden the entire modal (heading, controls) from the accessibility tree / screen readers.

### Removed
- Orphaned single-account modules: `api-service.ts`, `UsageDisplay.tsx`, `useUsageData.ts`.

## [1.0.0]

- Initial ZAI/GLM usage monitor: Electron + React + TypeScript, system tray, Windows
  taskbar overlay with percentage badge, multi-theme support (14 combinations),
  configurable alerts, Windows packaging.
