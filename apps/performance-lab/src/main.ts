import './style.css'

import { createWorkflowEditor } from '@minislively/workflow-element'
import {
  applyReadyDiagnostics,
  applyStatsDiagnostics,
  createInitialDiagnosticsState,
  createPerformanceLabState,
  createPerformanceLabSummary,
  describeFixtureTier,
  getFixtureGraph,
  getFixtureInteractionContract,
  markDiagnosticsSyncing,
  resolvePerformanceLabEditability,
  type FixtureKey,
} from '@minislively/workflow-demo-support'
import type {
  EngineEvent,
  GraphDocument,
  RuntimePreferences,
  SelectionSummary,
} from '@minislively/workflow-types'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root was not found.')
}

const state = createPerformanceLabState()

let diagnostics = createInitialDiagnosticsState({
  editability: resolvePerformanceLabEditability(
    state.fixture,
    state.editability,
    state.allowExperimentalEditing,
  ),
  rendererPreference: state.rendererPreference,
  kernelPreference: state.kernelPreference,
})

let selection: SelectionSummary[] = []
let currentGraph: GraphDocument = getFixtureGraph(state.fixture)

app.innerHTML = `
  <main class="page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">runtime evaluation example</p>
        <h1>Performance Example is a dedicated runtime check surface.</h1>
        <p class="lede">
          Load public fixtures, force runtime preferences, and inspect the active
          backend and kernel without carrying that diagnostic weight in the
          main reference app.
        </p>
      </div>
      <div class="hero-stack">
        <div class="hero-pill">Primary: Web Component</div>
        <div class="hero-pill">Public fixtures: basic / 100 / 500 / 1000</div>
        <div class="hero-pill">Diagnostics stay explicit</div>
      </div>
    </section>
    <section class="surface-shell">
      <div class="surface-header">
        <div>
          <div class="panel-label">Performance Example</div>
          <strong class="surface-title">Evaluation mode for performance-sensitive teams</strong>
        </div>
        <div class="surface-summary">
          Compare requested and active runtime behavior after each fixture or
          preference change. Fallback visibility is part of the contract here.
        </div>
      </div>
      <div class="surface-layout">
        <aside class="control-panel">
          <section class="panel-card">
            <div class="panel-label">Fixture</div>
            <p class="fixture-copy">
              <code>100</code> remains the default Guaranteed baseline. <code>500</code> and <code>1000</code> stay in the Supported read-only default until you explicitly opt into Experimental heavy editing.
            </p>
            <div class="fixture-grid">
              <button data-fixture="basic" class="fixture-chip" type="button">Basic</button>
              <button data-fixture="100" class="fixture-chip is-active" type="button">100</button>
              <button data-fixture="500" class="fixture-chip" type="button">500</button>
              <button data-fixture="1000" class="fixture-chip" type="button">1000</button>
            </div>
          </section>
          <section class="panel-card">
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
          <section class="panel-card policy-card" data-role="policy-card"></section>
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
    accent: '#0ea5e9',
    nodeSelected: '#0ea5e9',
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

document.querySelectorAll<HTMLButtonElement>('[data-fixture]').forEach((button) => {
  button.addEventListener('click', async () => {
    state.fixture = button.dataset.fixture as FixtureKey
    state.allowExperimentalEditing = false
    currentGraph = getFixtureGraph(state.fixture)
    diagnostics = markDiagnosticsSyncing(
      diagnostics,
      getRuntimePreferences(),
      currentGraph.nodes.length,
      currentGraph.edges.length,
    )
    renderPanels()
    editor.setPreferences(getRuntimePreferences())
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
      getRuntimePreferences(),
      currentGraph.nodes.length,
      currentGraph.edges.length,
    )
    editor.setPreferences(getRuntimePreferences())
    renderPanels()
  })
})

document.addEventListener('change', (event) => {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || target.dataset.control !== 'allowHeavyEditing') {
    return
  }

  state.allowExperimentalEditing = target.checked
  diagnostics = markDiagnosticsSyncing(
    diagnostics,
    getRuntimePreferences(),
    currentGraph.nodes.length,
    currentGraph.edges.length,
  )
  editor.setPreferences(getRuntimePreferences())
  renderPanels()
})

renderPanels()

function renderPanels() {
  const policyCard = document.querySelector<HTMLElement>('[data-role="policy-card"]')
  const evaluationCard = document.querySelector<HTMLElement>('[data-role="evaluation-card"]')
  const diagnosticsCard = document.querySelector<HTMLElement>('[data-role="diagnostics-card"]')
  const selectionList = document.querySelector<HTMLElement>('[data-role="selection-list"]')
  const summary = createPerformanceLabSummary(state, diagnostics)
  const fixtureContract = getFixtureInteractionContract(state.fixture)
  const supportedDefaultLocked = summary.hasSupportedDefault && !state.allowExperimentalEditing
  const comparisonRows = [
    {
      label: 'Editability intent',
      requested: state.editability,
      active: summary.effectiveEditability,
      matches: state.editability === summary.effectiveEditability,
    },
    {
      label: 'Runtime editability',
      requested: summary.effectiveEditability,
      active: diagnostics.preferences.editability,
      matches: summary.effectiveEditability === diagnostics.preferences.editability,
    },
    {
      label: 'Renderer pref',
      requested: state.rendererPreference,
      active: diagnostics.preferences.rendererPreference,
      matches:
        state.rendererPreference === diagnostics.preferences.rendererPreference,
    },
    {
      label: 'Kernel pref',
      requested: state.kernelPreference,
      active: diagnostics.preferences.kernelPreference,
      matches: state.kernelPreference === diagnostics.preferences.kernelPreference,
    },
  ]
  const evaluation =
    diagnostics.syncStatus !== 'ready'
      ? {
          tone: 'info',
          title: 'Runtime update in progress',
          detail:
            'The lab is applying the latest fixture or preference change. Compare requested and active rows after the next diagnostics event lands.',
        }
      : supportedDefaultLocked
        ? {
            tone: 'warning',
            title: summary.capabilityTitle,
            detail: summary.capabilityDetail,
          }
        : summary.hasSupportedDefault
          ? {
              tone: 'warning',
              title: summary.capabilityTitle,
              detail: summary.capabilityDetail,
            }
        : diagnostics.fallbackReason
          ? {
              tone: 'warning',
              title: 'Fallback is active',
              detail: diagnostics.fallbackReason,
            }
          : {
              tone: 'success',
              title: 'Requested runtime is active',
              detail:
                'No fallback is currently reported. Use fixture size, zoom, and requested-vs-active rows below to judge fit.',
            }

  document.querySelectorAll<HTMLButtonElement>('[data-fixture]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.fixture === state.fixture)
  })

  document.querySelectorAll<HTMLSelectElement>('[data-control]').forEach((select) => {
    const key = select.dataset.control as keyof RuntimePreferences
    select.value = String(state[key])
    if (key === 'editability') {
      select.disabled = supportedDefaultLocked
    }
  })

  policyCard!.className = `panel-card policy-card ${supportedDefaultLocked ? 'tone-warning' : 'tone-info'}`
  policyCard!.innerHTML = fixtureContract.tier === 'supported'
    ? `
      <div class="panel-label">Tier Policy</div>
      <strong>${fixtureContract.label}</strong>
      <p>
        ${fixtureContract.detail}
      </p>
      <label class="toggle-row">
        <input
          data-control="allowHeavyEditing"
          type="checkbox"
          ${state.allowExperimentalEditing ? 'checked' : ''}
        />
        <span>Enable experimental editing for ${state.fixture}</span>
      </label>
      <p class="policy-note">Requested editability: ${state.editability}. Effective editability: ${summary.effectiveEditability}.</p>
    `
    : `
      <div class="panel-label">Tier Policy</div>
      <strong>${fixtureContract.label}</strong>
      <p>
        ${describeFixtureTier(state.fixture)}
      </p>
    `

  evaluationCard!.className = `panel-card evaluation-card tone-${evaluation.tone}`
  evaluationCard!.innerHTML = `
    <div class="panel-label">Evaluation Summary</div>
    <strong>${evaluation.title}</strong>
    <p>${evaluation.detail}</p>
    <div class="diag-comparison-list">
      ${comparisonRows
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

  diagnosticsCard!.innerHTML = `
    <div class="panel-label">Diagnostics</div>
    <div class="diag-banner ${diagnostics.fallbackReason ? 'is-warning' : 'is-ok'}">
      <strong>${diagnostics.fallbackReason ? 'Fallback visible' : 'No fallback reported'}</strong>
      <span>${summary.fallbackLabel}</span>
    </div>
    <div class="diag-grid">
      ${[
        ['Fixture', state.fixture],
        ['Renderer', diagnostics.backend],
        ['Kernel', diagnostics.kernelSource],
        ['Fallback', diagnostics.fallbackReason ?? 'none'],
        ['Nodes', String(diagnostics.nodeCount)],
        ['Edges', String(diagnostics.edgeCount)],
        ['Zoom', `${diagnostics.zoom.toFixed(2)}x`],
        ['Sync', diagnostics.syncStatus],
        ['Last event', diagnostics.lastEvent ?? 'none'],
        ['Requested editability', state.editability],
        ['Effective editability', summary.effectiveEditability],
        ['Active editability', diagnostics.preferences.editability],
        ['Tier policy', supportedDefaultLocked ? 'supported default' : summary.hasSupportedDefault ? 'experimental override' : 'guaranteed'],
        ['Fixture contract', summary.fixtureContractLabel],
        ['Requested renderer', state.rendererPreference],
        ['Active renderer pref', diagnostics.preferences.rendererPreference],
        ['Requested kernel', state.kernelPreference],
        ['Active kernel pref', diagnostics.preferences.kernelPreference],
        ['Fixture read', summary.fixtureLabel],
        ['Renderer check', summary.renderer.status],
        ['Kernel check', summary.kernel.status],
      ]
        .map(
          ([label, value]) =>
            `<div><span>${label}</span><strong>${value}</strong></div>`,
        )
        .join('')}
    </div>
  `

  selectionList!.innerHTML =
    selection.length === 0
      ? `<div class="selection-empty">${
          supportedDefaultLocked
            ? `No selection. ${state.fixture} is currently navigation-only, so pan, zoom, and fixture switching stay live while editing remains gated.`
            : 'No selection. Drag, pan, zoom, and fixture switching all stay live.'
        }</div>`
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

function getRuntimePreferences(): RuntimePreferences {
  return {
    editability: resolvePerformanceLabEditability(
      state.fixture,
      state.editability,
      state.allowExperimentalEditing,
    ),
    rendererPreference: state.rendererPreference,
    kernelPreference: state.kernelPreference,
  }
}
