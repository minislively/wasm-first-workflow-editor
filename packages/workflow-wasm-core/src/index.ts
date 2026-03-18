import type { Point, ViewportState } from '@minislively/workflow-types'

export const wasmCoreStatus = {
  implementation: 'rust-entrypoint-scaffold',
  target: 'rust-wasm',
  rustCratePath: 'packages/workflow-wasm-core/rust',
  generatedPkgPath: 'packages/workflow-wasm-core/pkg',
}

export type WorkflowWasmKernel = {
  source: 'rust-wasm' | 'typescript-fallback'
  initialized: boolean
  clampZoom: (zoom: number) => number
  screenToWorldX: (
    screenX: number,
    viewportX: number,
    zoom: number,
  ) => number
  screenToWorldY: (
    screenY: number,
    viewportY: number,
    zoom: number,
  ) => number
  panViewportX: (viewportX: number, deltaX: number, zoom: number) => number
  panViewportY: (viewportY: number, deltaY: number, zoom: number) => number
  zoomViewportX: (
    viewportX: number,
    currentZoom: number,
    nextZoom: number,
    anchorX: number,
  ) => number
  zoomViewportY: (
    viewportY: number,
    currentZoom: number,
    nextZoom: number,
    anchorY: number,
  ) => number
}

type WasmModule = {
  __wbg_set_wasm?: (wasm: WebAssembly.Exports) => void
  wf_clamp_zoom?: (zoom: number) => number
  wf_screen_to_world_x?: (
    screenX: number,
    viewportX: number,
    zoom: number,
  ) => number
  wf_screen_to_world_y?: (
    screenY: number,
    viewportY: number,
    zoom: number,
  ) => number
  wf_pan_viewport_x?: (
    viewportX: number,
    deltaX: number,
    zoom: number,
  ) => number
  wf_pan_viewport_y?: (
    viewportY: number,
    deltaY: number,
    zoom: number,
  ) => number
  wf_zoom_viewport_x?: (
    viewportX: number,
    currentZoom: number,
    nextZoom: number,
    anchorX: number,
  ) => number
  wf_zoom_viewport_y?: (
    viewportY: number,
    currentZoom: number,
    nextZoom: number,
    anchorY: number,
  ) => number
}

let cachedKernel: Promise<WorkflowWasmKernel> | undefined

export function clampZoomKernel(zoom: number) {
  return Math.min(2.25, Math.max(0.45, zoom))
}

export async function loadWasmKernel(options?: {
  moduleUrl?: string
  wasmUrl?: string
}): Promise<WorkflowWasmKernel> {
  if (options?.moduleUrl) {
    return createKernel(options.moduleUrl, options.wasmUrl)
  }

  if (!cachedKernel) {
    cachedKernel = createKernel(options?.moduleUrl, options?.wasmUrl)
  }

  return cachedKernel
}

export function getFallbackKernel(): WorkflowWasmKernel {
  return {
    source: 'typescript-fallback',
    initialized: true,
    clampZoom: clampZoomKernel,
    screenToWorldX: (screenX, viewportX, zoom) => screenX / zoom + viewportX,
    screenToWorldY: (screenY, viewportY, zoom) => screenY / zoom + viewportY,
    panViewportX: (viewportX, deltaX, zoom) => viewportX - deltaX / zoom,
    panViewportY: (viewportY, deltaY, zoom) => viewportY - deltaY / zoom,
    zoomViewportX: (viewportX, currentZoom, nextZoom, anchorX) =>
      viewportX + anchorX / currentZoom - anchorX / nextZoom,
    zoomViewportY: (viewportY, currentZoom, nextZoom, anchorY) =>
      viewportY + anchorY / currentZoom - anchorY / nextZoom,
  }
}

export function screenToWorldPoint(
  point: Point,
  viewport: ViewportState,
  kernel: WorkflowWasmKernel = getFallbackKernel(),
): Point {
  return {
    x: kernel.screenToWorldX(point.x, viewport.x, viewport.zoom),
    y: kernel.screenToWorldY(point.y, viewport.y, viewport.zoom),
  }
}

export function panViewportState(
  viewport: ViewportState,
  deltaX: number,
  deltaY: number,
  kernel: WorkflowWasmKernel = getFallbackKernel(),
): ViewportState {
  return {
    ...viewport,
    x: kernel.panViewportX(viewport.x, deltaX, viewport.zoom),
    y: kernel.panViewportY(viewport.y, deltaY, viewport.zoom),
  }
}

export function zoomViewportState(
  viewport: ViewportState,
  delta: number,
  anchor: Point,
  kernel: WorkflowWasmKernel = getFallbackKernel(),
): ViewportState {
  const nextZoom = kernel.clampZoom(viewport.zoom + delta)

  return {
    x: kernel.zoomViewportX(viewport.x, viewport.zoom, nextZoom, anchor.x),
    y: kernel.zoomViewportY(viewport.y, viewport.zoom, nextZoom, anchor.y),
    zoom: nextZoom,
  }
}

export function createKernelFromModule(module: WasmModule): WorkflowWasmKernel | null {
  if (
    typeof module.wf_clamp_zoom !== 'function' ||
    typeof module.wf_screen_to_world_x !== 'function' ||
    typeof module.wf_screen_to_world_y !== 'function' ||
    typeof module.wf_pan_viewport_x !== 'function' ||
    typeof module.wf_pan_viewport_y !== 'function' ||
    typeof module.wf_zoom_viewport_x !== 'function' ||
    typeof module.wf_zoom_viewport_y !== 'function'
  ) {
    return null
  }

  return {
    source: 'rust-wasm',
    initialized: true,
    clampZoom: module.wf_clamp_zoom,
    screenToWorldX: module.wf_screen_to_world_x,
    screenToWorldY: module.wf_screen_to_world_y,
    panViewportX: module.wf_pan_viewport_x,
    panViewportY: module.wf_pan_viewport_y,
    zoomViewportX: module.wf_zoom_viewport_x,
    zoomViewportY: module.wf_zoom_viewport_y,
  }
}

async function createKernel(
  moduleUrl?: string,
  wasmUrl?: string,
): Promise<WorkflowWasmKernel> {
  const fallback = getFallbackKernel()

  try {
    const targetUrl = moduleUrl ?? resolveOptionalPkgUrl('index_bg.js')
    const module = (await import(
      /* @vite-ignore */
      targetUrl
    )) as WasmModule

    const targetWasmUrl =
      wasmUrl ?? resolveOptionalPkgUrl('index_bg.wasm')

    if (typeof module.__wbg_set_wasm !== 'function') {
      return fallback
    }

    const response = await fetch(targetWasmUrl)
    const bytes = await response.arrayBuffer()
    const { instance } = await WebAssembly.instantiate(bytes, {
      './index_bg.js': module,
    })

    module.__wbg_set_wasm(instance.exports)

    const start = instance.exports.__wbindgen_start
    if (typeof start === 'function') {
      start()
    }

    return createKernelFromModule(module) ?? fallback
  } catch {
    return fallback
  }
}

function resolveOptionalPkgUrl(filename: string): string {
  return new URL(['..', 'pkg', filename].join('/'), import.meta.url).href
}
