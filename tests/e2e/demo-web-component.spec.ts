import { expect, test } from '@playwright/test'

test.describe('product demo web component surface', () => {
  test('keeps the product surface lightweight by default', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Default experience for first-time OSS users')).toBeVisible()
    await expect(
      page.getByText('Swap guided API steps without promising broad authoring.'),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Performance Lab' })).toHaveCount(0)
    await expect(page.getByText('Diagnostics', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Lab Controls', { exact: true })).toHaveCount(0)
    await expect(page.locator('.evaluation-card')).toBeHidden()
    await expect(page.locator('[data-role="runtime-title"]')).toContainText(/runtime|Fallback/)
    await expect(page.locator('workflow-editor')).toHaveCount(1)
  })

  test('turns the runtime snapshot into a concrete engine status', async ({ page }) => {
    await page.goto('/')

    const runtimeTitle = page.locator('[data-role="runtime-title"]')
    const runtimeCopy = page.locator('[data-role="runtime-copy"]')

    await expect(runtimeTitle).not.toHaveText('Booting editor runtime...')
    await expect(runtimeCopy).toContainText(/Kernel /)
    await expect(runtimeCopy).toContainText(/fallback/i)
  })

  test('supports template-first host swaps for guided example flows', async ({ page }) => {
    await page.goto('/')

    await page.locator('select[data-template-control="template"]').selectOption(
      'ops-incident',
    )

    await expect(page.locator('[data-role="template-summary"]')).toContainText(
      'Ops incident',
    )
    await expect(page.locator('[data-role="template-summary"]')).toContainText(
      'Host-managed template swap active',
    )
  })
})
