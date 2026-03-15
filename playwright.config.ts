import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm preview:web-component',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'pnpm preview:react',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
