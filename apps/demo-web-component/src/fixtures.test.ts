import { describe, expect, it } from 'vitest'

import { getFixtureGraph } from './fixtures'

describe('demo-web-component fixtures', () => {
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
})
