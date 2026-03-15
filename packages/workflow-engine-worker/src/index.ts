import {
  defaultViewport,
  findNodeAt,
  getSelectionSummary,
  moveNode,
} from '@minislively/workflow-core'
import { createCanvasRenderer } from '@minislively/workflow-renderer-canvas'
import { createWebGlRenderer } from '@minislively/workflow-renderer-webgl'
import type {
  CanvasSize,
  EngineCommand,
  EngineEvent,
  GraphDocument,
  Point,
  RendererBackend,
  RuntimePreferences,
  ThemeTokens,
  ViewportState,
} from '@minislively/workflow-types'
import {
  computeSceneBounds,
  getFallbackKernel,
  loadWasmKernel,
  panViewportState,
  screenToWorldPoint,
  type WorkflowWasmKernel,
  zoomViewportState,
} from '@minislively/workflow-wasm-core'

import { mergeTheme } from '@minislively/workflow-editor-shell'

type DragState =
  | {
      kind: 'node'
      nodeId: string
      pointerOffset: Point
    }
  | {
      kind: 'pan'
      startPointer: Point
      startViewport: ViewportState
    }

type RendererHandle = ReturnType<typeof createCanvasRenderer> | NonNullable<ReturnType<typeof createWebGlRenderer>>

export class EngineController {
  private readonly canvas: HTMLCanvasElement | OffscreenCanvas
  private readonly emit: (event: EngineEvent) => void
  private graph: GraphDocument
  private viewport: ViewportState = { ...defaultViewport }
  private selectionIds: string[] = []
  private size: CanvasSize = { width: 1280, height: 720, dpr: 1 }
  private dragState?: DragState
  private renderer?: RendererHandle
  private theme: ThemeTokens
  private backend: RendererBackend = 'canvas2d'
  private wasmKernel: WorkflowWasmKernel = getFallbackKernel()
  private preferences: RuntimePreferences = {
    editability: 'editable',
    rendererPreference: 'auto',
    kernelPreference: 'auto',
  }
  private rendererFallbackReason: string | null = null
  private kernelFallbackReason: string | null = null

  constructor(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    emit: (event: EngineEvent) => void,
    initialTheme?: Partial<ThemeTokens>,
  ) {
    this.canvas = canvas
    this.emit = emit
    this.graph = {
      version: '0',
      nodes: [],
      edges: [],
    }
    this.theme = mergeTheme(initialTheme)
  }

  handle(command: EngineCommand) {
    switch (command.type) {
      case 'init':
        this.graph = command.graph
        this.theme = mergeTheme(command.theme)
        this.size = command.size
        this.preferences = {
          ...this.preferences,
          ...command.preferences,
        }
        this.mountRenderer()
        this.emitRuntimeReady()
        this.emitSelection()
        this.render(true)
        void this.refreshKernel()
        break
      case 'load':
        this.graph = command.graph
        this.render(true)
        break
      case 'resize':
        this.size = command.size
        this.renderer?.resize(command.size)
        this.render(false)
        break
      case 'pointer.down':
        this.pointerDown({ x: command.x, y: command.y })
        break
      case 'pointer.move':
        this.pointerMove({ x: command.x, y: command.y })
        break
      case 'pointer.up':
        this.dragState = undefined
        break
      case 'zoom':
        this.viewport = zoomViewportState(
          this.viewport,
          command.delta,
          command.anchor ?? {
            x: this.size.width / 2,
            y: this.size.height / 2,
          },
          this.wasmKernel,
        )
        this.render(false)
        break
      case 'zoom.in':
        this.viewport = zoomViewportState(
          this.viewport,
          0.12,
          {
            x: this.size.width / 2,
            y: this.size.height / 2,
          },
          this.wasmKernel,
        )
        this.render(false)
        break
      case 'zoom.out':
        this.viewport = zoomViewportState(
          this.viewport,
          -0.12,
          {
            x: this.size.width / 2,
            y: this.size.height / 2,
          },
          this.wasmKernel,
        )
        this.render(false)
        break
      case 'theme.set':
        this.theme = mergeTheme(command.theme)
        this.render(false)
        break
      case 'preferences.set':
        void this.applyPreferences(command.preferences)
        break
      case 'dispose':
        this.renderer?.dispose()
        this.dragState = undefined
        break
    }
  }

  private mountRenderer() {
    this.renderer?.dispose()
    this.rendererFallbackReason = null

    const preferred = this.preferences.rendererPreference
    const webgl = preferred === 'canvas' ? null : createWebGlRenderer(this.canvas, this.theme)

    if (preferred === 'webgl' && !webgl) {
      this.renderer = createCanvasRenderer(this.canvas, this.theme)
      this.rendererFallbackReason = 'webgl unavailable; fell back to canvas2d'
    } else if (preferred === 'auto' && !webgl) {
      this.renderer = createCanvasRenderer(this.canvas, this.theme)
      this.rendererFallbackReason = 'auto renderer resolved to canvas2d fallback'
    } else {
      this.renderer = webgl ?? createCanvasRenderer(this.canvas, this.theme)
    }

    this.backend = this.renderer.backend
    this.renderer.resize(this.size)
  }

  private async refreshKernel() {
    const preference = this.preferences.kernelPreference
    this.kernelFallbackReason = null

    if (preference === 'ts-fallback') {
      this.wasmKernel = getFallbackKernel()
      this.kernelFallbackReason = 'kernel forced to typescript fallback'
      this.emitRuntimeReady()
      this.render(false)
      return
    }

    const kernel = await loadWasmKernel()
    if (preference === 'wasm' && kernel.source !== 'rust-wasm') {
      this.kernelFallbackReason = 'wasm kernel unavailable; using typescript fallback'
    } else if (preference === 'auto' && kernel.source !== 'rust-wasm') {
      this.kernelFallbackReason = 'auto kernel resolved to typescript fallback'
    }

    this.wasmKernel = kernel
    this.emitRuntimeReady()
    this.render(false)
  }

  private async applyPreferences(preferences: Partial<RuntimePreferences>) {
    const previousRenderer = this.preferences.rendererPreference
    const previousKernel = this.preferences.kernelPreference

    this.preferences = {
      ...this.preferences,
      ...preferences,
    }

    if (previousRenderer !== this.preferences.rendererPreference) {
      this.mountRenderer()
    }

    if (previousKernel !== this.preferences.kernelPreference) {
      await this.refreshKernel()
      return
    }

    this.emitRuntimeReady()
    this.render(false)
  }

  private pointerDown(screenPoint: Point) {
    const worldPoint = screenToWorldPoint(
      screenPoint,
      this.viewport,
      this.wasmKernel,
    )
    const node = findNodeAt(this.graph, worldPoint)

    if (node) {
      this.selectionIds = [node.id]
      this.dragState =
        this.preferences.editability === 'editable'
          ? {
              kind: 'node',
              nodeId: node.id,
              pointerOffset: {
                x: worldPoint.x - node.position.x,
                y: worldPoint.y - node.position.y,
              },
            }
          : undefined
      this.emitSelection()
      this.render(false)
      return
    }

    this.selectionIds = []
    this.dragState = {
      kind: 'pan',
      startPointer: screenPoint,
      startViewport: this.viewport,
    }
    this.emitSelection()
    this.render(false)
  }

  private pointerMove(screenPoint: Point) {
    if (!this.dragState) {
      return
    }

    if (this.dragState.kind === 'pan') {
      this.viewport = panViewportState(
        this.dragState.startViewport,
        screenPoint.x - this.dragState.startPointer.x,
        screenPoint.y - this.dragState.startPointer.y,
        this.wasmKernel,
      )
      this.render(false)
      return
    }

    const worldPoint = screenToWorldPoint(
      screenPoint,
      this.viewport,
      this.wasmKernel,
    )
    this.graph = moveNode(this.graph, this.dragState.nodeId, {
      x: worldPoint.x - this.dragState.pointerOffset.x,
      y: worldPoint.y - this.dragState.pointerOffset.y,
    })
    this.render(true)
  }

  private emitSelection() {
    this.emit({
      type: 'selection',
      selected: getSelectionSummary(this.graph, this.selectionIds),
    })
  }

  private emitRuntimeReady() {
    this.emit({
      type: 'ready',
      backend: this.backend,
      kernelSource: this.wasmKernel.source,
      preferences: this.preferences,
      fallbackReason: this.getFallbackReason(),
    })
  }

  private render(emitChange: boolean) {
    this.renderer?.render({
      graph: this.graph,
      viewport: this.viewport,
      selectionIds: this.selectionIds,
      size: this.size,
      theme: this.theme,
    })
    if (emitChange) {
      this.emit({
        type: 'change',
        graph: this.graph,
      })
    }
    const bounds = this.graph.nodes.length > 0 ? computeSceneBounds(this.graph) : undefined
    this.emit({
      type: 'stats',
      backend: this.backend,
      kernelSource: this.wasmKernel.source,
      nodeCount: this.graph.nodes.length,
      edgeCount: this.graph.edges.length,
      zoom: this.viewport.zoom,
      preferences: this.preferences,
      fallbackReason: this.getFallbackReason(),
    })

    if (!bounds) {
      return
    }

    this.wasmKernel.boundsWidth(bounds.minX, bounds.maxX)
    this.wasmKernel.boundsHeight(bounds.minY, bounds.maxY)
  }

  private getFallbackReason() {
    return [this.rendererFallbackReason, this.kernelFallbackReason]
      .filter(Boolean)
      .join(' | ') || null
  }
}
