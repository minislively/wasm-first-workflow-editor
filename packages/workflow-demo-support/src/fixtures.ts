import { createBasicDemoGraph } from '@minislively/workflow-nodepack-basic'
import type {
  Editability,
  GraphDocument,
  KernelPreference,
  Point,
  RendererPreference,
  Size,
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

export type ProductDemoBuilderNodeId =
  | 'trigger'
  | 'classify'
  | 'research'
  | 'review'
  | 'publish'
  | 'action'
  | 'action-2'
  | 'action-3'

export type ProductDemoFollowUpActionNodeId = 'action' | 'action-2' | 'action-3'

export type ProductDemoOptionalNodeFamily = 'review' | 'action'

export type ProductDemoNodePreset = {
  key: string
  label: string
  title: string
  subtitle: string
  status?: WorkflowNode['status']
  color?: string
}

export type ProductDemoBuilderNodeSummary = {
  id: ProductDemoBuilderNodeId
  label: string
  family: 'core' | 'optional'
  slotLabel: string
  panelTitle: string
  panelCopy: string
  presetLabel: string
  currentPresetKey: string
  currentPresetLabel: string
  currentTitle: string
  currentSubtitle: string
  currentStatus: WorkflowNode['status']
  presetOptions: readonly ProductDemoNodePreset[]
}

export type ProductDemoOptionalNodeOption = {
  family: ProductDemoOptionalNodeFamily
  nodeId: ProductDemoBuilderNodeId
  label: string
  summary: string
  enabled: boolean
  activeCount: number
  maxCount: number
  canAdd: boolean
  canRemove: boolean
}

type ProductDemoBuilderState = {
  templateKey: ProductDemoTemplateKey
  optionalNodes: {
    review: boolean
  }
  actionCount: number
  presetKeys: Partial<Record<ProductDemoBuilderNodeId, string>>
  statusOverrides: Partial<Record<ProductDemoBuilderNodeId, WorkflowNode['status']>>
}

type ProductDemoTemplateDefinition = ProductDemoTemplateOption & {
  name: string
  optionalNodes: {
    review: boolean
  }
  actionCount: number
  presetKeys: Record<
    'trigger' | 'classify' | 'research' | 'review' | 'publish' | 'action',
    string
  >
}

type ProductDemoNodeDefinition = {
  id: ProductDemoBuilderNodeId
  label: string
  slotLabel: string
  family: 'core' | 'optional'
  panelTitle: string
  panelCopy: string
  presetLabel: string
  defaultColor: string
  defaultStatus: WorkflowNode['status']
  defaultPosition: Point
  defaultSize: Size
  presetOptions: readonly ProductDemoNodePreset[]
}

const PRODUCT_DEMO_NODE_ORDER: readonly ProductDemoBuilderNodeId[] = [
  'trigger',
  'classify',
  'research',
  'review',
  'publish',
  'action',
  'action-2',
  'action-3',
]

const PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS: readonly ProductDemoFollowUpActionNodeId[] = [
  'action',
  'action-2',
  'action-3',
]

const FOLLOW_UP_ACTION_PRESET_OPTIONS: readonly ProductDemoNodePreset[] = [
  {
    key: 'action-slack',
    label: 'Slack summary',
    title: 'Slack summary',
    subtitle: 'Share the result to the builder team room',
    color: '#14b8a6',
  },
  {
    key: 'action-crm-note',
    label: 'CRM note',
    title: 'Write CRM note',
    subtitle: 'Attach the final handoff outcome to the account',
    color: '#0ea5e9',
  },
  {
    key: 'action-pager',
    label: 'Pager escalation',
    title: 'Pager escalation',
    subtitle: 'Notify the on-call engineer about the update',
    color: '#fb7185',
  },
]

const PRODUCT_DEMO_TEMPLATE_DEFINITIONS: Record<
  ProductDemoTemplateKey,
  ProductDemoTemplateDefinition
> = {
  'support-triage': {
    key: 'support-triage',
    label: 'Support triage',
    summary:
      'Webhook intake, issue classification, knowledge lookup, then an approval-backed reply.',
    name: 'Support triage playground',
    optionalNodes: {
      review: true,
    },
    actionCount: 0,
    presetKeys: {
      trigger: 'trigger-webhook',
      classify: 'classify-intent',
      research: 'research-knowledge',
      review: 'review-human',
      publish: 'publish-reply',
      action: 'action-slack',
    },
  },
  'sales-escalation': {
    key: 'sales-escalation',
    label: 'Sales escalation',
    summary:
      'Lead qualification, CRM enrichment, rep approval, then a follow-up handoff.',
    name: 'Sales escalation playground',
    optionalNodes: {
      review: true,
    },
    actionCount: 0,
    presetKeys: {
      trigger: 'trigger-crm',
      classify: 'classify-qualify',
      research: 'research-enrich',
      review: 'review-rep',
      publish: 'publish-follow-up',
      action: 'action-crm-note',
    },
  },
  'ops-incident': {
    key: 'ops-incident',
    label: 'Ops incident',
    summary:
      'Alert intake, severity routing, investigation, mitigation approval, and status publish.',
    name: 'Ops incident playground',
    optionalNodes: {
      review: true,
    },
    actionCount: 0,
    presetKeys: {
      trigger: 'trigger-alert',
      classify: 'classify-severity',
      research: 'research-logs',
      review: 'review-mitigation',
      publish: 'publish-status',
      action: 'action-pager',
    },
  },
}

const PRODUCT_DEMO_NODE_DEFINITIONS: Record<
  ProductDemoBuilderNodeId,
  ProductDemoNodeDefinition
> = {
  trigger: {
    id: 'trigger',
    label: 'Trigger',
    slotLabel: 'Entry',
    family: 'core',
    panelTitle: 'Trigger configuration',
    panelCopy:
      'Choose the trusted inbound event for the starter flow. The host swaps known trigger presets without taking over stage rendering.',
    presetLabel: 'Entry mode',
    defaultColor: '#22c55e',
    defaultStatus: 'ready',
    defaultPosition: { x: 24, y: 96 },
    defaultSize: { width: 180, height: 88 },
    presetOptions: [
      {
        key: 'trigger-webhook',
        label: 'Webhook intake',
        title: 'Webhook intake',
        subtitle: 'Listen for inbound support events',
      },
      {
        key: 'trigger-crm',
        label: 'CRM handoff',
        title: 'CRM handoff',
        subtitle: 'Start when a routed account needs follow-up',
        color: '#38bdf8',
      },
      {
        key: 'trigger-alert',
        label: 'Alert monitor',
        title: 'Alert monitor',
        subtitle: 'Open the flow when an incident alert fires',
        color: '#ef4444',
      },
    ],
  },
  classify: {
    id: 'classify',
    label: 'Router',
    slotLabel: 'Decision',
    family: 'core',
    panelTitle: 'Routing configuration',
    panelCopy:
      'Condition and routing behavior stay constrained to a few trustworthy presets so the playground does not imply unrestricted graph logic authoring.',
    presetLabel: 'Routing mode',
    defaultColor: '#38bdf8',
    defaultStatus: 'running',
    defaultPosition: { x: 288, y: 74 },
    defaultSize: { width: 200, height: 92 },
    presetOptions: [
      {
        key: 'classify-intent',
        label: 'Intent router',
        title: 'Intent router',
        subtitle: 'Route by request type and confidence',
      },
      {
        key: 'classify-qualify',
        label: 'Lead qualifier',
        title: 'Lead qualifier',
        subtitle: 'Score account fit before enrichment',
        color: '#f97316',
      },
      {
        key: 'classify-severity',
        label: 'Severity gate',
        title: 'Severity gate',
        subtitle: 'Escalate incidents by impact and urgency',
        color: '#fb7185',
      },
    ],
  },
  research: {
    id: 'research',
    label: 'Research',
    slotLabel: 'Context',
    family: 'core',
    panelTitle: 'Context step configuration',
    panelCopy:
      'API-backed lookup stays template-first. You can swap the supported research preset while the same engine-owned stage stays interactive.',
    presetLabel: 'Context source',
    defaultColor: '#eab308',
    defaultStatus: 'ready',
    defaultPosition: { x: 566, y: 48 },
    defaultSize: { width: 210, height: 94 },
    presetOptions: [
      {
        key: 'research-knowledge',
        label: 'Knowledge lookup',
        title: 'Knowledge lookup',
        subtitle: 'Fetch support context from docs and guides',
      },
      {
        key: 'research-enrich',
        label: 'CRM enrich',
        title: 'CRM enrich',
        subtitle: 'Pull firmographic and pipeline context',
        color: '#38bdf8',
      },
      {
        key: 'research-logs',
        label: 'Incident context',
        title: 'Incident context',
        subtitle: 'Collect logs and system health before action',
        status: 'running',
        color: '#0ea5e9',
      },
    ],
  },
  review: {
    id: 'review',
    label: 'Approval',
    slotLabel: 'Guardrail',
    family: 'optional',
    panelTitle: 'Approval step configuration',
    panelCopy:
      'This optional guardrail can be removed when the starter flow should stay linear, or re-added when a human gate is part of the public builder seam.',
    presetLabel: 'Approval mode',
    defaultColor: '#f97316',
    defaultStatus: 'idle',
    defaultPosition: { x: 566, y: 208 },
    defaultSize: { width: 210, height: 94 },
    presetOptions: [
      {
        key: 'review-human',
        label: 'Human approval',
        title: 'Human approval',
        subtitle: 'Escalate uncertain replies to a reviewer',
      },
      {
        key: 'review-rep',
        label: 'Rep approval',
        title: 'Rep approval',
        subtitle: 'Confirm pricing and next-step path',
        status: 'running',
        color: '#eab308',
      },
      {
        key: 'review-mitigation',
        label: 'Mitigation approval',
        title: 'Mitigation approval',
        subtitle: 'Verify rollback or patch choice before publish',
        color: '#f97316',
      },
    ],
  },
  publish: {
    id: 'publish',
    label: 'Publish',
    slotLabel: 'Output',
    family: 'core',
    panelTitle: 'Publish step configuration',
    panelCopy:
      'The output step is kept configurable through a small set of action presets so the page reads like a builder without promising arbitrary node authoring.',
    presetLabel: 'Publish action',
    defaultColor: '#a855f7',
    defaultStatus: 'idle',
    defaultPosition: { x: 862, y: 126 },
    defaultSize: { width: 184, height: 90 },
    presetOptions: [
      {
        key: 'publish-reply',
        label: 'Reply to customer',
        title: 'Reply to customer',
        subtitle: 'Ship the approved response',
      },
      {
        key: 'publish-follow-up',
        label: 'Send follow-up',
        title: 'Send follow-up',
        subtitle: 'Publish the approved outreach',
        color: '#8b5cf6',
      },
      {
        key: 'publish-status',
        label: 'Post status update',
        title: 'Post status update',
        subtitle: 'Publish to the incident room',
        color: '#22c55e',
      },
    ],
  },
  action: createFollowUpActionDefinition('action', 'Follow-up action', 'Optional action 1', 1158),
  'action-2': createFollowUpActionDefinition(
    'action-2',
    'Follow-up action 2',
    'Optional action 2',
    1454,
  ),
  'action-3': createFollowUpActionDefinition(
    'action-3',
    'Follow-up action 3',
    'Optional action 3',
    1750,
  ),
}

const PRODUCT_DEMO_OPTIONAL_NODE_OPTIONS: readonly Omit<
  ProductDemoOptionalNodeOption,
  'enabled' | 'activeCount' | 'maxCount' | 'canAdd' | 'canRemove'
>[] = [
  {
    family: 'review',
    nodeId: 'review',
    label: 'Approval gate',
    summary: 'Add or remove the supported human-review branch in a snapped lane.',
  },
  {
    family: 'action',
    nodeId: 'action',
    label: 'Follow-up action',
    summary:
      'Add up to three supported follow-up actions in a snapped chain for practical rendering and flow testing.',
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
  return Object.values(PRODUCT_DEMO_TEMPLATE_DEFINITIONS).map(
    ({ key, label, summary }) => ({
      key,
      label,
      summary,
    }),
  )
}

export function getProductDemoGraph(
  template: ProductDemoTemplateKey = 'support-triage',
): GraphDocument {
  return buildProductDemoGraph(createProductDemoBuilderState(template))
}

export function getProductDemoBuilderNodes(
  graph: GraphDocument,
): ProductDemoBuilderNodeSummary[] {
  const state = readProductDemoBuilderState(graph)

  return buildProductDemoNodeOrder(state).map((nodeId) => {
    const definition = PRODUCT_DEMO_NODE_DEFINITIONS[nodeId]
    const preset = getPresetByKey(nodeId, state.presetKeys[nodeId])
    const status = state.statusOverrides[nodeId] ?? preset.status ?? definition.defaultStatus

    return {
      id: nodeId,
      label: definition.label,
      family: definition.family,
      slotLabel: definition.slotLabel,
      panelTitle: definition.panelTitle,
      panelCopy: definition.panelCopy,
      presetLabel: definition.presetLabel,
      currentPresetKey: preset.key,
      currentPresetLabel: preset.label,
      currentTitle: preset.title,
      currentSubtitle: preset.subtitle,
      currentStatus: status,
      presetOptions: definition.presetOptions,
    }
  })
}

export function getProductDemoBuilderNode(
  graph: GraphDocument,
  nodeId: ProductDemoBuilderNodeId,
): ProductDemoBuilderNodeSummary | undefined {
  return getProductDemoBuilderNodes(graph).find((node) => node.id === nodeId)
}

export function getProductDemoOptionalNodeOptions(
  graph: GraphDocument,
): ProductDemoOptionalNodeOption[] {
  const state = readProductDemoBuilderState(graph)

  return PRODUCT_DEMO_OPTIONAL_NODE_OPTIONS.map((option) => {
    if (option.family === 'review') {
      return {
        ...option,
        enabled: state.optionalNodes.review,
        activeCount: state.optionalNodes.review ? 1 : 0,
        maxCount: 1,
        canAdd: !state.optionalNodes.review,
        canRemove: state.optionalNodes.review,
      }
    }

    return {
      ...option,
      enabled: state.actionCount > 0,
      activeCount: state.actionCount,
      maxCount: PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS.length,
      canAdd: state.actionCount < PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS.length,
      canRemove: state.actionCount > 0,
    }
  })
}

export function isProductDemoOptionalNodeEnabled(
  graph: GraphDocument,
  family: ProductDemoOptionalNodeFamily,
): boolean {
  const state = readProductDemoBuilderState(graph)
  return family === 'review' ? state.optionalNodes.review : state.actionCount > 0
}

export function setProductDemoTemplate(
  graph: GraphDocument,
  template: ProductDemoTemplateKey,
): GraphDocument {
  const state = createProductDemoBuilderState(template)
  return buildProductDemoGraph(state, graph)
}

export function setProductDemoNodePreset(
  graph: GraphDocument,
  nodeId: ProductDemoBuilderNodeId,
  presetKey: string,
): GraphDocument {
  const state = readProductDemoBuilderState(graph)

  if (!hasActiveNode(state, nodeId)) {
    return graph
  }

  state.presetKeys[nodeId] = getPresetByKey(nodeId, presetKey).key
  return buildProductDemoGraph(state, graph)
}

export function setProductDemoNodeStatus(
  graph: GraphDocument,
  nodeId: ProductDemoBuilderNodeId,
  status: WorkflowNode['status'],
): GraphDocument {
  const state = readProductDemoBuilderState(graph)

  if (!hasActiveNode(state, nodeId)) {
    return graph
  }

  state.statusOverrides[nodeId] = status
  return buildProductDemoGraph(state, graph)
}

export function setProductDemoOptionalNodeEnabled(
  graph: GraphDocument,
  family: ProductDemoOptionalNodeFamily,
  enabled: boolean,
): GraphDocument {
  const state = readProductDemoBuilderState(graph)

  if (family === 'review') {
    if (state.optionalNodes.review === enabled) {
      return graph
    }

    state.optionalNodes.review = enabled
    return buildProductDemoGraph(state, graph)
  }

  const nextCount = enabled ? Math.max(state.actionCount, 1) : 0
  if (nextCount === state.actionCount) {
    return graph
  }

  state.actionCount = nextCount
  return buildProductDemoGraph(state, graph)
}

export function addProductDemoOptionalNode(
  graph: GraphDocument,
  family: ProductDemoOptionalNodeFamily,
): GraphDocument {
  const state = readProductDemoBuilderState(graph)

  if (family === 'review') {
    if (state.optionalNodes.review) {
      return graph
    }

    state.optionalNodes.review = true
    return buildProductDemoGraph(state, graph)
  }

  if (state.actionCount >= PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS.length) {
    return graph
  }

  state.actionCount += 1
  return buildProductDemoGraph(state, graph)
}

export function removeProductDemoOptionalNode(
  graph: GraphDocument,
  family: ProductDemoOptionalNodeFamily,
): GraphDocument {
  const state = readProductDemoBuilderState(graph)

  if (family === 'review') {
    if (!state.optionalNodes.review) {
      return graph
    }

    state.optionalNodes.review = false
    return buildProductDemoGraph(state, graph)
  }

  if (state.actionCount === 0) {
    return graph
  }

  const removedNodeId = PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS[state.actionCount - 1]
  delete state.presetKeys[removedNodeId]
  delete state.statusOverrides[removedNodeId]
  state.actionCount -= 1
  return buildProductDemoGraph(state, graph)
}

export function getProductDemoTemplateSummary(
  graph: GraphDocument,
): ProductDemoTemplateOption {
  const state = readProductDemoBuilderState(graph)
  const definition = PRODUCT_DEMO_TEMPLATE_DEFINITIONS[state.templateKey]

  return {
    key: definition.key,
    label: definition.label,
    summary: definition.summary,
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

function createProductDemoBuilderState(
  template: ProductDemoTemplateKey,
): ProductDemoBuilderState {
  const definition = PRODUCT_DEMO_TEMPLATE_DEFINITIONS[template]

  return {
    templateKey: definition.key,
    optionalNodes: { ...definition.optionalNodes },
    actionCount: definition.actionCount,
    presetKeys: {
      ...definition.presetKeys,
      'action-2': definition.presetKeys.action,
      'action-3': definition.presetKeys.action,
    },
    statusOverrides: {},
  }
}

function readProductDemoBuilderState(graph: GraphDocument): ProductDemoBuilderState {
  const templateKey =
    isProductDemoTemplateKey(graph.metadata?.templateKey) &&
    PRODUCT_DEMO_TEMPLATE_DEFINITIONS[graph.metadata.templateKey]
      ? graph.metadata.templateKey
      : 'support-triage'
  const base = createProductDemoBuilderState(templateKey)
  const metadataState = readBuilderStateMetadata(graph)

  if (!metadataState) {
    return base
  }

  return {
    templateKey: metadataState.templateKey,
    optionalNodes: {
      review: metadataState.optionalNodes.review,
    },
    actionCount: metadataState.actionCount,
    presetKeys: normalizePresetKeys(metadataState.presetKeys, metadataState.templateKey),
    statusOverrides: normalizeStatusOverrides(metadataState.statusOverrides),
  }
}

function readBuilderStateMetadata(
  graph: GraphDocument,
): ProductDemoBuilderState | null {
  const builderState = graph.metadata?.builderState

  if (!isRecord(builderState)) {
    return null
  }

  const templateKey = builderState.templateKey
  const optionalNodes = builderState.optionalNodes
  const actionCount = builderState.actionCount
  const presetKeys = builderState.presetKeys
  const statusOverrides = builderState.statusOverrides

  if (
    !isProductDemoTemplateKey(templateKey) ||
    !isRecord(optionalNodes) ||
    typeof optionalNodes.review !== 'boolean' ||
    typeof actionCount !== 'number'
  ) {
    return null
  }

  return {
    templateKey,
    optionalNodes: {
      review: optionalNodes.review,
    },
    actionCount: clampActionCount(actionCount),
    presetKeys: isRecord(presetKeys) ? normalizePresetKeys(presetKeys, templateKey) : {},
    statusOverrides: isRecord(statusOverrides)
      ? normalizeStatusOverrides(statusOverrides)
      : {},
  }
}

function normalizePresetKeys(
  value: Record<string, unknown>,
  templateKey: ProductDemoTemplateKey,
): Partial<Record<ProductDemoBuilderNodeId, string>> {
  const defaults = createProductDemoBuilderState(templateKey).presetKeys
  const normalized: Partial<Record<ProductDemoBuilderNodeId, string>> = {}

  for (const nodeId of PRODUCT_DEMO_NODE_ORDER) {
    const presetKey = typeof value[nodeId] === 'string' ? value[nodeId] : defaults[nodeId]
    normalized[nodeId] = getPresetByKey(nodeId, presetKey).key
  }

  return normalized
}

function normalizeStatusOverrides(
  value: Record<string, unknown>,
): Partial<Record<ProductDemoBuilderNodeId, WorkflowNode['status']>> {
  const normalized: Partial<Record<ProductDemoBuilderNodeId, WorkflowNode['status']>> = {}

  for (const nodeId of PRODUCT_DEMO_NODE_ORDER) {
    const status = value[nodeId]

    if (status === 'idle' || status === 'ready' || status === 'running') {
      normalized[nodeId] = status
    }
  }

  return normalized
}

function buildProductDemoGraph(
  state: ProductDemoBuilderState,
  previousGraph?: GraphDocument,
): GraphDocument {
  const previousNodes = new Map(previousGraph?.nodes.map((node) => [node.id, node]) ?? [])
  const order = buildProductDemoNodeOrder(state)
  const nodes = order.map((nodeId) => createProductDemoNode(nodeId, state, previousNodes))

  return {
    version: '0.1.0',
    metadata: {
      name: PRODUCT_DEMO_TEMPLATE_DEFINITIONS[state.templateKey].name,
      templateKey: state.templateKey,
      templateSummary: PRODUCT_DEMO_TEMPLATE_DEFINITIONS[state.templateKey].summary,
      builderState: {
        templateKey: state.templateKey,
        optionalNodes: state.optionalNodes,
        actionCount: state.actionCount,
        presetKeys: state.presetKeys,
        statusOverrides: state.statusOverrides,
      },
    },
    nodes,
    edges: buildProductDemoEdges(state),
  }
}

function createProductDemoNode(
  nodeId: ProductDemoBuilderNodeId,
  state: ProductDemoBuilderState,
  previousNodes: Map<string, WorkflowNode>,
): WorkflowNode {
  const definition = PRODUCT_DEMO_NODE_DEFINITIONS[nodeId]
  const preset = getPresetByKey(nodeId, state.presetKeys[nodeId])
  const previousNode = previousNodes.get(nodeId)

  return {
    id: nodeId,
    type: isFollowUpActionNodeId(nodeId) ? 'action' : nodeId,
    title: preset.title,
    subtitle: preset.subtitle,
    status: state.statusOverrides[nodeId] ?? preset.status ?? definition.defaultStatus,
    position: previousNode?.position ?? definition.defaultPosition,
    size: previousNode?.size ?? definition.defaultSize,
    color: preset.color ?? definition.defaultColor,
  }
}

function buildProductDemoEdges(state: ProductDemoBuilderState) {
  const edges = [
    { id: 'e1', source: 'trigger', target: 'classify' },
    { id: 'e2', source: 'classify', target: 'research' },
    { id: 'e4', source: 'research', target: 'publish' },
  ]

  if (state.optionalNodes.review) {
    edges.push(
      { id: 'e3', source: 'classify', target: 'review' },
      { id: 'e5', source: 'review', target: 'publish' },
    )
  }

  const activeActions = PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS.slice(0, state.actionCount)
  if (activeActions.length > 0) {
    edges.push({ id: 'e6', source: 'publish', target: activeActions[0] })

    for (let index = 1; index < activeActions.length; index += 1) {
      edges.push({
        id: `e-action-${index + 6}`,
        source: activeActions[index - 1],
        target: activeActions[index],
      })
    }
  }

  return edges
}

function buildProductDemoNodeOrder(
  state: ProductDemoBuilderState,
): ProductDemoBuilderNodeId[] {
  const order: ProductDemoBuilderNodeId[] = ['trigger', 'classify', 'research']

  if (state.optionalNodes.review) {
    order.push('review')
  }

  order.push('publish')
  order.push(...PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS.slice(0, state.actionCount))

  return order
}

function hasActiveNode(
  state: ProductDemoBuilderState,
  nodeId: ProductDemoBuilderNodeId,
) {
  if (nodeId === 'review') {
    return state.optionalNodes.review
  }

  if (isFollowUpActionNodeId(nodeId)) {
    return PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS
      .slice(0, state.actionCount)
      .includes(nodeId)
  }

  return true
}

function getPresetByKey(
  nodeId: ProductDemoBuilderNodeId,
  presetKey?: string,
): ProductDemoNodePreset {
  const definition = PRODUCT_DEMO_NODE_DEFINITIONS[nodeId]

  return (
    definition.presetOptions.find((preset) => preset.key === presetKey) ??
    definition.presetOptions[0]
  )
}

function createFollowUpActionDefinition(
  id: ProductDemoFollowUpActionNodeId,
  label: string,
  slotLabel: string,
  x: number,
): ProductDemoNodeDefinition {
  return {
    id,
    label,
    slotLabel,
    family: 'optional',
    panelTitle: 'Follow-up action configuration',
    panelCopy:
      'This bounded follow-up chain is for practical rendering and flow testing. Added nodes snap into the supported seam instead of implying free placement.',
    presetLabel: 'Follow-up action',
    defaultColor: '#14b8a6',
    defaultStatus: 'idle',
    defaultPosition: { x, y: 126 },
    defaultSize: { width: 192, height: 90 },
    presetOptions: FOLLOW_UP_ACTION_PRESET_OPTIONS,
  }
}

function isFollowUpActionNodeId(
  value: ProductDemoBuilderNodeId,
): value is ProductDemoFollowUpActionNodeId {
  return PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS.includes(value as ProductDemoFollowUpActionNodeId)
}

function clampActionCount(value: number) {
  return Math.max(0, Math.min(PRODUCT_DEMO_FOLLOW_UP_ACTION_IDS.length, Math.floor(value)))
}

function isProductDemoTemplateKey(value: unknown): value is ProductDemoTemplateKey {
  return value === 'support-triage' || value === 'sales-escalation' || value === 'ops-incident'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
