import type { GraphDocument } from '@minislively/workflow-types'

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
  boundsWidth: (minX: number, maxX: number) => number
  boundsHeight: (minY: number, maxY: number) => number
}

type WasmModule = {
  default?: () => Promise<unknown> | unknown
  wf_clamp_zoom?: (zoom: number) => number
  wf_bounds_width?: (minX: number, maxX: number) => number
  wf_bounds_height?: (minY: number, maxY: number) => number
}

let cachedKernel: Promise<WorkflowWasmKernel> | undefined

export function computeSceneBounds(graph: GraphDocument) {
  const minX = Math.min(...graph.nodes.map((node) => node.position.x))
  const minY = Math.min(...graph.nodes.map((node) => node.position.y))
  const maxX = Math.max(
    ...graph.nodes.map((node) => node.position.x + node.size.width),
  )
  const maxY = Math.max(
    ...graph.nodes.map((node) => node.position.y + node.size.height),
  )

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function clampZoomKernel(zoom: number) {
  return Math.min(2.25, Math.max(0.45, zoom))
}

export async function loadWasmKernel(options?: {
  moduleUrl?: string
}): Promise<WorkflowWasmKernel> {
  if (!cachedKernel) {
    cachedKernel = createKernel(options?.moduleUrl)
  }

  return cachedKernel
}

export function getFallbackKernel(): WorkflowWasmKernel {
  return {
    source: 'typescript-fallback',
    initialized: true,
    clampZoom: clampZoomKernel,
    boundsWidth: (minX, maxX) => maxX - minX,
    boundsHeight: (minY, maxY) => maxY - minY,
  }
}

async function createKernel(moduleUrl?: string): Promise<WorkflowWasmKernel> {
  const fallback = getFallbackKernel()

  try {
    const targetUrl = moduleUrl ?? new URL('../pkg/index.js', import.meta.url).href
    const module = (await import(
      /* @vite-ignore */
      targetUrl
    )) as WasmModule

    if (typeof module.default === 'function') {
      await module.default()
    }

    if (
      typeof module.wf_clamp_zoom !== 'function' ||
      typeof module.wf_bounds_width !== 'function' ||
      typeof module.wf_bounds_height !== 'function'
    ) {
      return fallback
    }

    return {
      source: 'rust-wasm',
      initialized: true,
      clampZoom: module.wf_clamp_zoom,
      boundsWidth: module.wf_bounds_width,
      boundsHeight: module.wf_bounds_height,
    }
  } catch {
    return fallback
  }
}
