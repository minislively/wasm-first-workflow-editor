import './style.css'

import { createWorkflowEditor } from '@minislively/workflow-element'
import type {
  EngineEvent,
  GraphDocument,
  RuntimePreferences,
  SelectionSummary,
} from '@minislively/workflow-types'

import { getFixtureGraph, type FixtureKey } from './fixtures'
import {
  createSurfaceState,
  type DemoSurfaceState,
  type SurfaceMode,
} from './surface-state'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root was not found.')
}

type DiagnosticsState = {
  backend: string
  kernelSource: string
  nodeCount: number
  edgeCount: number
  zoom: number
  fallbackReason: string | null
  preferences: RuntimePreferences
}

const state: DemoSurfaceState = createSurfaceState('product-demo')

let diagnostics: DiagnosticsState = {
  backend: 'pending',
  kernelSource: 'pending',
  nodeCount: 0,
  edgeCount: 0,
  zoom: 1,
  fallbackReason: null,
  preferences: {
    editability: 'editable',
    rendererPreference: 'auto',
    kernelPreference: 'auto',
  },
}

let selection: SelectionSummary[] = []
let currentGraph: GraphDocument = getFixtureGraph(state.fixture)

app.innerHTML = `
  <main class="page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">phase 1 public surface</p>
        <h1>One demo surface, two explicit intents.</h1>
        <p class="lede">
          Product Demo helps first-time OSS users feel the editor immediately. Performance Lab lets performance-sensitive teams load fixtures, inspect runtime state, and judge fit without leaving the browser.
        </p>
      </div>
      <div class="hero-stack">
        <div class="hero-pill">Primary: Web Component</div>
        <div class="hero-pill">Secondary: React wrapper</div>
        <div class="hero-pill">Boundary: engine strict / shell flexible</div>
      </div>
    </section>
    <section class="surface-shell">
      <div class="surface-header">
        <div class="mode-tabs">
          <button data-mode="product-demo" class="mode-tab is-active" type="button">Product Demo</button>
          <button data-mode="performance-lab" class="mode-tab" type="button">Performance Lab</button>
        </div>
        <div class="surface-summary" data-role="surface-summary"></div>
      </div>
      <div class="surface-layout">
        <aside class="control-panel">
          <section class="panel-card" data-role="mode-copy"></section>
          <section class="panel-card">
            <div class="panel-label">Fixture</div>
            <div class="fixture-grid">
              <button data-fixture="basic" class="fixture-chip is-active" type="button">Basic</button>
              <button data-fixture="100" class="fixture-chip" type="button">100</button>
              <button data-fixture="500" class="fixture-chip" type="button">500</button>
              <button data-fixture="1000" class="fixture-chip" type="button">1000</button>
            </div>
          </section>
          <section class="panel-card lab-controls-card" data-role="lab-controls-card">
            <div class="panel-label">Lab Controls</div>
            <div class="control-stack">
              <label>
                <span>Editability</span>
                <select data-control="editability">
                  <option value="editable">editable</option>
                  <option value="read-only">read-only</option>
                </select>
              </label>
              <label>
                <span>Renderer</span>
                <select data-control="rendererPreference">
                  <option value="auto">auto</option>
                  <option value="webgl">webgl</option>
                  <option value="canvas">canvas</option>
                </select>
              </label>
              <label>
                <span>Kernel</span>
                <select data-control="kernelPreference">
                  <option value="auto">auto</option>
                  <option value="wasm">wasm</option>
                  <option value="ts-fallback">ts-fallback</option>
                </select>
              </label>
            </div>
          </section>
          <section class="panel-card diagnostics-card" data-role="diagnostics-card"></section>
          <section class="panel-card">
            <div class="panel-label">Selection</div>
            <div class="selection-list" data-role="selection-list"></div>
          </section>
        </aside>
        <section class="editor-shell">
          <div id="mount"></div>
        </section>
      </div>
    </section>
  </main>
`

const mount = document.querySelector<HTMLElement>('#mount')!
const editor = await createWorkflowEditor({
  mount,
  graph: currentGraph,
  theme: {
    accent: '#14b8a6',
    nodeSelected: '#14b8a6',
  },
  preferences: {
    editability: state.editability,
    rendererPreference: state.rendererPreference,
    kernelPreference: state.kernelPreference,
  },
})

editor.element.addEventListener('ready', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'ready') {
    return
  }

  diagnostics = {
    ...diagnostics,
    backend: detail.backend,
    kernelSource: detail.kernelSource,
    fallbackReason: detail.fallbackReason,
    preferences: detail.preferences,
  }
  renderPanels()
})

editor.element.addEventListener('stats', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'stats') {
    return
  }

  diagnostics = {
    backend: detail.backend,
    kernelSource: detail.kernelSource,
    nodeCount: detail.nodeCount,
    edgeCount: detail.edgeCount,
    zoom: detail.zoom,
    fallbackReason: detail.fallbackReason,
    preferences: detail.preferences,
  }
  renderPanels()
})

editor.element.addEventListener('selection', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'selection') {
    return
  }

  selection = detail.selected
  renderPanels()
})

editor.element.addEventListener('change', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'change') {
    return
  }

  currentGraph = detail.graph
  renderPanels()
})

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
  button.addEventListener('click', async () => {
    Object.assign(state, createSurfaceState(button.dataset.mode as SurfaceMode))
    currentGraph = getFixtureGraph(state.fixture)
    editor.setPreferences({
      editability: state.editability,
      rendererPreference: state.rendererPreference,
      kernelPreference: state.kernelPreference,
    })
    await editor.setGraph(currentGraph)
    selection = []
    renderPanels()
  })
})

document.querySelectorAll<HTMLButtonElement>('[data-fixture]').forEach((button) => {
  button.addEventListener('click', async () => {
    state.fixture = button.dataset.fixture as FixtureKey
    currentGraph = getFixtureGraph(state.fixture)
    await editor.setGraph(currentGraph)
    selection = []
    renderPanels()
  })
})

document.querySelectorAll<HTMLSelectElement>('[data-control]').forEach((select) => {
  select.addEventListener('change', () => {
    const key = select.dataset.control as keyof RuntimePreferences

    switch (key) {
      case 'editability':
        state.editability = select.value as RuntimePreferences['editability']
        break
      case 'rendererPreference':
        state.rendererPreference =
          select.value as RuntimePreferences['rendererPreference']
        break
      case 'kernelPreference':
        state.kernelPreference =
          select.value as RuntimePreferences['kernelPreference']
        break
    }

    editor.setPreferences({
      editability: state.editability,
      rendererPreference: state.rendererPreference,
      kernelPreference: state.kernelPreference,
    })
    renderPanels()
  })
})

renderPanels()

function renderPanels() {
  const summary = document.querySelector<HTMLElement>('[data-role="surface-summary"]')
  const modeCopy = document.querySelector<HTMLElement>('[data-role="mode-copy"]')
  const labControlsCard = document.querySelector<HTMLElement>('[data-role="lab-controls-card"]')
  const diagnosticsCard = document.querySelector<HTMLElement>('[data-role="diagnostics-card"]')
  const selectionList = document.querySelector<HTMLElement>('[data-role="selection-list"]')

  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mode === state.surfaceMode)
  })

  document.querySelectorAll<HTMLButtonElement>('[data-fixture]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.fixture === state.fixture)
  })

  document.querySelectorAll<HTMLSelectElement>('[data-control]').forEach((select) => {
    const key = select.dataset.control as keyof RuntimePreferences
    select.value = String(state[key])
  })

  summary!.textContent =
    state.surfaceMode === 'product-demo'
      ? 'Start with the built-in editor feel, then step into the lab when you need proof.'
      : 'Use fixtures and diagnostics to judge runtime fit without guessing.'

  modeCopy!.innerHTML =
    state.surfaceMode === 'product-demo'
      ? `
        <div class="panel-label">Product Demo</div>
        <strong>Default experience for first-time OSS users</strong>
        <p>Focus on the usable editor surface first. Diagnostics stay hidden here so the page still feels like a product, not a benchmark console.</p>
      `
      : `
        <div class="panel-label">Performance Lab</div>
        <strong>Evaluation mode for performance-sensitive teams</strong>
        <p>Load heavier fixtures, inspect runtime backend/kernel state, and compare what the engine is really doing before you adopt it.</p>
      `

  labControlsCard!.classList.toggle('is-hidden', state.surfaceMode !== 'performance-lab')
  diagnosticsCard!.classList.toggle('is-hidden', state.diagnosticsVisibility === 'hidden')
  diagnosticsCard!.innerHTML = `
    <div class="panel-label">Diagnostics</div>
    <div class="diag-grid">
      <div><span>Mode</span><strong>${state.surfaceMode}</strong></div>
      <div><span>Fixture</span><strong>${state.fixture}</strong></div>
      <div><span>Renderer</span><strong>${diagnostics.backend}</strong></div>
      <div><span>Kernel</span><strong>${diagnostics.kernelSource}</strong></div>
      <div><span>Fallback</span><strong>${diagnostics.fallbackReason ?? 'none'}</strong></div>
      <div><span>Nodes</span><strong>${diagnostics.nodeCount}</strong></div>
      <div><span>Edges</span><strong>${diagnostics.edgeCount}</strong></div>
      <div><span>Zoom</span><strong>${diagnostics.zoom.toFixed(2)}x</strong></div>
      <div><span>Editability</span><strong>${diagnostics.preferences.editability}</strong></div>
      <div><span>Renderer pref</span><strong>${diagnostics.preferences.rendererPreference}</strong></div>
      <div><span>Kernel pref</span><strong>${diagnostics.preferences.kernelPreference}</strong></div>
    </div>
  `

  selectionList!.innerHTML =
    selection.length === 0
      ? '<div class="selection-empty">No selection. Drag, pan, zoom, and fixture switching all stay live.</div>'
      : selection
          .map(
            (item) => `
              <article class="selection-item">
                <strong>${item.title}</strong>
                <span>${item.type}</span>
                <span>Status: ${item.status}</span>
              </article>
            `,
          )
          .join('')
}
