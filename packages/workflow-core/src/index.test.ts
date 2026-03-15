import { describe, expect, it } from 'vitest'

import {
  defaultViewport,
  findNodeAt,
  getSelectionSummary,
  screenToWorld,
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
})
