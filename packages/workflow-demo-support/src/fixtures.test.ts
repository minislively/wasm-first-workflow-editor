import { describe, expect, it } from 'vitest'

import {
  addProductDemoOptionalNode,
  createPerformanceLabState,
  getFixtureGraph,
  getFixtureInteractionContract,
  getProductDemoBuilderNode,
  getProductDemoBuilderNodes,
  getProductDemoGraph,
  getProductDemoOptionalNodeOptions,
  isDegradedFixture,
  removeProductDemoOptionalNode,
  resolvePerformanceLabEditability,
  setProductDemoNodePreset,
  setProductDemoNodeStatus,
  setProductDemoOptionalNodeEnabled,
  setProductDemoTemplate,
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

  it('lists the builder seam for the default starter flow', () => {
    const graph = getProductDemoGraph()

    expect(getProductDemoBuilderNodes(graph).map((node) => node.id)).toEqual([
      'trigger',
      'classify',
      'research',
      'review',
      'publish',
    ])
  })

  it('switches the starter flow defaults when the template changes', () => {
    const graph = setProductDemoTemplate(getProductDemoGraph(), 'ops-incident')

    expect(graph.metadata?.templateKey).toBe('ops-incident')
    expect(getProductDemoBuilderNode(graph, 'trigger')?.currentTitle).toBe('Alert monitor')
  })

  it('updates a builder node preset through the shared helper', () => {
    const graph = setProductDemoNodePreset(
      getProductDemoGraph(),
      'classify',
      'classify-severity',
    )

    expect(getProductDemoBuilderNode(graph, 'classify')?.currentTitle).toBe('Severity gate')
  })

  it('updates a builder node status through the shared helper', () => {
    const graph = setProductDemoNodeStatus(getProductDemoGraph(), 'publish', 'running')

    expect(getProductDemoBuilderNode(graph, 'publish')?.currentStatus).toBe('running')
  })

  it('adds the supported follow-up action node through the bounded playground seam', () => {
    const graph = addProductDemoOptionalNode(getProductDemoGraph(), 'action')

    expect(getProductDemoOptionalNodeOptions(graph)).toContainEqual(
      expect.objectContaining({
        family: 'action',
        enabled: true,
        activeCount: 1,
      }),
    )
    expect(getProductDemoBuilderNodes(graph).map((node) => node.id)).toContain('action')
  })

  it('keeps bounded supported node families explicit when multiple playground nodes are active', () => {
    const graph = addProductDemoOptionalNode(
      addProductDemoOptionalNode(getProductDemoGraph(), 'action'),
      'action',
    )

    expect(
      getProductDemoOptionalNodeOptions(graph).find((option) => option.family === 'action'),
    ).toMatchObject({
      activeCount: 2,
      maxCount: 3,
      canAdd: true,
      canRemove: true,
    })
    expect(getProductDemoBuilderNodes(graph).map((node) => node.id)).toEqual(
      expect.arrayContaining(['review', 'action', 'action-2']),
    )
  })

  it('removes only the last repeated follow-up action node when shrinking the chain', () => {
    const graph = removeProductDemoOptionalNode(
      addProductDemoOptionalNode(
        addProductDemoOptionalNode(getProductDemoGraph(), 'action'),
        'action',
      ),
      'action',
    )

    expect(getProductDemoBuilderNodes(graph).map((node) => node.id)).toEqual(
      expect.arrayContaining(['action']),
    )
    expect(getProductDemoBuilderNodes(graph).map((node) => node.id)).not.toContain('action-2')
  })

  it('removes the supported approval gate when disabled', () => {
    const graph = setProductDemoOptionalNodeEnabled(getProductDemoGraph(), 'review', false)

    expect(getProductDemoOptionalNodeOptions(graph)).toContainEqual(
      expect.objectContaining({
        family: 'review',
        enabled: false,
      }),
    )
    expect(getProductDemoBuilderNodes(graph).map((node) => node.id)).not.toContain('review')
  })

  it('requires an explicit override to enable editing on degraded tiers', () => {
    expect(isDegradedFixture('basic')).toBe(false)
    expect(isDegradedFixture('500')).toBe(true)
    expect(resolvePerformanceLabEditability('500', 'editable', false)).toBe('read-only')
    expect(resolvePerformanceLabEditability('500', 'editable', true)).toBe('editable')
  })
})
