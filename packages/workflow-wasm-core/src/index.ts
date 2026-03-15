import type { GraphDocument } from '@minislively/workflow-types'

export const wasmCoreStatus = {
  implementation: 'typescript-placeholder',
  target: 'rust-wasm',
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
