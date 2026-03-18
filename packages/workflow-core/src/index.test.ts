import { describe, expect, it } from 'vitest'

import {
  createGraphDerivedState,
  createNodeIndex,
  defaultViewport,
  findNodeAt,
  findNodeAtFromDerivedState,
  getSelectionSummary,
  getSelectionSummaryFromIndex,
  moveNode,
  screenToWorld,
  updateDerivedStateForNodeMove,
  zoomViewport,
} from './index'
import type { GraphDocument } from '@minislively/workflow-types'

const graph: GraphDocument = {
  version: '1',
  nodes: [
    {
      id: 'a',
      type: 'trigger',
      title: 'Trigger',
      status: 'ready',
      position: { x: 10, y: 20 },
      size: { width: 120, height: 72 },
      color: '#f97316',
    },
  ],
  edges: [],
}

describe('workflow-core', () => {
  it('finds nodes under the pointer', () => {
    expect(findNodeAt(graph, { x: 60, y: 44 })?.id).toBe('a')
    expect(findNodeAt(graph, { x: 500, y: 500 })).toBeUndefined()
  })

  it('builds selection summaries', () => {
    expect(getSelectionSummary(graph, ['a'])).toEqual([
      {
        id: 'a',
        title: 'Trigger',
        type: 'trigger',
        status: 'ready',
      },
    ])
  })

  it('zooms around an anchor without changing the anchor world point', () => {
    const anchor = { x: 200, y: 100 }
    const before = screenToWorld(anchor, defaultViewport)
    const afterViewport = zoomViewport(defaultViewport, 0.25, anchor)
    const after = screenToWorld(anchor, afterViewport)

    expect(before.x).toBeCloseTo(after.x)
    expect(before.y).toBeCloseTo(after.y)
  })

  it('updates only the targeted node when moving a node', () => {
    const richGraph: GraphDocument = {
      ...graph,
      metadata: {
        name: 'test-graph',
      },
      nodes: [
        graph.nodes[0],
        {
          id: 'b',
          type: 'publish',
          title: 'Publish',
          status: 'idle',
          position: { x: 200, y: 100 },
          size: { width: 120, height: 72 },
          color: '#38bdf8',
        },
      ],
      edges: [{ id: 'e1', source: 'a', target: 'b' }],
    }

    const next = moveNode(richGraph, 'a', { x: 40, y: 50 })

    expect(next).not.toBe(richGraph)
    expect(next.edges).toBe(richGraph.edges)
    expect(next.metadata).toBe(richGraph.metadata)
    expect(next.nodes[1]).toBe(richGraph.nodes[1])
    expect(next.nodes[0].position).toEqual({ x: 40, y: 50 })
  })

  it('creates a node index for repeated lookups', () => {
    const index = createNodeIndex({
      ...graph,
      nodes: [
        ...graph.nodes,
        {
          id: 'b',
          type: 'publish',
          title: 'Publish',
          status: 'idle',
          position: { x: 200, y: 100 },
          size: { width: 120, height: 72 },
          color: '#38bdf8',
        },
      ],
    })

    expect(index.get('a')?.title).toBe('Trigger')
    expect(index.get('b')?.title).toBe('Publish')
  })

  it('creates derived state with adjacency and bounds', () => {
    const richGraph: GraphDocument = {
      ...graph,
      nodes: [
        graph.nodes[0],
        {
          id: 'b',
          type: 'publish',
          title: 'Publish',
          status: 'idle',
          position: { x: 200, y: 100 },
          size: { width: 120, height: 72 },
          color: '#38bdf8',
        },
      ],
      edges: [{ id: 'e1', source: 'a', target: 'b' }],
    }

    const derived = createGraphDerivedState(richGraph)

    expect(derived.nodeCount).toBe(2)
    expect(derived.edgeCount).toBe(1)
    expect(derived.adjacencyByNodeId.get('a')).toEqual({
      incoming: [],
      outgoing: ['b'],
    })
    expect(derived.orderedNodeIds).toEqual(['a', 'b'])
    expect(derived.bounds).toMatchObject({
      minX: 10,
      minY: 20,
      maxX: 320,
      maxY: 172,
    })
  })

  it('updates derived state after moving a node', () => {
    const richGraph: GraphDocument = {
      ...graph,
      nodes: [
        graph.nodes[0],
        {
          id: 'b',
          type: 'publish',
          title: 'Publish',
          status: 'idle',
          position: { x: 200, y: 100 },
          size: { width: 120, height: 72 },
          color: '#38bdf8',
        },
      ],
      edges: [{ id: 'e1', source: 'a', target: 'b' }],
    }
    const previousState = createGraphDerivedState(richGraph)
    const nextGraph = moveNode(richGraph, 'b', { x: 240, y: 140 })
    const nextNode = nextGraph.nodes.find((node) => node.id === 'b')

    const nextState = updateDerivedStateForNodeMove(
      nextGraph,
      previousState,
      richGraph.nodes[1],
      nextNode,
    )

    expect(nextState.nodeById.get('b')?.position).toEqual({ x: 240, y: 140 })
    expect(nextState.adjacencyByNodeId.get('a')?.outgoing).toEqual(['b'])
    expect(nextState.bounds).toMatchObject({
      maxX: 360,
      maxY: 212,
    })
  })

  it('builds selection summaries from the node index', () => {
    const nodeById = createNodeIndex(graph)

    expect(getSelectionSummaryFromIndex(nodeById, ['a'])).toEqual([
      {
        id: 'a',
        title: 'Trigger',
        type: 'trigger',
        status: 'ready',
      },
    ])
  })

  it('finds nodes from derived state without rebuilding a reversed node array', () => {
    const richGraph: GraphDocument = {
      ...graph,
      nodes: [
        graph.nodes[0],
        {
          id: 'b',
          type: 'publish',
          title: 'Publish',
          status: 'idle',
          position: { x: 20, y: 30 },
          size: { width: 100, height: 60 },
          color: '#38bdf8',
        },
      ],
    }

    const derived = createGraphDerivedState(richGraph)

    expect(findNodeAtFromDerivedState(derived, { x: 30, y: 40 })?.id).toBe('b')
    expect(findNodeAtFromDerivedState(derived, { x: 500, y: 500 })).toBeUndefined()
  })
})
