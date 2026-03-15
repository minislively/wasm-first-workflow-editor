import { describe, expect, it } from 'vitest'

import { clampZoomKernel, getFallbackKernel, loadWasmKernel } from './index'

describe('workflow-wasm-core', () => {
  it('exposes the fallback kernel with the public zoom contract', () => {
    const kernel = getFallbackKernel()

    expect(kernel.source).toBe('typescript-fallback')
    expect(kernel.clampZoom(0.1)).toBe(0.45)
    expect(kernel.clampZoom(3)).toBe(2.25)
  })

  it('falls back cleanly when the generated wasm package is absent', async () => {
    const kernel = await loadWasmKernel({
      moduleUrl: 'file:///definitely-missing-workflow-wasm-core.js',
    })

    expect(kernel.source).toBe('typescript-fallback')
    expect(kernel.boundsWidth(-10, 25)).toBe(35)
    expect(kernel.boundsHeight(8, 20)).toBe(12)
    expect(clampZoomKernel(1.2)).toBe(1.2)
  })
})
