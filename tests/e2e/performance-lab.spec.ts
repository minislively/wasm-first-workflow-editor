import { expect, test } from '@playwright/test'

test.use({ baseURL: 'http://127.0.0.1:4175' })

test.describe('performance lab surface', () => {
  test('lab defaults to the diagnostics-forward evaluation state', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByText('Evaluation mode for performance-sensitive teams'),
    ).toBeVisible()
    await expect(page.getByText('Diagnostics', { exact: true })).toBeVisible()
    await expect(page.getByText('Lab Controls', { exact: true })).toBeVisible()
    await expect(page.locator('.fixture-chip.is-active')).toContainText('100')
    await expect(page.locator('.diag-grid')).toContainText('Fixture read')
  })

  test('fixture switching updates diagnostics counts', async ({ page }) => {
    await page.goto('/')
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
