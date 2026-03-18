import type {
  GraphDocument,
  Point,
  SelectionSummary,
  ViewportState,
  WorkflowNode,
} from '@minislively/workflow-types'
import {
  clampZoomKernel,
  getFallbackKernel,
  panViewportState,
  screenToWorldPoint,
  zoomViewportState,
} from '@minislively/workflow-wasm-core'

export const defaultViewport: ViewportState = {
  x: -80,
  y: -40,
  zoom: 1,
}

export type GraphBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export type GraphAdjacency = {
  incoming: string[]
  outgoing: string[]
}

export type GraphDerivedState = {
  nodeById: Map<string, WorkflowNode>
  adjacencyByNodeId: Map<string, GraphAdjacency>
  orderedNodeIds: string[]
  nodeCount: number
  edgeCount: number
  bounds?: GraphBounds
}

export function findNodeAt(
  graph: GraphDocument,
  point: Point,
): WorkflowNode | undefined {
  for (let index = graph.nodes.length - 1; index >= 0; index -= 1) {
    const node = graph.nodes[index]
    const right = node.position.x + node.size.width
    const bottom = node.position.y + node.size.height

    if (
      point.x >= node.position.x &&
      point.x <= right &&
      point.y >= node.position.y &&
      point.y <= bottom
    ) {
      return node
    }
  }

  return undefined
}

export function moveNode(
  graph: GraphDocument,
  nodeId: string,
  position: Point,
): GraphDocument {
  const nodeIndex = graph.nodes.findIndex((item) => item.id === nodeId)

  if (nodeIndex < 0) {
    return graph
  }

  const nextNodes = [...graph.nodes]
  const currentNode = nextNodes[nodeIndex]

  nextNodes[nodeIndex] = {
    ...currentNode,
    position,
  }

  return {
    ...graph,
    nodes: nextNodes,
  }
}

export function screenToWorld(point: Point, viewport: ViewportState): Point {
  return screenToWorldPoint(point, viewport, getFallbackKernel())
}

export function zoomViewport(
  viewport: ViewportState,
  delta: number,
  anchor: Point,
): ViewportState {
  return zoomViewportState(viewport, delta, anchor, getFallbackKernel())
}

export function panViewport(
  viewport: ViewportState,
  deltaX: number,
  deltaY: number,
): ViewportState {
  return panViewportState(viewport, deltaX, deltaY, getFallbackKernel())
}

export function clampZoom(zoom: number): number {
  return clampZoomKernel(zoom)
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

export function createNodeIndex(
  graph: GraphDocument,
): Map<string, WorkflowNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]))
}

export function createAdjacencyIndex(
  graph: GraphDocument,
): Map<string, GraphAdjacency> {
  const adjacencyByNodeId = new Map<string, GraphAdjacency>()

  for (const node of graph.nodes) {
    adjacencyByNodeId.set(node.id, {
      incoming: [],
      outgoing: [],
    })
  }

  for (const edge of graph.edges) {
    adjacencyByNodeId.get(edge.source)?.outgoing.push(edge.target)
    adjacencyByNodeId.get(edge.target)?.incoming.push(edge.source)
  }

  return adjacencyByNodeId
}

export function computeGraphBounds(
  graph: GraphDocument,
): GraphBounds | undefined {
  if (graph.nodes.length === 0) {
    return undefined
  }

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

export function createGraphDerivedState(
  graph: GraphDocument,
): GraphDerivedState {
  return {
    nodeById: createNodeIndex(graph),
    adjacencyByNodeId: createAdjacencyIndex(graph),
    orderedNodeIds: graph.nodes.map((node) => node.id),
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    bounds: computeGraphBounds(graph),
  }
}

export function findNodeAtFromDerivedState(
  derivedState: GraphDerivedState,
  point: Point,
): WorkflowNode | undefined {
  for (let index = derivedState.orderedNodeIds.length - 1; index >= 0; index -= 1) {
    const node = derivedState.nodeById.get(derivedState.orderedNodeIds[index])

    if (!node) {
      continue
    }

    const right = node.position.x + node.size.width
    const bottom = node.position.y + node.size.height

    if (
      point.x >= node.position.x &&
      point.x <= right &&
      point.y >= node.position.y &&
      point.y <= bottom
    ) {
      return node
    }
  }

  return undefined
}

export function getSelectionSummaryFromIndex(
  nodeById: Map<string, WorkflowNode>,
  selectionIds: string[],
): SelectionSummary[] {
  return selectionIds.flatMap((selectionId) => {
    const node = nodeById.get(selectionId)

    if (!node) {
      return []
    }

    return [{
      id: node.id,
      title: node.title,
      type: node.type,
      status: node.status,
    }]
  })
}

export function updateDerivedStateForNodeMove(
  graph: GraphDocument,
  previousState: GraphDerivedState,
  previousNode: WorkflowNode | undefined,
  nextNode: WorkflowNode | undefined,
): GraphDerivedState {
  if (!previousNode || !nextNode) {
    return createGraphDerivedState(graph)
  }

  const nextNodeById = new Map(previousState.nodeById)
  nextNodeById.set(nextNode.id, nextNode)

  const previousBounds = previousState.bounds
  if (!previousBounds) {
    return {
      ...previousState,
      nodeById: nextNodeById,
      bounds: computeGraphBounds(graph),
    }
  }

  const previousRight = previousNode.position.x + previousNode.size.width
  const previousBottom = previousNode.position.y + previousNode.size.height
  const touchesPreviousBounds =
    previousNode.position.x <= previousBounds.minX ||
    previousNode.position.y <= previousBounds.minY ||
    previousRight >= previousBounds.maxX ||
    previousBottom >= previousBounds.maxY

  const nextBounds = touchesPreviousBounds
    ? computeGraphBounds(graph)
    : {
        minX: Math.min(previousBounds.minX, nextNode.position.x),
        minY: Math.min(previousBounds.minY, nextNode.position.y),
        maxX: Math.max(previousBounds.maxX, nextNode.position.x + nextNode.size.width),
        maxY: Math.max(previousBounds.maxY, nextNode.position.y + nextNode.size.height),
        width: 0,
        height: 0,
      }

  return {
    ...previousState,
    nodeById: nextNodeById,
    bounds:
      nextBounds
        ? {
            ...nextBounds,
            width: nextBounds.maxX - nextBounds.minX,
            height: nextBounds.maxY - nextBounds.minY,
          }
        : nextBounds,
  }
}
