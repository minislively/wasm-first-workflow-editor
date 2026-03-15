import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL:
      process.env.PLAYWRIGHT_WEB_COMPONENT_BASE_URL ?? 'http://127.0.0.1:44173',
    trace: 'on-first-retry',
  },
  webServer: process.env.PLAYWRIGHT_MANUAL_SERVERS === '1'
    ? undefined
    : [
        {
          command: 'pnpm serve:web-component',
          url: 'http://127.0.0.1:44173',
          reuseExistingServer: true,
          timeout: 120000,
        },
        {
          command: 'pnpm serve:performance-lab',
          url: 'http://127.0.0.1:44175',
          reuseExistingServer: true,
          timeout: 120000,
        },
        {
          command: 'pnpm serve:react',
          url: 'http://127.0.0.1:44174',
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
