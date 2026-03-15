import { describe, expect, it } from 'vitest'

import {
  createPerformanceLabState,
  getFixtureGraph,
  getFixtureInteractionContract,
  getProductDemoGraph,
  isDegradedFixture,
  resolvePerformanceLabEditability,
} from './index'

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
      allowExperimentalEditing: false,
      rendererPreference: 'auto',
      kernelPreference: 'auto',
    })
  })

  it('marks 500 and 1000 as degraded-by-default viewer tiers', () => {
    expect(getFixtureInteractionContract('500')).toMatchObject({
      tier: 'degraded-viewer',
      defaultEditability: 'read-only',
    })
    expect(getFixtureInteractionContract('1000')).toMatchObject({
      tier: 'degraded-viewer',
      defaultEditability: 'read-only',
    })
  })

  it('keeps the product demo on template-first example flows', () => {
    const graph = getProductDemoGraph('sales-escalation')

    expect(graph.metadata?.templateKey).toBe('sales-escalation')
    expect(graph.nodes.find((node) => node.id === 'publish')?.title).toBe('Send follow-up')
    expect(graph.nodes).toHaveLength(5)
  })

  it('requires an explicit override to enable editing on degraded tiers', () => {
    expect(isDegradedFixture('basic')).toBe(false)
    expect(isDegradedFixture('500')).toBe(true)
    expect(resolvePerformanceLabEditability('500', 'editable', false)).toBe('read-only')
    expect(resolvePerformanceLabEditability('500', 'editable', true)).toBe('editable')
  })
})
