import { expect, test } from '@playwright/test'

test.describe('production builder constrained surface', () => {
  test('shows constrained-builder framing with graph and result together', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Trusted flow builder for embedded agent products' })).toBeVisible()
    await expect(page.getByText('Constrained production builder')).toBeVisible()
    await expect(page.getByText('Template-backed editing')).toBeVisible()
    await expect(page.locator('.builder-stage')).toBeVisible()
    await expect(page.locator('.preview-pane')).toBeVisible()
    await expect(page.locator('workflow-editor')).toBeVisible()
    await expect(page.getByText('Builder truth')).toBeVisible()
    await expect(page.getByText('Advanced Graph')).toHaveCount(0)
  })

  test('supports truthful quick actions instead of fake prompt editing', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Focus context step' }).click()
    await expect(page.locator('[data-role="selection-card"]')).toContainText('Context step configuration')

    await page.getByRole('button', { name: 'Focus publish step' }).click()
    await expect(page.locator('[data-role="selection-card"]')).toContainText('Publish step configuration')
  })

  test('keeps graph interaction and runtime proof visible on the constrained shell', async ({ page }) => {
    await page.goto('/')

    await page.evaluate(() => {
      const editor = document.querySelector('workflow-editor')
      const bucket = [] as Array<{ nodeCount: number; edgeCount: number }>
      ;(window as Window & { __demoChanges?: typeof bucket }).__demoChanges = bucket
      editor?.addEventListener('change', (event) => {
        const detail = (event as CustomEvent<{ type: string; graph: { nodes: unknown[]; edges: unknown[] } }>).detail
        if (detail.type === 'change') {
          bucket.push({
            nodeCount: detail.graph.nodes.length,
            edgeCount: detail.graph.edges.length,
          })
        }
      })
    })

    await page.getByRole('button', { name: 'Toggle review gate' }).click()

    await expect
      .poll(async () =>
        page.evaluate(
          () => (window as Window & { __demoChanges?: unknown[] }).__demoChanges?.length ?? 0,
        ),
      )
      .toBeGreaterThan(0)

    await expect(page.locator('[data-role="runtime-backend"]')).toContainText(/Renderer ·/)
    await expect(page.locator('[data-role="runtime-fallback"]')).toContainText(/Fallback ·/)
  })
})
