import { expect, test } from '@playwright/test'

test.describe('product demo web component surface', () => {
  test('keeps the product surface lightweight by default', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Default experience for first-time OSS users')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Performance Lab' })).toHaveCount(0)
    await expect(page.getByText('Diagnostics', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Lab Controls', { exact: true })).toHaveCount(0)
    await expect(page.locator('.evaluation-card')).toBeHidden()
    await expect(page.locator('[data-role="runtime-title"]')).toContainText(/runtime|Fallback/)
    await expect(page.locator('workflow-editor')).toHaveCount(1)
  })
})
