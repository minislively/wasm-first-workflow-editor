import './style.css'

import { createWorkflowEditor } from '@minislively/workflow-element'
import {
  applyReadyDiagnostics,
  applyStatsDiagnostics,
  createInitialDiagnosticsState,
  getProductDemoBuilderNodes,
  getProductDemoGraph,
  getProductDemoOptionalNodeOptions,
  getProductDemoTemplateOptions,
  getProductDemoTemplateSummary,
  setProductDemoNodePreset,
  setProductDemoNodeStatus,
  setProductDemoOptionalNodeEnabled,
  setProductDemoTemplate,
  type ProductDemoBuilderNodeId,
  type ProductDemoOptionalNodeFamily,
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
let activeNodeId: ProductDemoBuilderNodeId = 'trigger'

app.innerHTML = `
  <main class="page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">builder-first public surface</p>
        <h1>Product Demo now reads like a constrained builder.</h1>
        <p class="lede">
          Start with a real stage, a real side-panel configuration flow, and a
          truthful builder seam. The host owns builder chrome and trusted
          mutations while the engine still owns selection, drag, pan, zoom, and
          rendering.
        </p>
      </div>
      <div class="hero-stack">
        <div class="hero-pill">Primary: Web Component</div>
        <div class="hero-pill">Builder baseline: basic here, 100 in lab</div>
        <div class="hero-pill">Heavy tiers: 500 / 1000 degraded by default</div>
        <div class="hero-pill">Boundary: engine strict / shell flexible</div>
      </div>
    </section>
    <section class="surface-shell">
      <div class="surface-header">
        <div>
          <div class="panel-label">Product Demo</div>
          <strong class="surface-title">Demo-ready builder shell for the starter flow</strong>
        </div>
        <div class="surface-summary">
          Visible builder controls match actual behavior: configure supported
          steps in the panel, add or remove only the approved node families, and
          use stage interaction for selection, drag, pan, and zoom.
        </div>
      </div>
      <div class="baseline-strip">
        <div class="baseline-pill">Basic: editing-capable builder baseline</div>
        <div class="baseline-pill">100: editing-capable lab baseline</div>
        <div class="baseline-pill">500 / 1000: degraded-by-default in Performance Lab</div>
      </div>
      <div class="surface-layout">
        <aside class="builder-sidebar">
          <section class="panel-card">
            <div class="panel-label">Starter Flow</div>
            <strong>Template-first support lives inside the builder shell.</strong>
            <div class="template-control-stack">
              <label>
                <span>Starter template</span>
                <select data-builder-control="template">
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
            <div class="panel-label">Flow Map</div>
            <strong>Open a step in the config panel.</strong>
            <p class="panel-copy">
              Click a stage node or open one from the list below. Shell-driven
              config is the main editing seam for this public builder surface.
            </p>
            <div class="flow-map" data-role="flow-map"></div>
          </section>
          <section class="panel-card">
            <div class="panel-label">Constrained Add / Remove</div>
            <strong>Supported nodes snap into the builder seam.</strong>
            <div class="optional-node-controls" data-role="optional-node-controls"></div>
          </section>
          <section class="panel-card">
            <div class="panel-label">Runtime Snapshot</div>
            <strong data-role="runtime-title">Booting editor runtime...</strong>
            <p class="panel-copy" data-role="runtime-copy">
              Waiting for the custom element to report backend, kernel, and fallback state.
            </p>
          </section>
        </aside>
        <section class="editor-shell">
          <div class="builder-banner">
            <div>
              <div class="panel-label">Builder Surface</div>
              <strong>Stage interaction stays engine-owned.</strong>
            </div>
            <p>
              Drag nodes, pan, zoom, and select on the stage. Shell-owned config
              changes keep the starter flow constrained and trustworthy.
            </p>
          </div>
          <div id="mount"></div>
        </section>
        <aside class="config-sidebar">
          <section class="panel-card config-card">
            <div class="panel-label">Config Panel</div>
            <strong data-role="config-title">Open a builder step</strong>
            <p class="panel-copy" data-role="config-copy">
              The stage and flow map both feed this host-owned configuration panel.
            </p>
            <div class="config-form" data-role="config-form"></div>
          </section>
          <section class="panel-card">
            <div class="panel-label">Stage Selection</div>
            <div class="selection-list" data-role="selection-list"></div>
          </section>
          <section class="panel-card">
            <div class="panel-label">Boundary Reminder</div>
            <div class="contract-list">
              <p>Shell owns templates, config, and constrained node actions.</p>
              <p>Engine owns hit testing, drag loops, pan/zoom, and rendering.</p>
              <p>No React-Flow-like rendering contract is implied anywhere here.</p>
            </div>
          </section>
        </aside>
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
  const selectedNodeId = detail.selected[0]?.id

  if (isBuilderNodeId(selectedNodeId)) {
    activeNodeId = selectedNodeId
  }

  renderPanels()
})

editor.element.addEventListener('change', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'change') {
    return
  }

  currentGraph = detail.graph
  ensureActiveNode()
  renderPanels()
})

app.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    return
  }

  const flowButton = target.closest<HTMLButtonElement>('[data-flow-node]')
  if (flowButton) {
    const nodeId = flowButton.dataset.flowNode

    if (isBuilderNodeId(nodeId)) {
      activeNodeId = nodeId
      renderPanels()
    }

    return
  }

  const toggleButton = target.closest<HTMLButtonElement>('[data-optional-node-family]')
  if (toggleButton) {
    const family = toggleButton.dataset.optionalNodeFamily

    if (isOptionalNodeFamily(family)) {
      void commitGraph(
        setProductDemoOptionalNodeEnabled(
          currentGraph,
          family,
          toggleButton.dataset.enabled !== 'true',
        ),
      )
    }
  }
})

app.addEventListener('change', (event) => {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) {
    return
  }

  if (target.dataset.builderControl === 'template') {
    templateState = target.value as ProductDemoTemplateKey
    void commitGraph(setProductDemoTemplate(currentGraph, templateState))
    return
  }

  if (!isBuilderNodeId(target.dataset.nodeId)) {
    return
  }

  const nodeId = target.dataset.nodeId

  if (target.dataset.configControl === 'preset') {
    void commitGraph(setProductDemoNodePreset(currentGraph, nodeId, target.value))
    return
  }

  if (target.dataset.configControl === 'status') {
    void commitGraph(
      setProductDemoNodeStatus(
        currentGraph,
        nodeId,
        target.value as SelectionSummary['status'],
      ),
    )
  }
})

renderPanels()

function renderPanels() {
  const runtimeTitle = document.querySelector<HTMLElement>('[data-role="runtime-title"]')
  const runtimeCopy = document.querySelector<HTMLElement>('[data-role="runtime-copy"]')
  const templateSummary = document.querySelector<HTMLElement>('[data-role="template-summary"]')
  const flowMap = document.querySelector<HTMLElement>('[data-role="flow-map"]')
  const optionalNodeControls = document.querySelector<HTMLElement>(
    '[data-role="optional-node-controls"]',
  )
  const configTitle = document.querySelector<HTMLElement>('[data-role="config-title"]')
  const configCopy = document.querySelector<HTMLElement>('[data-role="config-copy"]')
  const configForm = document.querySelector<HTMLElement>('[data-role="config-form"]')
  const selectionList = document.querySelector<HTMLElement>('[data-role="selection-list"]')
  const builderNodes = getProductDemoBuilderNodes(currentGraph)
  const activeNode = builderNodes.find((node) => node.id === activeNodeId) ?? builderNodes[0]
  const template = getProductDemoTemplateSummary(currentGraph)
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
    .querySelectorAll<HTMLSelectElement>('[data-builder-control="template"]')
    .forEach((select) => {
      select.value = template.key
    })

  templateSummary!.innerHTML = `
    <strong>${template.label}</strong>
    <p>${template.summary}</p>
    <p>
      This builder shell keeps template-first onboarding visible without
      pretending the whole surface is unrestricted graph authoring.
    </p>
  `

  flowMap!.innerHTML = builderNodes
    .map((node) => {
      const isStageSelected = selection.some((item) => item.id === node.id)

      return `
        <button
          class="flow-card${node.id === activeNode?.id ? ' is-active' : ''}${
            isStageSelected ? ' is-stage-selected' : ''
          }"
          data-flow-node="${node.id}"
          type="button"
        >
          <span class="flow-card-slot">${node.slotLabel}</span>
          <strong>${node.currentTitle}</strong>
          <span>${node.currentSubtitle}</span>
          <span class="flow-card-meta">${node.currentStatus} · ${node.family}</span>
        </button>
      `
    })
    .join('')

  optionalNodeControls!.innerHTML = getProductDemoOptionalNodeOptions(currentGraph)
    .map(
      (option) => `
        <article class="toggle-card">
          <div>
            <strong>${option.label}</strong>
            <p>${option.summary}</p>
          </div>
          <button
            class="toggle-button"
            data-optional-node-family="${option.family}"
            data-enabled="${option.enabled}"
            type="button"
          >
            ${option.enabled ? `Remove ${option.label.toLowerCase()}` : `Add ${option.label.toLowerCase()}`}
          </button>
        </article>
      `,
    )
    .join('')

  runtimeTitle!.textContent = runtimeState.title
  runtimeCopy!.textContent = runtimeState.detail

  if (!activeNode) {
    configTitle!.textContent = 'Open a builder step'
    configCopy!.textContent =
      'Choose a node from the stage or flow map to edit its trusted builder configuration.'
    configForm!.innerHTML = ''
  } else {
    activeNodeId = activeNode.id
    configTitle!.textContent = `${activeNode.currentTitle} · ${activeNode.slotLabel}`
    configCopy!.textContent = activeNode.panelCopy
    configForm!.innerHTML = `
      <label>
        <span>${activeNode.presetLabel}</span>
        <select data-config-control="preset" data-node-id="${activeNode.id}">
          ${activeNode.presetOptions
            .map(
              (preset) =>
                `<option value="${preset.key}"${
                  preset.key === activeNode.currentPresetKey ? ' selected' : ''
                }>${preset.label}</option>`,
            )
            .join('')}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-config-control="status" data-node-id="${activeNode.id}">
          ${(['idle', 'ready', 'running'] as const)
            .map(
              (status) =>
                `<option value="${status}"${
                  status === activeNode.currentStatus ? ' selected' : ''
                }>${status}</option>`,
            )
            .join('')}
        </select>
      </label>
      <div class="config-note">
        <strong>Current step</strong>
        <p>${activeNode.currentSubtitle}</p>
        <p>
          Shell-owned edits update the stage through the public editor contract.
          Add or remove actions re-snap supported nodes into their constrained builder slots.
        </p>
      </div>
    `
  }

  selectionList!.innerHTML =
    selection.length === 0
      ? '<div class="selection-empty">No stage selection yet. Drag, pan, zoom, and click a node to mirror engine-owned selection here.</div>'
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

async function commitGraph(nextGraph: GraphDocument) {
  currentGraph = nextGraph
  selection = selection.filter((item) => nextGraph.nodes.some((node) => node.id === item.id))
  ensureActiveNode()
  renderPanels()
  await editor.setGraph(nextGraph)
}

function ensureActiveNode() {
  const builderNodes = getProductDemoBuilderNodes(currentGraph)

  if (builderNodes.length === 0) {
    return
  }

  if (!builderNodes.some((node) => node.id === activeNodeId)) {
    activeNodeId = builderNodes[0].id
  }
}

function isBuilderNodeId(value: string | undefined): value is ProductDemoBuilderNodeId {
  return (
    value === 'trigger' ||
    value === 'classify' ||
    value === 'research' ||
    value === 'review' ||
    value === 'publish' ||
    value === 'action'
  )
}

function isOptionalNodeFamily(
  value: string | undefined,
): value is ProductDemoOptionalNodeFamily {
  return value === 'review' || value === 'action'
}
