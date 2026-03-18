export type Point = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type WorkflowNode = {
  id: string
  type: string
  title: string
  subtitle?: string
  status: 'idle' | 'running' | 'ready'
  position: Point
  size: Size
  color: string
}

export type WorkflowEdge = {
  id: string
  source: string
  target: string
}

export type SupportTier = 'guaranteed' | 'supported' | 'experimental'

export type WorkflowBuilderStateMetadata = {
  templateKey: string
  optionalNodes: {
    review: boolean
  }
  actionCount: number
  presetKeys: Partial<Record<string, string>>
  statusOverrides: Partial<Record<string, WorkflowNode['status']>>
}

export type WorkflowDocumentMetadata = {
  name?: string
  fixture?: string
  templateKey?: string
  templateSummary?: string
  supportTier?: SupportTier
  runtimeExpectation?: string
  builderState?: WorkflowBuilderStateMetadata
  extensions?: Record<string, unknown>
}

export type GraphDocument = {
  version: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  metadata?: WorkflowDocumentMetadata
}

export type ViewportState = {
  x: number
  y: number
  zoom: number
}

export type CanvasSize = {
  width: number
  height: number
  dpr: number
}

export type SelectionSummary = {
  id: string
  title: string
  type: string
  status: WorkflowNode['status']
}

export type ThemeTokens = {
  shellBg: string
  shellPanel: string
  shellBorder: string
  shellText: string
  shellMuted: string
  accent: string
  accentSoft: string
  canvasBg: string
  grid: string
  edge: string
  nodeFill: string
  nodeStroke: string
  nodeSelected: string
}

export type RendererBackend = 'webgl' | 'canvas2d'
export type WasmRuntimeSource = 'rust-wasm' | 'typescript-fallback'
export type Editability = 'editable' | 'read-only'
export type RendererPreference = 'auto' | 'webgl' | 'canvas'
export type KernelPreference = 'auto' | 'wasm' | 'ts-fallback'

export type RuntimePreferences = {
  editability: Editability
  rendererPreference: RendererPreference
  kernelPreference: KernelPreference
}

export type SceneSnapshot = {
  graph: GraphDocument
  nodeById: ReadonlyMap<string, WorkflowNode>
  viewport: ViewportState
  selectionIds: string[]
  size: CanvasSize
  theme: ThemeTokens
}

export type EngineInitCommand = {
  type: 'init'
  canvas?: OffscreenCanvas
  graph: GraphDocument
  size: CanvasSize
  theme?: Partial<ThemeTokens>
  preferences?: Partial<RuntimePreferences>
}

export type EngineCommand =
  | EngineInitCommand
  | { type: 'pointer.down'; x: number; y: number }
  | { type: 'pointer.move'; x: number; y: number }
  | { type: 'pointer.up' }
  | { type: 'resize'; size: CanvasSize }
  | { type: 'zoom'; delta: number; anchor?: Point }
  | { type: 'zoom.in' }
  | { type: 'zoom.out' }
  | { type: 'theme.set'; theme: Partial<ThemeTokens> }
  | { type: 'preferences.set'; preferences: Partial<RuntimePreferences> }
  | { type: 'load'; graph: GraphDocument }
  | { type: 'dispose' }

export type EngineEvent =
  | {
      type: 'ready'
      backend: RendererBackend
      kernelSource: WasmRuntimeSource
      preferences: RuntimePreferences
      fallbackReason: string | null
    }
  | { type: 'selection'; selected: SelectionSummary[] }
  | { type: 'change'; graph: GraphDocument }
  | {
      type: 'stats'
      backend: RendererBackend
      kernelSource: WasmRuntimeSource
      nodeCount: number
      edgeCount: number
      zoom: number
      preferences: RuntimePreferences
      fallbackReason: string | null
    }
  | { type: 'error'; message: string }

export type WorkflowEditorOptions = {
  mount: HTMLElement
  graph: GraphDocument
  theme?: Partial<ThemeTokens>
  preferences?: Partial<RuntimePreferences>
  shellMode?: 'default' | 'stage-only'
}

export function isWorkflowNodeStatus(
  value: unknown,
): value is WorkflowNode['status'] {
  return value === 'idle' || value === 'ready' || value === 'running'
}

export function isWorkflowBuilderStateMetadata(
  value: unknown,
): value is WorkflowBuilderStateMetadata {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.templateKey === 'string' &&
    isRecord(value.optionalNodes) &&
    typeof value.optionalNodes.review === 'boolean' &&
    typeof value.actionCount === 'number' &&
    isPartialStringRecord(value.presetKeys) &&
    isPartialWorkflowStatusRecord(value.statusOverrides)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPartialStringRecord(
  value: unknown,
): value is Partial<Record<string, string>> {
  if (value === undefined) {
    return true
  }

  if (!isRecord(value)) {
    return false
  }

  return Object.values(value).every((item) => item === undefined || typeof item === 'string')
}

function isPartialWorkflowStatusRecord(
  value: unknown,
): value is Partial<Record<string, WorkflowNode['status']>> {
  if (value === undefined) {
    return true
  }

  if (!isRecord(value)) {
    return false
  }

  return Object.values(value).every((item) => item === undefined || isWorkflowNodeStatus(item))
}
