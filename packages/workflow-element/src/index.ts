import { editorShellStyles, mergeTheme } from '@minislively/workflow-editor-shell'
import { EngineController } from '@minislively/workflow-engine-worker'
import { createBasicDemoGraph } from '@minislively/workflow-nodepack-basic'
import type {
  CanvasSize,
  EngineCommand,
  EngineEvent,
  GraphDocument,
  RuntimePreferences,
  SelectionSummary,
  ThemeTokens,
  WorkflowEditorOptions,
} from '@minislively/workflow-types'

const elementTag = 'workflow-editor'

export class WorkflowEditorElement extends HTMLElement {
  graph: GraphDocument = createBasicDemoGraph()
  theme?: Partial<ThemeTokens>
  preferences?: Partial<RuntimePreferences>
  shellMode: 'default' | 'stage-only' = 'default'

  private canvas?: HTMLCanvasElement
  private railList?: HTMLElement
  private inspectorList?: HTMLElement
  private statsBadge?: HTMLElement
  private statusBadge?: HTMLElement
  private resizeObserver?: ResizeObserver
  private worker?: Worker
  private controller?: EngineController

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })

      shadow.innerHTML = this.renderShell()
      this.canvas = shadow.querySelector('canvas') ?? undefined
      this.railList = shadow.querySelector('[data-role="rail-list"]') ?? undefined
      this.inspectorList =
        shadow.querySelector('[data-role="inspector-list"]') ?? undefined
      this.statsBadge = shadow.querySelector('[data-role="stats"]') ?? undefined
      this.statusBadge = shadow.querySelector('[data-role="status"]') ?? undefined
      this.bindToolbar()
      this.bindCanvas()
    }

    this.syncShell()
    this.startRuntime()
  }

  disconnectedCallback() {
    this.disposeRuntime()
  }

  async setGraph(graph: GraphDocument) {
    this.graph = graph
    this.syncShell()
    this.post({ type: 'load', graph })
  }

  setTheme(theme: Partial<ThemeTokens>) {
    this.theme = theme
    this.applyHostTheme()
    this.post({ type: 'theme.set', theme })
  }

  setPreferences(preferences: Partial<RuntimePreferences>) {
    this.preferences = {
      ...this.preferences,
      ...preferences,
    }
    this.post({ type: 'preferences.set', preferences })
  }

  private renderShell() {
    const shellClass = this.shellMode === 'stage-only' ? 'shell stage-only' : 'shell'

    return `
      <style>${editorShellStyles}</style>
      <div class="${shellClass}">
        <div class="topbar">
          <div class="brand">
            <div class="eyebrow">minislively / wasm-first</div>
            <div class="title">Embeddable Workflow Editor</div>
          </div>
          <div class="toolbar">
            <button data-command="zoom.out" type="button">Zoom out</button>
            <button data-command="zoom.in" type="button">Zoom in</button>
            <span class="stat-pill" data-role="status">booting</span>
            <span class="stat-pill" data-role="stats">0 nodes</span>
          </div>
        </div>
        <div class="body">
          <aside class="rail">
            <div class="panel-label">Workflow rail</div>
            <div class="rail-list" data-role="rail-list"></div>
          </aside>
          <div class="stage">
            <canvas></canvas>
            <div class="stage-note">
              Drag nodes or drag empty space to pan. This baseline keeps the shell customizable while the stage stays on the engine path.
            </div>
          </div>
          <aside class="inspector">
            <div class="panel-label">Inspector</div>
            <div class="inspector-list" data-role="inspector-list"></div>
          </aside>
        </div>
      </div>
    `
  }

  private bindToolbar() {
    this.shadowRoot?.querySelectorAll<HTMLButtonElement>('[data-command]').forEach((button) => {
      button.addEventListener('click', () => {
        this.post({
          type: button.dataset.command as EngineCommand['type'],
        } as EngineCommand)
      })
    })
  }

  private bindCanvas() {
    if (!this.canvas) {
      return
    }

    const emitPointer = (type: 'pointer.down' | 'pointer.move') => (event: PointerEvent) => {
      const rect = this.canvas!.getBoundingClientRect()
      this.post({
        type,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    }

    this.canvas.addEventListener('pointerdown', emitPointer('pointer.down'))
    window.addEventListener('pointermove', emitPointer('pointer.move'))
    window.addEventListener('pointerup', () => this.post({ type: 'pointer.up' }))
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault()
      const rect = this.canvas!.getBoundingClientRect()
      this.post({
        type: 'zoom',
        delta: event.deltaY > 0 ? -0.08 : 0.08,
        anchor: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      })
    })
  }

  private startRuntime() {
    if (!this.canvas || this.worker || this.controller) {
      return
    }

    this.applyHostTheme()

    const size = getCanvasSize(this.canvas)
    const readyHandler = (event: EngineEvent) => this.handleEngineEvent(event)

    if (
      'transferControlToOffscreen' in this.canvas &&
      typeof Worker !== 'undefined'
    ) {
      const offscreen = this.canvas.transferControlToOffscreen()
      this.worker = new Worker(new URL('./worker/engine.worker.ts', import.meta.url), {
        type: 'module',
      })
      this.worker.addEventListener('message', (message: MessageEvent<EngineEvent>) =>
        readyHandler(message.data),
      )
      this.worker.postMessage(
        {
          type: 'init',
          canvas: offscreen,
          graph: this.graph,
          size,
          theme: this.theme,
          preferences: this.preferences,
        },
        [offscreen],
      )
    } else {
      this.controller = new EngineController(this.canvas, readyHandler, this.theme)
      this.controller.handle({
        type: 'init',
        graph: this.graph,
        size,
        theme: this.theme,
        preferences: this.preferences,
      })
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.post({
        type: 'resize',
        size: getCanvasSize(this.canvas!),
      })
    })
    this.resizeObserver.observe(this.canvas)
  }

  private handleEngineEvent(event: EngineEvent) {
    switch (event.type) {
      case 'ready':
        if (this.statusBadge) {
          this.statusBadge.textContent =
            this.shellMode === 'stage-only'
              ? `${event.backend} · ${event.kernelSource}`
              : `${event.backend} · ${event.kernelSource}${event.fallbackReason ? ` · ${event.fallbackReason}` : ''}`
        }
        this.dispatchEvent(new CustomEvent('ready', { detail: event }))
        break
      case 'selection':
        this.renderInspector(event.selected)
        this.dispatchEvent(new CustomEvent('selection', { detail: event }))
        break
      case 'change':
        this.graph = event.graph
        this.syncShell()
        this.dispatchEvent(new CustomEvent('change', { detail: event }))
        break
      case 'stats':
        if (this.statsBadge) {
          this.statsBadge.textContent =
            this.shellMode === 'stage-only'
              ? `${event.nodeCount}n · ${event.edgeCount}e · ${event.zoom.toFixed(2)}x`
              : `${event.nodeCount} nodes · ${event.edgeCount} edges · ${event.zoom.toFixed(2)}x · ${event.backend} · ${event.kernelSource}`
        }
        this.dispatchEvent(new CustomEvent('stats', { detail: event }))
        break
      case 'error':
        if (this.statusBadge) {
          this.statusBadge.textContent = event.message
        }
        break
    }
  }

  private syncShell() {
    if (this.railList) {
      this.railList.innerHTML = this.graph.nodes
        .map(
          (node) => `
            <div class="rail-card">
              <strong>${node.title}</strong>
              <div>${node.subtitle ?? node.type}</div>
            </div>
          `,
        )
        .join('')
    }

    this.renderInspector([])
  }

  private renderInspector(selection: SelectionSummary[]) {
    if (!this.inspectorList) {
      return
    }

    if (selection.length === 0) {
      this.inspectorList.innerHTML = `
        <div class="inspector-card">
          <strong>No selection</strong>
          <div>Pick a node to inspect shell-driven details without moving form UI into the scene hot path.</div>
        </div>
      `
      return
    }

    this.inspectorList.innerHTML = selection
      .map(
        (item) => `
          <div class="inspector-card">
            <strong>${item.title}</strong>
            <div>${item.type}</div>
            <div>Status: ${item.status}</div>
          </div>
        `,
      )
      .join('')
  }

  private post(command: EngineCommand) {
    if (this.worker) {
      this.worker.postMessage(command)
      return
    }

    this.controller?.handle(command)
  }

  private applyHostTheme() {
    const theme = mergeTheme(this.theme)

    this.style.setProperty('--wf-shell-bg', theme.shellBg)
    this.style.setProperty('--wf-shell-panel', theme.shellPanel)
    this.style.setProperty('--wf-shell-border', theme.shellBorder)
    this.style.setProperty('--wf-shell-text', theme.shellText)
    this.style.setProperty('--wf-shell-muted', theme.shellMuted)
  }

  private disposeRuntime() {
    this.resizeObserver?.disconnect()
    this.post({ type: 'dispose' })
    this.worker?.terminate()
    this.worker = undefined
    this.controller = undefined
  }
}

export function defineWorkflowEditor() {
  if (!customElements.get(elementTag)) {
    customElements.define(elementTag, WorkflowEditorElement)
  }
}

export async function createWorkflowEditor(options: WorkflowEditorOptions) {
  defineWorkflowEditor()
  const element = document.createElement(elementTag) as WorkflowEditorElement
  element.graph = options.graph
  if (options.shellMode) {
    element.shellMode = options.shellMode
  }
  if (options.theme) {
    element.theme = options.theme
  }
  if (options.preferences) {
    element.preferences = options.preferences
  }
  options.mount.replaceChildren(element)

  return {
    element,
    dispose: () => element.remove(),
    setGraph: (graph: GraphDocument) => element.setGraph(graph),
    setTheme: (theme: Partial<ThemeTokens>) => element.setTheme(theme),
    setPreferences: (preferences: Partial<RuntimePreferences>) =>
      element.setPreferences(preferences),
  }
}

function getCanvasSize(canvas: HTMLCanvasElement): CanvasSize {
  const rect = canvas.getBoundingClientRect()

  return {
    width: Math.max(1, rect.width || 1200),
    height: Math.max(1, rect.height || 680),
    dpr: window.devicePixelRatio || 1,
  }
}
