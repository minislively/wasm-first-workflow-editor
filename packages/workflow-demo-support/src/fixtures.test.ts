import { describe, expect, it } from 'vitest'

import { createPerformanceLabState, getFixtureGraph } from './index'

describe('workflow-demo-support fixtures', () => {
  it('keeps the basic fixture small and product-oriented', () => {
    const graph = getFixtureGraph('basic')

    expect(graph.nodes.length).toBeGreaterThan(0)
    expect(graph.nodes.length).toBeLessThan(10)
    expect(graph.metadata?.name).toBe('Agent builder demo')
  })

  it('builds benchmark fixtures at the declared public sizes', () => {
    expect(getFixtureGraph('100').nodes).toHaveLength(100)
    expect(getFixtureGraph('500').nodes).toHaveLength(500)
    expect(getFixtureGraph('1000').nodes).toHaveLength(1000)

    expect(getFixtureGraph('100').edges).toHaveLength(99)
    expect(getFixtureGraph('500').edges).toHaveLength(499)
    expect(getFixtureGraph('1000').edges).toHaveLength(999)
  })

  it('defaults the performance lab to the public evaluation fixture', () => {
    expect(createPerformanceLabState()).toEqual({
      fixture: '100',
      editability: 'editable',
      rendererPreference: 'auto',
      kernelPreference: 'auto',
    })
  })
})
