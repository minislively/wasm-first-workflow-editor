import { expect, test } from '@playwright/test'

const reactBaseUrl =
  process.env.PLAYWRIGHT_REACT_BASE_URL ?? 'http://127.0.0.1:44174'

test('react host mounts the shared editor contract', async ({ page }) => {
  await page.goto(reactBaseUrl)

  await expect(
    page.getByText('Use React when your product shell already lives there.'),
  ).toBeVisible()
  await expect(page.locator('workflow-editor')).toHaveCount(1)
  await expect(page.getByText('Host ready: React is hosting the same custom element contract')).toBeVisible()
})
