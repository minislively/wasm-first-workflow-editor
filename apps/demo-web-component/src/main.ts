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
import {
  applyReadyDiagnostics,
  applyStatsDiagnostics,
  createInitialDiagnosticsState,
  createSurfaceViewModel,
  markDiagnosticsSyncing,
} from './surface-view'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root was not found.')
}

const state: DemoSurfaceState = createSurfaceState('product-demo')

let diagnostics = createInitialDiagnosticsState({
  editability: 'editable',
  rendererPreference: 'auto',
  kernelPreference: 'auto',
})

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
            <p class="lab-controls-copy">
              Change one variable at a time so fixture size, editability, and forced runtime behavior stay comparable.
            </p>
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
          <section class="panel-card evaluation-card" data-role="evaluation-card"></section>
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

  diagnostics = applyReadyDiagnostics(diagnostics, detail)
  renderPanels()
})

editor.element.addEventListener('stats', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'stats') {
    return
  }

  diagnostics = applyStatsDiagnostics(diagnostics, detail)
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
    diagnostics = markDiagnosticsSyncing(
      diagnostics,
      {
        editability: state.editability,
        rendererPreference: state.rendererPreference,
        kernelPreference: state.kernelPreference,
      },
      currentGraph.nodes.length,
      currentGraph.edges.length,
    )
    renderPanels()
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
    diagnostics = markDiagnosticsSyncing(
      diagnostics,
      {
        editability: state.editability,
        rendererPreference: state.rendererPreference,
        kernelPreference: state.kernelPreference,
      },
      currentGraph.nodes.length,
      currentGraph.edges.length,
    )
    renderPanels()
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

    diagnostics = markDiagnosticsSyncing(
      diagnostics,
      {
        editability: state.editability,
        rendererPreference: state.rendererPreference,
        kernelPreference: state.kernelPreference,
      },
      currentGraph.nodes.length,
      currentGraph.edges.length,
    )
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
  const evaluationCard = document.querySelector<HTMLElement>('[data-role="evaluation-card"]')
  const diagnosticsCard = document.querySelector<HTMLElement>('[data-role="diagnostics-card"]')
  const selectionList = document.querySelector<HTMLElement>('[data-role="selection-list"]')
  const viewModel = createSurfaceViewModel(state, diagnostics)

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

  summary!.textContent = viewModel.summary

  modeCopy!.innerHTML =
    `
      <div class="panel-label">${viewModel.modeLabel}</div>
      <strong>${viewModel.modeTitle}</strong>
      <p>${viewModel.modeDescription}</p>
    `

  labControlsCard!.classList.toggle('is-hidden', !viewModel.showLabControls)
  evaluationCard!.className = `panel-card evaluation-card tone-${viewModel.evaluationTone}`
  evaluationCard!.classList.toggle('is-hidden', !viewModel.showEvaluation)
  evaluationCard!.innerHTML = `
    <div class="panel-label">Evaluation Summary</div>
    <strong>${viewModel.evaluationTitle}</strong>
    <p>${viewModel.evaluationDetail}</p>
    <div class="diag-comparison-list">
      ${viewModel.comparisonRows
        .map(
          (row) => `
            <article class="diag-comparison-item ${row.matches ? 'is-match' : 'is-mismatch'}">
              <span>${row.label}</span>
              <strong>${row.requested} -> ${row.active}</strong>
            </article>
          `,
        )
        .join('')}
    </div>
  `
  diagnosticsCard!.classList.toggle('is-hidden', !viewModel.showDiagnostics)
  diagnosticsCard!.innerHTML = `
    <div class="panel-label">Diagnostics</div>
    <div class="diag-banner ${diagnostics.fallbackReason ? 'is-warning' : 'is-ok'}">
      <strong>${viewModel.diagnosticsBannerTitle}</strong>
      <span>${viewModel.diagnosticsBannerDetail}</span>
    </div>
    <div class="diag-grid">
      ${viewModel.diagnosticsRows
        .map(
          (row) =>
            `<div><span>${row.label}</span><strong>${row.value}</strong></div>`,
        )
        .join('')}
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
