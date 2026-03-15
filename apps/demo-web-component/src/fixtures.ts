import { createBasicDemoGraph } from '@minislively/workflow-nodepack-basic'
import type { GraphDocument } from '@minislively/workflow-types'

export type FixtureKey = 'basic' | '100' | '500' | '1000'

export function getFixtureGraph(fixture: FixtureKey): GraphDocument {
  if (fixture === 'basic') {
    return createBasicDemoGraph()
  }

  const count = Number.parseInt(fixture, 10)
  return createBenchmarkFixture(count)
}

function createBenchmarkFixture(count: number): GraphDocument {
  const columns = Math.max(5, Math.round(Math.sqrt(count)))

  const nodes = Array.from({ length: count }, (_, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const status: 'running' | 'ready' = index % 5 === 0 ? 'running' : 'ready'

    return {
      id: `node-${index + 1}`,
      type: index % 9 === 0 ? 'trigger' : 'task',
      title: `Node ${index + 1}`,
      subtitle: index % 9 === 0 ? 'Trigger branch' : 'Fixture node',
      status,
      position: {
        x: column * 220,
        y: row * 128,
      },
      size: {
        width: 176,
        height: 84,
      },
      color: index % 2 === 0 ? '#38bdf8' : '#f97316',
    }
  })

  const edges = nodes.slice(1).map((node, index) => ({
    id: `edge-${index + 1}`,
    source: nodes[Math.max(0, index - 1)].id,
    target: node.id,
  }))

  return {
    version: '0.1.0',
    metadata: {
      fixture: `${count}-nodes`,
    },
    nodes,
    edges,
  }
}
