import { describe, expect, it } from 'vitest'

import { EngineController } from './index'
import type {
  EngineEvent,
  GraphDocument,
  ThemeTokens,
} from '@minislively/workflow-types'

const graph: GraphDocument = {
  version: '0.1.0',
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
    {
      id: 'b',
      type: 'publish',
      title: 'Publish',
      status: 'idle',
      position: { x: 220, y: 120 },
      size: { width: 120, height: 72 },
      color: '#38bdf8',
    },
  ],
  edges: [
    { id: 'e1', source: 'a', target: 'b' },
  ],
}

describe('workflow-engine-worker', () => {
  it('emits runtime and graph updates while preserving counts during node drag', () => {
    const events: EngineEvent[] = []
    const controller = new EngineController(
      createStubCanvas(),
      (event) => events.push(event),
    )

    controller.handle({
      type: 'init',
      graph,
      size: { width: 1280, height: 720, dpr: 1 },
      preferences: {
        rendererPreference: 'canvas',
        kernelPreference: 'ts-fallback',
      },
    })

    controller.handle({
      type: 'pointer.down',
      x: 110,
      y: 60,
    })
    controller.handle({
      type: 'pointer.move',
      x: 150,
      y: 100,
    })
    controller.handle({
      type: 'pointer.up',
    })

    const readyEvents = events.filter((event) => event.type === 'ready')
    const changeEvents = events.filter((event) => event.type === 'change')
    const statsEvents = events.filter((event) => event.type === 'stats')

    expect(readyEvents.at(-1)).toMatchObject({
      type: 'ready',
      backend: 'canvas2d',
      kernelSource: 'typescript-fallback',
      fallbackReason: 'kernel forced to typescript fallback',
    })
    expect(statsEvents.at(-1)).toMatchObject({
      type: 'stats',
      nodeCount: 2,
      edgeCount: 1,
    })
    expect(changeEvents.at(-1)).toMatchObject({
      type: 'change',
      graph: expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({
            id: 'a',
            position: { x: 50, y: 60 },
          }),
        ]),
      }),
    })
  })

  it('rebuilds derived state on load and clears stale selection ids', () => {
    const events: EngineEvent[] = []
    const controller = new EngineController(
      createStubCanvas(),
      (event) => events.push(event),
    )

    controller.handle({
      type: 'init',
      graph,
      size: { width: 1280, height: 720, dpr: 1 },
      preferences: {
        rendererPreference: 'canvas',
        kernelPreference: 'ts-fallback',
      },
    })

    controller.handle({
      type: 'pointer.down',
      x: 110,
      y: 60,
    })

    const loadedGraph: GraphDocument = {
      version: '0.1.0',
      nodes: [
        {
          id: 'z',
          type: 'trigger',
          title: 'Fresh',
          status: 'ready',
          position: { x: 30, y: 40 },
          size: { width: 100, height: 60 },
          color: '#22c55e',
        },
      ],
      edges: [],
    }

    controller.handle({
      type: 'load',
      graph: loadedGraph,
    })

    const selectionEvents = events.filter((event) => event.type === 'selection')
    const statsEvents = events.filter((event) => event.type === 'stats')

    expect(selectionEvents.at(-1)).toEqual({
      type: 'selection',
      selected: [],
    })
    expect(statsEvents.at(-1)).toMatchObject({
      type: 'stats',
      nodeCount: 1,
      edgeCount: 0,
    })
  })
})

function createStubCanvas() {
  const context = createStubContext()

  return {
    width: 0,
    height: 0,
    getContext(type: string) {
      if (type === '2d') {
        return context
      }

      return null
    },
  } as unknown as HTMLCanvasElement
}

function createStubContext(): CanvasRenderingContext2D {
  const noop = () => undefined

  return {
    clearRect: noop,
    fillRect: noop,
    setTransform: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    save: noop,
    restore: noop,
    translate: noop,
    scale: noop,
    bezierCurveTo: noop,
    fill: noop,
    fillText: noop,
    arcTo: noop,
    closePath: noop,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    font: '',
  } as unknown as CanvasRenderingContext2D
}
