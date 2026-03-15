import type { GraphDocument } from '@minislively/workflow-types'

export const wasmCoreStatus = {
  implementation: 'rust-entrypoint-scaffold',
  target: 'rust-wasm',
  rustCratePath: 'packages/workflow-wasm-core/rust',
}

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
