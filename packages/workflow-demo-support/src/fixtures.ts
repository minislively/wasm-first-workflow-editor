import { createBasicDemoGraph } from '@minislively/workflow-nodepack-basic'
import type {
  Editability,
  GraphDocument,
  KernelPreference,
  RendererPreference,
  WorkflowNode,
} from '@minislively/workflow-types'

export type FixtureKey = 'basic' | '100' | '500' | '1000'

export type PerformanceLabState = {
  fixture: FixtureKey
  editability: Editability
  allowExperimentalEditing: boolean
  rendererPreference: RendererPreference
  kernelPreference: KernelPreference
}

export type FixtureInteractionContract = {
  tier: 'editing-baseline' | 'degraded-viewer'
  defaultEditability: Editability
  label: string
  detail: string
}

export type ProductDemoTemplateKey =
  | 'support-triage'
  | 'sales-escalation'
  | 'ops-incident'

export type ProductDemoTemplateOption = {
  key: ProductDemoTemplateKey
  label: string
  summary: string
}

type ProductDemoNodeOverrides = Record<string, Partial<WorkflowNode>>

type ProductDemoTemplateOverrides = {
  name: string
  summary: string
  nodes: ProductDemoNodeOverrides
}

const PRODUCT_DEMO_TEMPLATE_OPTIONS: readonly ProductDemoTemplateOption[] = [
  {
    key: 'support-triage',
    label: 'Support triage',
    summary: 'Webhook intake, issue classification, knowledge lookup, then an approval-backed reply.',
  },
  {
    key: 'sales-escalation',
    label: 'Sales escalation',
    summary: 'Lead qualification, CRM enrichment, rep approval, then a follow-up handoff.',
  },
  {
    key: 'ops-incident',
    label: 'Ops incident',
    summary: 'Alert intake, severity routing, investigation, mitigation approval, and status publish.',
  },
] as const

export function createPerformanceLabState(): PerformanceLabState {
  return {
    fixture: '100',
    editability: getFixtureInteractionContract('100').defaultEditability,
    allowExperimentalEditing: false,
    rendererPreference: 'auto',
    kernelPreference: 'auto',
  }
}

export function getFixtureInteractionContract(
  fixture: FixtureKey,
): FixtureInteractionContract {
  switch (fixture) {
    case 'basic':
      return {
        tier: 'editing-baseline',
        defaultEditability: 'editable',
        label: 'Editing-capable onboarding baseline',
        detail: 'Drag, pan, zoom, and selection are part of the public contract here.',
      }
    case '100':
      return {
        tier: 'editing-baseline',
        defaultEditability: 'editable',
        label: 'Editing-capable public baseline',
        detail: 'This fixture is the public editing baseline for trust checks and smoke evaluation.',
      }
    case '500':
      return {
        tier: 'degraded-viewer',
        defaultEditability: 'read-only',
        label: 'Degraded-by-default viewer tier',
        detail:
          '500 defaults to read-only so pan, zoom, diagnostics, and fixture load stay trustworthy without implying mature heavy editing.',
      }
    case '1000':
      return {
        tier: 'degraded-viewer',
        defaultEditability: 'read-only',
        label: 'Heavy degraded-by-default viewer tier',
        detail:
          '1000 defaults to read-only and should be treated as a public heavy-viewing baseline unless a host explicitly accepts editing risk.',
      }
  }
}

export function getFixtureGraph(fixture: FixtureKey): GraphDocument {
  if (fixture === 'basic') {
    return createBasicDemoGraph()
  }

  const count = Number.parseInt(fixture, 10)
  return createBenchmarkFixture(count)
}

export function getProductDemoTemplateOptions(): readonly ProductDemoTemplateOption[] {
  return PRODUCT_DEMO_TEMPLATE_OPTIONS
}

export function getProductDemoGraph(
  template: ProductDemoTemplateKey = 'support-triage',
): GraphDocument {
  const base = createBasicDemoGraph()
  const overrides = getTemplateOverrides(template)

  return {
    ...base,
    metadata: {
      ...base.metadata,
      name: overrides.name,
      templateKey: template,
      templateSummary: overrides.summary,
    },
    nodes: base.nodes.map((node) => {
      const next = overrides.nodes[node.id]

      return next
        ? {
            ...node,
            ...next,
          }
        : node
    }),
  }
}

export function isDegradedFixture(fixture: FixtureKey): boolean {
  return getFixtureInteractionContract(fixture).tier === 'degraded-viewer'
}

export function resolvePerformanceLabEditability(
  fixture: FixtureKey,
  requestedEditability: Editability,
  allowExperimentalEditing: boolean,
): Editability {
  if (isDegradedFixture(fixture) && !allowExperimentalEditing) {
    return 'read-only'
  }

  return requestedEditability
}

export function describeFixtureTier(fixture: FixtureKey): string {
  const contract = getFixtureInteractionContract(fixture)
  return `${contract.label}. ${contract.detail}`
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

function getTemplateOverrides(
  template: ProductDemoTemplateKey,
): ProductDemoTemplateOverrides {
  switch (template) {
    case 'support-triage':
      return {
        name: 'Support triage demo',
        summary:
          'Webhook intake to classification, knowledge lookup, and approval-backed response.',
        nodes: {
          trigger: {
            title: 'Webhook intake',
            subtitle: 'Support event enters the flow',
          },
          classify: {
            title: 'Classify issue',
            subtitle: 'Route by product area and severity',
            status: 'running' as const,
          },
          research: {
            title: 'Knowledge lookup',
            subtitle: 'Fetch answer context from docs',
          },
          review: {
            title: 'Agent review',
            subtitle: 'Escalate uncertain replies to a human',
          },
          publish: {
            title: 'Reply to customer',
            subtitle: 'Ship the approved response',
          },
        },
      }
    case 'sales-escalation':
      return {
        name: 'Sales escalation demo',
        summary:
          'Qualify the lead, enrich the account, hand off to a rep, and publish a follow-up.',
        nodes: {
          trigger: {
            title: 'Lead captured',
            subtitle: 'Inbound request or form submit',
          },
          classify: {
            title: 'Segment account',
            subtitle: 'Route by tier and geography',
            color: '#f97316',
          },
          research: {
            title: 'CRM enrich',
            subtitle: 'Pull firmographic and pipeline context',
            color: '#38bdf8',
          },
          review: {
            title: 'Rep approval',
            subtitle: 'Confirm pricing and next-step path',
            status: 'running' as const,
            color: '#eab308',
          },
          publish: {
            title: 'Send follow-up',
            subtitle: 'Publish the approved outreach',
          },
        },
      }
    case 'ops-incident':
      return {
        name: 'Ops incident demo',
        summary:
          'Alert-triggered incident handling with diagnosis, mitigation approval, and status publishing.',
        nodes: {
          trigger: {
            title: 'Alert received',
            subtitle: 'Open the incident workflow',
            color: '#ef4444',
          },
          classify: {
            title: 'Severity route',
            subtitle: 'Decide who gets paged now',
            color: '#f97316',
          },
          research: {
            title: 'Run investigation',
            subtitle: 'Collect logs and system health',
            status: 'running' as const,
            color: '#38bdf8',
          },
          review: {
            title: 'Mitigation approval',
            subtitle: 'Verify rollback or patch choice',
            color: '#eab308',
          },
          publish: {
            title: 'Post status update',
            subtitle: 'Publish to the incident room',
            color: '#22c55e',
          },
        },
      }
  }
}
