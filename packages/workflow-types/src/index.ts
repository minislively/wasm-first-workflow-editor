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

export type GraphDocument = {
  version: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  metadata?: Record<string, unknown>
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

export type SceneSnapshot = {
  graph: GraphDocument
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
  | { type: 'load'; graph: GraphDocument }
  | { type: 'dispose' }

export type EngineEvent =
  | { type: 'ready'; backend: RendererBackend; kernelSource: WasmRuntimeSource }
  | { type: 'selection'; selected: SelectionSummary[] }
  | { type: 'change'; graph: GraphDocument }
  | {
      type: 'stats'
      backend: RendererBackend
      kernelSource: WasmRuntimeSource
      nodeCount: number
      edgeCount: number
      zoom: number
    }
  | { type: 'error'; message: string }

export type WorkflowEditorOptions = {
  mount: HTMLElement
  graph: GraphDocument
  theme?: Partial<ThemeTokens>
}
