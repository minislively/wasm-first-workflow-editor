import type { GraphDocument } from '@minislively/workflow-types'

export function createBasicDemoGraph(): GraphDocument {
  return {
    version: '0.1.0',
    metadata: {
      name: 'Agent builder demo',
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        title: 'Trigger',
        subtitle: 'Listen for inbound event',
        status: 'ready',
        position: { x: 24, y: 96 },
        size: { width: 180, height: 88 },
        color: '#22c55e',
      },
      {
        id: 'classify',
        type: 'classifier',
        title: 'Classify',
        subtitle: 'Route by intent',
        status: 'running',
        position: { x: 288, y: 74 },
        size: { width: 200, height: 92 },
        color: '#38bdf8',
      },
      {
        id: 'research',
        type: 'research',
        title: 'Research',
        subtitle: 'Collect external context',
        status: 'ready',
        position: { x: 566, y: 48 },
        size: { width: 210, height: 94 },
        color: '#eab308',
      },
      {
        id: 'review',
        type: 'review',
        title: 'Review',
        subtitle: 'Human approval gate',
        status: 'idle',
        position: { x: 566, y: 208 },
        size: { width: 210, height: 94 },
        color: '#f97316',
      },
      {
        id: 'publish',
        type: 'publish',
        title: 'Publish',
        subtitle: 'Ship the result',
        status: 'idle',
        position: { x: 862, y: 126 },
        size: { width: 184, height: 90 },
        color: '#a855f7',
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'classify' },
      { id: 'e2', source: 'classify', target: 'research' },
      { id: 'e3', source: 'classify', target: 'review' },
      { id: 'e4', source: 'research', target: 'publish' },
      { id: 'e5', source: 'review', target: 'publish' },
    ],
  }
}
