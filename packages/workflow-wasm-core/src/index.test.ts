import { describe, expect, it } from 'vitest'

import {
  clampZoomKernel,
  createKernelFromModule,
  getFallbackKernel,
  loadWasmKernel,
  panViewportState,
  screenToWorldPoint,
  zoomViewportState,
} from './index'

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

  it('creates a wasm-backed kernel contract from complete module exports', () => {
    const kernel = createKernelFromModule({
      wf_clamp_zoom: (zoom) => zoom,
      wf_bounds_width: (minX, maxX) => maxX - minX,
      wf_bounds_height: (minY, maxY) => maxY - minY,
      wf_screen_to_world_x: (screenX, viewportX, zoom) => screenX / zoom + viewportX,
      wf_screen_to_world_y: (screenY, viewportY, zoom) => screenY / zoom + viewportY,
      wf_pan_viewport_x: (viewportX, deltaX, zoom) => viewportX - deltaX / zoom,
      wf_pan_viewport_y: (viewportY, deltaY, zoom) => viewportY - deltaY / zoom,
      wf_zoom_viewport_x: (viewportX, currentZoom, nextZoom, anchorX) =>
        viewportX + anchorX / currentZoom - anchorX / nextZoom,
      wf_zoom_viewport_y: (viewportY, currentZoom, nextZoom, anchorY) =>
        viewportY + anchorY / currentZoom - anchorY / nextZoom,
    })

    expect(kernel?.source).toBe('rust-wasm')
    expect(
      screenToWorldPoint(
        { x: 160, y: 80 },
        { x: -40, y: 10, zoom: 2 },
        kernel!,
      ),
    ).toEqual({ x: 40, y: 50 })
  })

  it('routes viewport geometry through the shared kernel contract', () => {
    const kernel = getFallbackKernel()
    const viewport = { x: -80, y: -40, zoom: 1 }

    expect(screenToWorldPoint({ x: 200, y: 100 }, viewport, kernel)).toEqual({
      x: 120,
      y: 60,
    })

    expect(panViewportState(viewport, 40, -20, kernel)).toEqual({
      x: -120,
      y: -20,
      zoom: 1,
    })

    const next = zoomViewportState(viewport, 0.25, { x: 200, y: 100 }, kernel)

    expect(next.zoom).toBe(1.25)
    expect(screenToWorldPoint({ x: 200, y: 100 }, viewport, kernel).x).toBeCloseTo(
      screenToWorldPoint({ x: 200, y: 100 }, next, kernel).x,
    )
    expect(screenToWorldPoint({ x: 200, y: 100 }, viewport, kernel).y).toBeCloseTo(
      screenToWorldPoint({ x: 200, y: 100 }, next, kernel).y,
    )
  })
})
