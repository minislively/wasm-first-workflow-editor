import { expect, test } from '@playwright/test'

test.describe('demo web component surface', () => {
  test('Product Demo stays lightweight by default and lab mode exposes diagnostics', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Product Demo' })).toHaveClass(
      /is-active/,
    )
    await expect(page.getByText('Default experience for first-time OSS users')).toBeVisible()
    await expect(page.getByText('Diagnostics', { exact: true })).toBeHidden()

    await page.getByRole('button', { name: 'Performance Lab' }).click()

    await expect(page.getByText('Evaluation mode for performance-sensitive teams')).toBeVisible()
    await expect(page.getByText('Diagnostics', { exact: true })).toBeVisible()
    await expect(page.getByText('Lab Controls', { exact: true })).toBeVisible()
    await expect(page.getByText('Fixture read')).toBeVisible()
  })

  test('fixture switching updates diagnostics counts', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Performance Lab' }).click()
    await page.getByRole('button', { name: '500' }).click()

    const diagnostics = page.locator('.diag-grid')
    await expect(diagnostics).toContainText('Nodes')
    await expect(diagnostics).toContainText('500')
    await expect(diagnostics).toContainText('499')

    await page.getByRole('button', { name: '1000' }).click()
    await expect(diagnostics).toContainText('1000')
    await expect(diagnostics).toContainText('999')
  })

  test('runtime preference controls reflect requested vs active runtime', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Performance Lab' }).click()

    await page.locator('select[data-control="editability"]').selectOption('read-only')
    await page.locator('select[data-control="rendererPreference"]').selectOption('canvas')
    await page.locator('select[data-control="kernelPreference"]').selectOption('ts-fallback')

    await expect(page.locator('.diag-grid')).toContainText('read-only')
    await expect(page.locator('.diag-grid')).toContainText('canvas')
    await expect(page.locator('.diag-grid')).toContainText('ts-fallback')
    await expect(page.locator('.evaluation-card')).toContainText('Fallback is active')
    await expect(page.locator('.evaluation-card')).toContainText(
      'kernel forced to typescript fallback',
    )
  })
})
