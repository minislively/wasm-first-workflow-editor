import { expect, test } from '@playwright/test'

test('react host mounts the shared editor contract', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174')

  await expect(page.getByText('Use React as the host shell, not as the graph engine.')).toBeVisible()
  await expect(page.locator('workflow-editor')).toHaveCount(1)
  await expect(page.getByText('Host ready: React is hosting the same custom element contract')).toBeVisible()
})
