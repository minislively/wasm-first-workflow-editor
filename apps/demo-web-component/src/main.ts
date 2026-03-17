import './style.css'

import { createWorkflowEditor } from '@minislively/workflow-element'
import {
  addProductDemoOptionalNode,
  applyReadyDiagnostics,
  applyStatsDiagnostics,
  createInitialDiagnosticsState,
  getProductDemoBuilderNodes,
  getProductDemoGraph,
  getProductDemoOptionalNodeOptions,
  getProductDemoTemplateOptions,
  getProductDemoTemplateSummary,
  removeProductDemoOptionalNode,
  setProductDemoNodePreset,
  setProductDemoNodeStatus,
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
    <section class="mission-strip">
      <p class="eyebrow">Product Demo</p>
      <h1>Production Agent Builder</h1>
      <p class="mission-copy">
        A representative builder shell your team can drop into a product and evaluate immediately.
      </p>
    </section>
    <section class="surface-shell">
      <div class="surface-layout">
        <section class="canvas-column">
          <section class="editor-shell">
            <div class="builder-banner">
              <div class="builder-banner-copy">
                <div class="panel-label">Live Canvas</div>
                <strong>See the stage, inspect each step, and tune the starter flow in place.</strong>
              </div>
              <div class="builder-banner-meta">
                <p>The product-facing builder surface stays interactive without turning into a lab console.</p>
              </div>
              <div class="builder-banner-controls">
                <label class="template-picker">
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
                <div class="optional-node-controls" data-role="optional-node-controls"></div>
              </div>
            </div>
            <div id="mount"></div>
          </section>
          <section class="control-strip">
            <div class="template-summary" data-role="template-summary"></div>
          </section>
        </section>
        <aside class="config-sidebar">
          <section class="panel-card config-card">
            <div class="panel-label">Node Inspector</div>
            <strong data-role="config-title">Select a builder step</strong>
            <p class="panel-copy" data-role="config-copy">
              Adjust the selected step from the host-owned side panel.
            </p>
            <div class="config-form" data-role="config-form"></div>
            <div class="runtime-card">
              <div class="panel-label">Runtime Context</div>
              <strong data-role="runtime-title">Booting editor runtime...</strong>
              <p class="panel-copy" data-role="runtime-copy">
                Waiting for the custom element to report backend, kernel, and fallback state.
              </p>
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
  shellMode: 'stage-only',
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
    const action = toggleButton.dataset.optionalNodeAction

    if (!isOptionalNodeFamily(family)) {
      return
    }

    if (action === 'add') {
      void commitGraph(addProductDemoOptionalNode(currentGraph, family))
      return
    }

    if (action === 'remove') {
      void commitGraph(removeProductDemoOptionalNode(currentGraph, family))
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
  const optionalNodeControls = document.querySelector<HTMLElement>(
    '[data-role="optional-node-controls"]',
  )
  const configTitle = document.querySelector<HTMLElement>('[data-role="config-title"]')
  const configCopy = document.querySelector<HTMLElement>('[data-role="config-copy"]')
  const configForm = document.querySelector<HTMLElement>('[data-role="config-form"]')
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
          detail: diagnostics.fallbackReason
            ? `${diagnostics.backend} / ${diagnostics.kernelSource} · ${diagnostics.fallbackReason}`
            : `${diagnostics.backend} / ${diagnostics.kernelSource}`,
        }

  document
    .querySelectorAll<HTMLSelectElement>('[data-builder-control="template"]')
    .forEach((select) => {
      select.value = template.key
    })

  templateSummary!.innerHTML = `
    <strong>${template.label}</strong>
    <p>${template.summary}</p>
  `

  optionalNodeControls!.innerHTML = getProductDemoOptionalNodeOptions(currentGraph)
    .map(
      (option) => `
        <article class="toggle-card is-compact">
          <div class="toggle-header">
            <strong>${option.label}</strong>
            <span class="toggle-meta">${option.activeCount}/${option.maxCount}</span>
          </div>
          <div class="toggle-actions">
            ${
              option.canAdd
                ? `
                  <button
                    class="toggle-button"
                    data-optional-node-family="${option.family}"
                    data-optional-node-action="add"
                    type="button"
                  >
                    Add ${option.label.toLowerCase()}
                  </button>
                `
                : ''
            }
            ${
              option.canRemove
                ? `
                  <button
                    class="toggle-button is-secondary"
                    data-optional-node-family="${option.family}"
                    data-optional-node-action="remove"
                    type="button"
                  >
                    Remove ${option.label.toLowerCase()}
                  </button>
                `
                : ''
            }
          </div>
        </article>
      `,
    )
    .join('')

  runtimeTitle!.textContent = runtimeState.title
  runtimeCopy!.textContent = runtimeState.detail

  if (!activeNode) {
    configTitle!.textContent = 'Select a builder step'
    configCopy!.textContent = 'Choose a step on the stage to review and adjust it here.'
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
      </div>
    `
  }
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
    value === 'action' ||
    value === 'action-2' ||
    value === 'action-3'
  )
}

function isOptionalNodeFamily(
  value: string | undefined,
): value is ProductDemoOptionalNodeFamily {
  return value === 'review' || value === 'action'
}
