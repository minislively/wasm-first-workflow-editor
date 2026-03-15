import './style.css'

import { createWorkflowEditor } from '@minislively/workflow-element'
import {
  applyReadyDiagnostics,
  applyStatsDiagnostics,
  createInitialDiagnosticsState,
  getProductDemoGraph,
  getProductDemoTemplateOptions,
  type ProductDemoTemplateKey,
} from '@minislively/workflow-demo-support'
import type { EngineEvent, GraphDocument, SelectionSummary } from '@minislively/workflow-types'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root was not found.')
}

let diagnostics = createInitialDiagnosticsState({
  editability: 'editable',
  rendererPreference: 'auto',
  kernelPreference: 'auto',
})

let selection: SelectionSummary[] = []
const productDemoTemplates = getProductDemoTemplateOptions()
let templateState: ProductDemoTemplateKey = productDemoTemplates[0]?.key ?? 'support-triage'
let currentGraph: GraphDocument = getProductDemoGraph(templateState)

app.innerHTML = `
  <main class="page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">phase 1 public surface</p>
        <h1>Product Demo keeps the first run focused.</h1>
        <p class="lede">
          This page is the lightweight, product-oriented Web Component surface. It keeps the editor feel front and center while the dedicated Performance Lab handles heavier diagnostics and runtime evaluation elsewhere.
        </p>
      </div>
      <div class="hero-stack">
        <div class="hero-pill">Primary: Web Component</div>
        <div class="hero-pill">Secondary: React wrapper</div>
        <div class="hero-pill">Boundary: engine strict / shell flexible</div>
        <div class="hero-pill">Fixture: basic onboarding graph</div>
      </div>
    </section>
    <section class="surface-shell">
      <div class="surface-header">
        <div>
          <div class="panel-label">Product Demo</div>
          <strong class="surface-title">Default experience for first-time OSS users</strong>
        </div>
        <div class="surface-summary">
          Start with the built-in editor feel here. This surface only exposes the controls we trust in public right now: select, drag, pan, zoom, and swap between guided example flows.
        </div>
      </div>
      <div class="surface-layout">
        <aside class="control-panel">
          <section class="panel-card">
            <div class="panel-label">Why This Surface Exists</div>
            <strong>Usable before you benchmark.</strong>
            <p>
              Keep the first impression small, editable, and product-shaped. The
              graph hot path stays inside the same custom element contract that
              production hosts will embed.
            </p>
          </section>
          <section class="panel-card">
            <div class="panel-label">Trusted Controls</div>
            <strong>Visible controls match the current product promise.</strong>
            <div class="template-summary">
              <p>Select, drag, pan, and zoom the example graph.</p>
              <p>Swap between guided example flows without broad freeform editing.</p>
              <p>Use the runtime snapshot for backend, kernel, and fallback truth.</p>
            </div>
          </section>
          <section class="panel-card">
            <div class="panel-label">Template-First Example</div>
            <strong>Swap guided API steps without promising broad authoring.</strong>
            <p>
              This shell-owned panel swaps known node variants in the starter
              flow so users can test API-flavored examples without relying on
              unrestricted graph editing.
            </p>
            <div class="template-control-stack">
              <label>
                <span>Guided example flow</span>
                <select data-template-control="template">
                  ${productDemoTemplates
                    .map(
                      (template) =>
                        `<option value="${template.key}">${template.label}</option>`,
                    )
                    .join('')}
                </select>
              </label>
            </div>
            <div class="template-summary" data-role="template-summary"></div>
          </section>
          <section class="panel-card">
            <div class="panel-label">Runtime Snapshot</div>
            <strong data-role="runtime-title">Booting editor runtime...</strong>
            <p data-role="runtime-copy">
              Waiting for the custom element to report backend, kernel, and fallback state.
            </p>
          </section>
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
      editability: 'editable',
      rendererPreference: 'auto',
      kernelPreference: 'auto',
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

document
  .querySelectorAll<HTMLSelectElement>('[data-template-control]')
  .forEach((select) => {
    select.addEventListener('change', async () => {
      templateState = select.value as ProductDemoTemplateKey
      currentGraph = getProductDemoGraph(templateState)
      renderPanels()
      await editor.setGraph(currentGraph)
      selection = []
      renderPanels()
    })
  })

renderPanels()

function renderPanels() {
  const runtimeTitle = document.querySelector<HTMLElement>('[data-role="runtime-title"]')
  const runtimeCopy = document.querySelector<HTMLElement>('[data-role="runtime-copy"]')
  const selectionList = document.querySelector<HTMLElement>('[data-role="selection-list"]')
  const templateSummary = document.querySelector<HTMLElement>('[data-role="template-summary"]')
  const runtimeState =
    diagnostics.lastEvent === null
      ? {
          title: 'Booting editor runtime...',
          detail:
            'Waiting for the custom element to report backend, kernel, and fallback state.',
        }
      : {
          title: diagnostics.fallbackReason
            ? `Fallback active on ${diagnostics.backend}`
            : `${diagnostics.backend} runtime is active`,
          detail: [
            `Kernel ${diagnostics.kernelSource}.`,
            diagnostics.fallbackReason ?? 'No fallback reported.',
          ].join(' '),
        }

  document
    .querySelectorAll<HTMLSelectElement>('[data-template-control]')
    .forEach((select) => {
      select.value = templateState
    })

  runtimeTitle!.textContent = runtimeState.title
  runtimeCopy!.textContent = runtimeState.detail
  const activeTemplate =
    productDemoTemplates.find((template) => template.key === templateState) ??
    productDemoTemplates[0]
  templateSummary!.innerHTML = `
    <strong>${activeTemplate.label}</strong>
    <p>
      ${activeTemplate.summary}
    </p>
    <p>
      Host-managed template swap active. The shell chooses guided flow variants
      while the engine still owns drag, pan, zoom, selection, and rendering.
    </p>
    <p>
      Broad add, delete, and reconnect editing stays out of this public demo until it is equally trustworthy.
    </p>
  `

  selectionList!.innerHTML =
    selection.length === 0
      ? '<div class="selection-empty">No selection. Drag, pan, zoom, and template switching stay live on this guided product surface.</div>'
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
