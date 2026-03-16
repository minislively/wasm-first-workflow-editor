import { expect, test } from '@playwright/test'

test.describe('product demo web component surface', () => {
  test('renders the builder-first shell for the starter flow', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Demo-ready builder shell for the starter flow')).toBeVisible()
    await expect(page.getByText('Product Demo now reads like a constrained builder.')).toBeVisible()
    await expect(page.getByText('Config Panel', { exact: true })).toBeVisible()
    await expect(page.getByText('Constrained Add / Remove', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Visible builder controls match actual behavior'),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Performance Lab' })).toHaveCount(0)
    await expect(page.getByText('Diagnostics', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Lab Controls', { exact: true })).toHaveCount(0)
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

  test('opens a builder step in the side panel from the flow map', async ({ page }) => {
    await page.goto('/')

    await page.locator('[data-flow-node="research"]').click()

    await expect(page.locator('[data-role="config-title"]')).toContainText(
      'Knowledge lookup',
    )
    await expect(page.locator('[data-role="config-copy"]')).toContainText(
      'API-backed lookup stays template-first',
    )
  })

  test('mirrors stage selection into the config panel', async ({ page }) => {
    await page.goto('/')

    await page.locator('workflow-editor').locator('canvas').click({
      position: { x: 156, y: 182 },
    })

    await expect(page.locator('[data-role="config-title"]')).toContainText(
      'Webhook intake',
    )
    await expect(page.locator('[data-role="selection-list"]')).toContainText(
      'Webhook intake',
    )
  })

  test('updates builder configuration from the side panel', async ({ page }) => {
    await page.goto('/')

    await page.locator('[data-flow-node="classify"]').click()
    await page
      .locator('select[data-config-control="preset"][data-node-id="classify"]')
      .selectOption('classify-severity')

    await expect(page.locator('[data-flow-node="classify"]')).toContainText('Severity gate')
    await expect(page.locator('[data-role="config-title"]')).toContainText('Severity gate')
  })

  test('keeps template-first starter flow swaps inside the builder shell', async ({ page }) => {
    await page.goto('/')

    await page.locator('select[data-builder-control="template"]').selectOption(
      'ops-incident',
    )

    await expect(page.locator('[data-role="template-summary"]')).toContainText(
      'Ops incident',
    )
    await expect(page.locator('[data-role="flow-map"]')).toContainText('Alert monitor')
  })

  test('adds the supported follow-up action through constrained controls', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Add follow-up action' }).click()

    await expect(page.locator('[data-flow-node="action"]')).toContainText('Slack summary')
    await expect(
      page.getByRole('button', { name: 'Remove follow-up action' }),
    ).toBeVisible()
  })

  test('removes the supported approval gate through constrained controls', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Remove approval gate' }).click()

    await expect(page.locator('[data-flow-node="review"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Add approval gate' })).toBeVisible()
  })
})
