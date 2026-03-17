import { expect, test } from '@playwright/test'

test.describe('product demo web component surface', () => {
  test('keeps practical workflow controls above the fold on first render', async ({
    page,
  }) => {
    await page.goto('/')

    const templateControl = page.locator('select[data-builder-control="template"]')
    const addButton = page.getByRole('button', { name: 'Add follow-up action' })
    const editor = page.locator('workflow-editor')
    const configPanel = page.locator('[data-role="config-form"]')

    await expect(templateControl).toBeVisible()
    await expect(addButton).toBeVisible()
    await expect(editor).toBeVisible()
    await expect(configPanel).toBeVisible()
  })

  test('renders the builder-first shell for the starter flow', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Product Demo Playground')).toBeVisible()
    await expect(
      page.getByText('캔버스에서 바로 에이전트 빌더를 체험합니다.'),
    ).toBeVisible()
    await expect(page.getByText('Node Inspector', { exact: true })).toBeVisible()
    await expect(page.getByText('Starter template')).toBeVisible()
    await expect(page.getByText('노드를 직접 보고 움직이는 빌더 화면')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Performance Lab' })).toHaveCount(0)
    await expect(page.getByText('Diagnostics', { exact: true })).toHaveCount(0)
    await expect(page.locator('[data-role="runtime-title"]')).toContainText(/runtime|Fallback/)
    await expect(page.locator('workflow-editor')).toHaveCount(1)
  })

  test('stays distinct from performance lab controls while exposing bounded node actions', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.locator('button[data-fixture]')).toHaveCount(0)
    await expect(page.locator('select[data-control="editability"]')).toHaveCount(0)
    await expect(page.locator('select[data-control="rendererPreference"]')).toHaveCount(0)
    await expect(page.locator('select[data-control="kernelPreference"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Add follow-up action' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Remove approval gate' })).toBeVisible()
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
  })

  test('updates builder configuration from the side panel', async ({ page }) => {
    await page.goto('/')

    await page
      .locator('select[data-config-control="preset"][data-node-id="trigger"]')
      .selectOption('trigger-alert')

    await expect(page.locator('[data-flow-node="trigger"]')).toContainText('Alert monitor')
    await expect(page.locator('[data-role="config-title"]')).toContainText('Alert monitor')
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

  test('supports adding more than one bounded follow-up action node', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Add follow-up action' }).click()
    await page.getByRole('button', { name: 'Add follow-up action' }).click()

    await expect(page.locator('[data-flow-node="action"]')).toContainText('Slack summary')
    await expect(page.locator('[data-flow-node="action-2"]')).toContainText('Slack summary')
    await expect(page.getByText('2/3')).toBeVisible()
  })

  test('removes the supported approval gate through constrained controls', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Remove approval gate' }).click()

    await expect(page.locator('[data-flow-node="review"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Add approval gate' })).toBeVisible()
  })
})
