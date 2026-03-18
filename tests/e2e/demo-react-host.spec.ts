import { expect, test } from '@playwright/test'

const reactBaseUrl =
  process.env.PLAYWRIGHT_REACT_BASE_URL ?? 'http://127.0.0.1:44174'

test('react host mounts the shared editor contract', async ({ page }) => {
  await page.goto(reactBaseUrl)

  await expect(page.getByText('react host demo')).toBeVisible()
  await expect(page.getByText('Use React as the host shell, not as the graph engine.')).toBeVisible()
  await expect(
    page.getByText(
      'The wrapper stays thin and delegates the interactive stage to the same underlying custom element.',
    ),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Host activity' })).toBeVisible()
  await expect(page.locator('workflow-editor')).toHaveCount(1)
  await expect(page.getByText('Host ready: React is hosting the same custom element contract')).toBeVisible()
  await expect(page.getByText('Reference App Playground')).toHaveCount(0)
  await expect(
    page.getByText('Evaluation mode for performance-sensitive teams'),
  ).toHaveCount(0)
  await expect(page.getByText('Performance Example', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Diagnostics', { exact: true })).toHaveCount(0)
})
