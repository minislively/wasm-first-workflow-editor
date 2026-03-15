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
    void loadWasmKernel().then((kernel) => {
      this.wasmKernel = kernel
      if (this.renderer) {
        this.emitRuntimeReady()
        this.render(false)
      }
    })
  }

  handle(command: EngineCommand) {
    switch (command.type) {
      case 'init':
        this.graph = command.graph
        this.theme = mergeTheme(command.theme)
        this.size = command.size
        this.mountRenderer()
        this.emitRuntimeReady()
        this.emitSelection()
        this.render(true)
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
      case 'dispose':
        this.renderer?.dispose()
        this.dragState = undefined
        break
    }
  }

  private mountRenderer() {
    const webgl = createWebGlRenderer(this.canvas, this.theme)

    this.renderer = webgl ?? createCanvasRenderer(this.canvas, this.theme)
    this.backend = this.renderer.backend
    this.renderer.resize(this.size)
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
      this.dragState = {
        kind: 'node',
        nodeId: node.id,
        pointerOffset: {
          x: worldPoint.x - node.position.x,
          y: worldPoint.y - node.position.y,
        },
      }
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
    })

    if (!bounds) {
      return
    }

    this.wasmKernel.boundsWidth(bounds.minX, bounds.maxX)
    this.wasmKernel.boundsHeight(bounds.minY, bounds.maxY)
  }
}
