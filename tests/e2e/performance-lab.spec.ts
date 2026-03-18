import { expect, test } from '@playwright/test'

test.use({
  baseURL: process.env.PLAYWRIGHT_PERFORMANCE_LAB_BASE_URL ?? 'http://127.0.0.1:44175',
})

test.describe('performance example surface', () => {
  test('lab defaults to the diagnostics-forward evaluation state', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Performance Example', { exact: true })).toBeVisible()
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
    await expect(page.locator('[data-role="policy-card"]')).toContainText(
      'Supported tier — constrained default',
    )
    await expect(page.locator('select[data-control="editability"]')).toBeDisabled()
    await expect(page.locator('.evaluation-card')).toContainText('Supported default is active')
    await expect(diagnostics).toContainText('Nodes')
    await expect(diagnostics).toContainText('500')
    await expect(diagnostics).toContainText('499')
    await expect(diagnostics).toContainText('supported default')
    await expect(diagnostics).toContainText('500 nodes for Supported heavy-tier evaluation')

    await page.getByRole('button', { name: '1000' }).click()
    await expect(diagnostics).toContainText('1000')
    await expect(diagnostics).toContainText('999')
    await expect(diagnostics).toContainText(
      '1000 nodes for the Supported heavy-viewing baseline',
    )
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
    await expect(page.locator('.evaluation-card')).toContainText('read-only -> read-only')
    await expect(page.locator('.evaluation-card')).toContainText('canvas -> canvas')
    await expect(page.locator('.evaluation-card')).toContainText('ts-fallback -> ts-fallback')
    await expect(page.locator('.evaluation-card')).toContainText(
      'typescript fallback',
    )
  })

  test('heavy tiers require explicit opt-in before editing resumes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '500' }).click()

    const diagnostics = page.locator('.diag-grid')
    await expect(diagnostics).toContainText('Requested editability')
    await expect(diagnostics).toContainText('read-only')

    await page.locator('input[data-control="allowHeavyEditing"]').check()

    await expect(page.locator('[data-role="policy-card"]')).toContainText(
      'Enable experimental editing for 500',
    )
    await expect(diagnostics).toContainText('experimental override')
    await expect(diagnostics).toContainText('Effective editability')
    await expect(diagnostics).toContainText('editable')
  })

  test('experimental heavy-tier editing re-enables stage selection after opt-in', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '500' }).click()
    await page.locator('input[data-control="allowHeavyEditing"]').check()

    await page.locator('workflow-editor').locator('canvas').click({
      position: { x: 120, y: 90 },
    })

    await expect(page.locator('[data-role="policy-card"]')).toContainText(
      'Enable experimental editing for 500',
    )
    await expect(page.locator('.selection-list')).toContainText('Node 1')
    await expect(page.locator('.selection-list')).toContainText('trigger')
  })
})
