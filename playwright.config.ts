import { defineConfig } from '@playwright/test'

/**
 * Playwright config for Electron E2E tests.
 * We drive the built app (out/main/index.cjs) via Playwright's Electron support
 * — the right tool for Electron (Puppeteer can't attach to the main process).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: './e2e/test-results',
})
