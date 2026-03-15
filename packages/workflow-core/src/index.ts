import type {
  GraphDocument,
  Point,
  SelectionSummary,
  ViewportState,
  WorkflowNode,
} from '@minislively/workflow-types'

export const defaultViewport: ViewportState = {
  x: -80,
  y: -40,
  zoom: 1,
}

export function cloneGraphDocument(graph: GraphDocument): GraphDocument {
  return structuredClone(graph)
}

export function findNodeAt(
  graph: GraphDocument,
  point: Point,
): WorkflowNode | undefined {
  return [...graph.nodes].reverse().find((node) => {
    const right = node.position.x + node.size.width
    const bottom = node.position.y + node.size.height

    return (
      point.x >= node.position.x &&
      point.x <= right &&
      point.y >= node.position.y &&
      point.y <= bottom
    )
  })
}

export function moveNode(
  graph: GraphDocument,
  nodeId: string,
  position: Point,
): GraphDocument {
  const next = cloneGraphDocument(graph)
  const node = next.nodes.find((item) => item.id === nodeId)

  if (!node) {
    return next
  }

  node.position = position
  return next
}

export function screenToWorld(point: Point, viewport: ViewportState): Point {
  return {
    x: point.x / viewport.zoom + viewport.x,
    y: point.y / viewport.zoom + viewport.y,
  }
}

export function zoomViewport(
  viewport: ViewportState,
  delta: number,
  anchor: Point,
): ViewportState {
  const nextZoom = clampZoom(viewport.zoom + delta)
  const anchorBefore = screenToWorld(anchor, viewport)
  const anchorAfter = screenToWorld(anchor, {
    ...viewport,
    zoom: nextZoom,
  })

  return {
    x: viewport.x + (anchorBefore.x - anchorAfter.x),
    y: viewport.y + (anchorBefore.y - anchorAfter.y),
    zoom: nextZoom,
  }
}

export function panViewport(
  viewport: ViewportState,
  deltaX: number,
  deltaY: number,
): ViewportState {
  return {
    ...viewport,
    x: viewport.x - deltaX / viewport.zoom,
    y: viewport.y - deltaY / viewport.zoom,
  }
}

export function clampZoom(zoom: number): number {
  return Math.min(2.25, Math.max(0.45, zoom))
}

export function getSelectionSummary(
  graph: GraphDocument,
  selectionIds: string[],
): SelectionSummary[] {
  return graph.nodes
    .filter((node) => selectionIds.includes(node.id))
    .map((node) => ({
      id: node.id,
      title: node.title,
      type: node.type,
      status: node.status,
    }))
}
