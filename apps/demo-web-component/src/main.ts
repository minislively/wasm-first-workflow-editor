import './style.css'

import { createWorkflowEditor } from '@minislively/workflow-element'
import {
  addProductDemoOptionalNode,
  getProductDemoBuilderNodes,
  getProductDemoGraph,
  getProductDemoOptionalNodeOptions,
  getProductDemoTemplateOptions,
  getProductDemoTemplateSummary,
  removeProductDemoOptionalNode,
  setProductDemoTemplate,
  type ProductDemoBuilderNodeId,
  type ProductDemoOptionalNodeFamily,
  type ProductDemoTemplateKey,
} from '@minislively/workflow-demo-support'
import type { EngineEvent, GraphDocument, SelectionSummary } from '@minislively/workflow-types'

const appRoot = document.querySelector<HTMLDivElement>('#app')

if (!appRoot) {
  throw new Error('App root was not found.')
}

const root = appRoot

type EditorController = Awaited<ReturnType<typeof createWorkflowEditor>>

type RuntimeProof = {
  backend: string
  kernel: string
  fallback: string
  stats: string
}

type QuickActionKey = 'focus-trigger' | 'focus-context' | 'focus-publish' | 'toggle-review' | 'toggle-follow-up'

const templateOptions = getProductDemoTemplateOptions()
let templateState: ProductDemoTemplateKey = templateOptions[0]?.key ?? 'support-triage'
let currentGraph: GraphDocument = getProductDemoGraph(templateState)
let activeNodeId: ProductDemoBuilderNodeId = 'trigger'
let selection: SelectionSummary[] = []
let editorController: EditorController | null = null
let runtimeProof: RuntimeProof = {
  backend: 'Detecting renderer',
  kernel: 'Waiting for engine ready',
  fallback: 'Fallback visible enabled',
  stats: 'Syncing graph runtime',
}

root.innerHTML = `
  <main class="product-shell">
    <header class="product-chrome">
      <div class="chrome-left">
        <a class="chrome-back" href="/docs/adoption/web-component.md" aria-label="Open embed guide">←</a>
        <div class="title-block">
          <p class="eyebrow">Constrained production builder</p>
          <div class="title-row">
            <h1>Trusted flow builder for embedded agent products</h1>
            <span class="badge">Experiment</span>
          </div>
          <p class="lede">
            This is a template-backed builder: choose a proven flow, adjust trusted steps, add supported branches, and verify the outcome before shipping it into your product shell.
          </p>
        </div>
      </div>
      <div class="chrome-actions">
        <span class="truth-chip">Template-backed editing</span>
        <span class="truth-chip">Runtime-safe canvas</span>
        <a class="ghost-chip" href="/docs/adoption/web-component.md">Embed guide</a>
        <a class="ghost-chip" href="http://127.0.0.1:44175/">Runtime Lab</a>
      </div>
    </header>

    <section class="workspace-shell">
      <section class="builder-stage" aria-label="Builder surface">
        <div class="builder-topbar">
          <div>
            <p class="eyebrow">Choose a trusted starting flow</p>
            <div class="template-strip" data-role="template-strip"></div>
          </div>
          <div class="runtime-strip">
            <span class="runtime-pill" data-role="runtime-backend"></span>
            <span class="runtime-pill" data-role="runtime-kernel"></span>
            <span class="runtime-pill" data-role="runtime-fallback"></span>
          </div>
        </div>

        <div class="stage-frame">
          <aside class="floating-rail">
            <div class="rail-section">
              <p class="rail-label">Editable flow steps</p>
              <div class="flow-list" data-role="flow-list"></div>
            </div>
            <div class="rail-section">
              <p class="rail-label">Allowed branches</p>
              <div class="option-list" data-role="optional-list"></div>
            </div>
          </aside>

          <section class="canvas-surface">
            <div class="canvas-head">
              <div>
                <p class="eyebrow">Trusted graph stage</p>
                <h2 data-role="canvas-title"></h2>
                <p class="canvas-copy">Use the rail and supported quick actions to steer this flow without breaking the runtime-safe stage contract.</p>
              </div>
              <div class="canvas-actions">
                <button class="utility-button" data-open-link="runtime-lab" type="button">Diagnostics</button>
                <button class="utility-button" data-open-link="embed-guide" type="button">Docs</button>
              </div>
            </div>
            <div class="mount-shell" id="mount"></div>
            <div class="quick-actions" aria-label="Supported quick actions">
              <div class="command-copy">
                <span class="eyebrow">Supported quick actions</span>
                <strong>These are real constrained edits, not free-form builder prompts.</strong>
              </div>
              <div class="quick-action-list">
                <button class="quick-action-button" data-quick-action="focus-trigger" type="button">Focus trigger</button>
                <button class="quick-action-button" data-quick-action="focus-context" type="button">Focus context step</button>
                <button class="quick-action-button" data-quick-action="focus-publish" type="button">Focus publish step</button>
                <button class="quick-action-button" data-quick-action="toggle-review" type="button">Toggle review gate</button>
                <button class="quick-action-button" data-quick-action="toggle-follow-up" type="button">Toggle follow-up branch</button>
              </div>
            </div>
          </section>
        </div>
      </section>

      <aside class="preview-pane" aria-label="App preview">
        <div class="preview-tabs">
          <span class="preview-tab is-active">Result</span>
          <span class="preview-tab">Focused step</span>
          <span class="preview-tab">Apply</span>
        </div>
        <div class="preview-card">
          <div class="preview-hero">
            <p class="preview-kicker" data-role="preview-kicker"></p>
            <h2 data-role="preview-title"></h2>
            <p data-role="preview-summary"></p>
          </div>
          <div class="preview-art">
            <div class="preview-orb orb-a"></div>
            <div class="preview-orb orb-b"></div>
            <div class="preview-frame">
              <span class="meta-label">Current step outcome</span>
              <strong data-role="preview-node-title"></strong>
              <span data-role="preview-node-subtitle"></span>
            </div>
          </div>
          <div class="preview-meta">
            <div>
              <span class="meta-label">Target team</span>
              <strong data-role="preview-team"></strong>
            </div>
            <div>
              <span class="meta-label">Deploy target</span>
              <strong data-role="preview-target"></strong>
            </div>
          </div>
          <section class="selection-card" data-role="selection-card"></section>
          <section class="selection-card muted-card" data-role="builder-truth-card"></section>
          <div class="cta-stack">
            <a class="primary-chip" href="/docs/adoption/web-component.md">Open builder embed guide</a>
            <a class="ghost-chip strong" href="http://127.0.0.1:44175/">Open Runtime Lab</a>
          </div>
        </div>
      </aside>
    </section>
  </main>
`

const templateStrip = query<HTMLElement>('[data-role="template-strip"]')
const flowList = query<HTMLElement>('[data-role="flow-list"]')
const optionalList = query<HTMLElement>('[data-role="optional-list"]')
const runtimeBackend = query<HTMLElement>('[data-role="runtime-backend"]')
const runtimeKernel = query<HTMLElement>('[data-role="runtime-kernel"]')
const runtimeFallback = query<HTMLElement>('[data-role="runtime-fallback"]')
const canvasTitle = query<HTMLElement>('[data-role="canvas-title"]')
const previewKicker = query<HTMLElement>('[data-role="preview-kicker"]')
const previewTitle = query<HTMLElement>('[data-role="preview-title"]')
const previewSummary = query<HTMLElement>('[data-role="preview-summary"]')
const previewNodeTitle = query<HTMLElement>('[data-role="preview-node-title"]')
const previewNodeSubtitle = query<HTMLElement>('[data-role="preview-node-subtitle"]')
const previewTeam = query<HTMLElement>('[data-role="preview-team"]')
const previewTarget = query<HTMLElement>('[data-role="preview-target"]')
const selectionCard = query<HTMLElement>('[data-role="selection-card"]')
const builderTruthCard = query<HTMLElement>('[data-role="builder-truth-card"]')
const mount = query<HTMLElement>('#mount')

root.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    return
  }

  const templateButton = target.closest<HTMLButtonElement>('[data-template-key]')
  if (templateButton) {
    const nextTemplate = templateButton.dataset.templateKey as ProductDemoTemplateKey
    if (nextTemplate && nextTemplate !== templateState) {
      templateState = nextTemplate
      currentGraph = setProductDemoTemplate(currentGraph, nextTemplate)
      activeNodeId = 'trigger'
      selection = []
      void syncGraph()
    }
    return
  }

  const stepButton = target.closest<HTMLButtonElement>('[data-node-id]')
  if (stepButton) {
    const nodeId = stepButton.dataset.nodeId as ProductDemoBuilderNodeId
    if (nodeId) {
      activeNodeId = nodeId
      renderShell()
    }
    return
  }

  const optionalButton = target.closest<HTMLButtonElement>('[data-optional-family]')
  if (optionalButton) {
    const family = optionalButton.dataset.optionalFamily as ProductDemoOptionalNodeFamily
    const action = optionalButton.dataset.optionalAction
    currentGraph =
      action === 'remove'
        ? removeProductDemoOptionalNode(currentGraph, family)
        : addProductDemoOptionalNode(currentGraph, family)
    selection = []
    void syncGraph()
    return
  }

  const quickActionButton = target.closest<HTMLButtonElement>('[data-quick-action]')
  if (quickActionButton) {
    void runQuickAction(quickActionButton.dataset.quickAction as QuickActionKey)
    return
  }

  const openLinkButton = target.closest<HTMLButtonElement>('[data-open-link]')
  if (openLinkButton?.dataset.openLink === 'runtime-lab') {
    window.location.href = 'http://127.0.0.1:44175/'
    return
  }

  if (openLinkButton?.dataset.openLink === 'embed-guide') {
    window.location.href = '/docs/adoption/web-component.md'
  }
})

const editor = await createWorkflowEditor({
  mount,
  graph: currentGraph,
  shellMode: 'stage-only',
  theme: {
    accent: '#8b5cf6',
    nodeSelected: '#8b5cf6',
  },
  preferences: {
    editability: 'editable',
    rendererPreference: 'auto',
    kernelPreference: 'auto',
  },
})

editorController = editor

editor.element.addEventListener('ready', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'ready') {
    return
  }

  runtimeProof.backend = detail.backend
  runtimeProof.kernel = detail.kernelSource
  runtimeProof.fallback = detail.fallbackReason ?? 'Fallback visible enabled'
  renderRuntime()
})

editor.element.addEventListener('stats', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'stats') {
    return
  }

  runtimeProof.stats = `${detail.nodeCount}n · ${detail.edgeCount}e · ${detail.zoom.toFixed(2)}x`
  renderRuntime()
  renderCanvasTitle()
})

editor.element.addEventListener('selection', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'selection') {
    return
  }

  selection = detail.selected
  renderPreview()
})

editor.element.addEventListener('change', (event) => {
  const detail = (event as CustomEvent<EngineEvent>).detail
  if (detail.type !== 'change') {
    return
  }

  currentGraph = detail.graph
  renderShell()
})

renderShell()
renderRuntime()

function renderShell() {
  const template = getProductDemoTemplateSummary(currentGraph)
  const nodes = getProductDemoBuilderNodes(currentGraph)
  const activeNode = nodes.find((node) => node.id === activeNodeId) ?? nodes[0]
  const optionalOptions = getProductDemoOptionalNodeOptions(currentGraph)

  templateStrip.innerHTML = templateOptions
    .map(
      (option) => `
        <button
          class="template-pill${option.key === template.key ? ' is-active' : ''}"
          data-template-key="${option.key}"
          type="button"
        >
          <strong>${option.label}</strong>
          <span>${option.summary}</span>
        </button>
      `,
    )
    .join('')

  flowList.innerHTML = nodes
    .map(
      (node, index) => `
        <button
          class="flow-step${node.id === activeNode.id ? ' is-active' : ''}"
          data-node-id="${node.id}"
          type="button"
        >
          <span class="step-order">${index + 1}</span>
          <div>
            <strong>${node.label}</strong>
            <span>${node.currentTitle}</span>
          </div>
        </button>
      `,
    )
    .join('')

  optionalList.innerHTML = optionalOptions
    .map(
      (option) => `
        <div class="option-card">
          <div>
            <strong>${option.label}</strong>
            <span>${option.summary}</span>
          </div>
          <button
            class="utility-button"
            data-optional-family="${option.family}"
            data-optional-action="${option.enabled ? 'remove' : 'add'}"
            type="button"
          >
            ${option.enabled ? 'Remove' : 'Add'}
          </button>
        </div>
      `,
    )
    .join('')

  previewKicker.textContent = `${template.label} · constrained builder flow`
  previewTitle.textContent = 'Trusted result surface for this flow'
  previewSummary.textContent = `This preview shows the product outcome of the currently supported flow. You can switch templates, focus steps, and add supported branches without leaving the runtime-safe builder contract.`
  previewNodeTitle.textContent = activeNode.currentTitle
  previewNodeSubtitle.textContent = activeNode.currentSubtitle
  previewTeam.textContent = template.targetTeam
  previewTarget.textContent = template.deployTargets[0] ?? 'Embeddable product shell'

  builderTruthCard.innerHTML = `
    <span class="meta-label">Builder truth</span>
    <strong>Allowed edits: switch template, focus trusted steps, add review, add follow-up.</strong>
    <p>This demo is intentionally constrained. It favors production trust over unrestricted node authoring.</p>
  `

  renderCanvasTitle()
  renderPreview()
}

function renderCanvasTitle() {
  const template = getProductDemoTemplateSummary(currentGraph)
  canvasTitle.textContent = `${template.label} flow · ${runtimeProof.stats}`
}

function renderPreview() {
  const activeNode = getProductDemoBuilderNodes(currentGraph).find((node) => node.id === activeNodeId)

  if (selection.length > 0) {
    selectionCard.innerHTML = selection
      .map(
        (item) => `
          <div>
            <span class="meta-label">Canvas selection</span>
            <strong>${item.title}</strong>
            <p>${item.type} · ${item.status}</p>
          </div>
        `,
      )
      .join('')
    return
  }

  selectionCard.innerHTML = `
    <span class="meta-label">Focused step</span>
    <strong>${activeNode?.panelTitle ?? 'Workflow step'}</strong>
    <p>${activeNode?.panelCopy ?? 'Select a trusted step from the rail or the stage to inspect its product meaning here.'}</p>
  `
}

function renderRuntime() {
  runtimeBackend.textContent = `Renderer · ${runtimeProof.backend}`
  runtimeKernel.textContent = `Kernel · ${runtimeProof.kernel}`
  runtimeFallback.textContent = `Fallback · ${runtimeProof.fallback}`
}

async function runQuickAction(action: QuickActionKey) {
  switch (action) {
    case 'focus-trigger':
      activeNodeId = 'trigger'
      renderShell()
      return
    case 'focus-context':
      activeNodeId = 'research'
      renderShell()
      return
    case 'focus-publish':
      activeNodeId = 'publish'
      renderShell()
      return
    case 'toggle-review':
      currentGraph = toggleOptionalFamily('review')
      break
    case 'toggle-follow-up':
      currentGraph = toggleOptionalFamily('action')
      break
  }

  selection = []
  await syncGraph()
}

function toggleOptionalFamily(family: ProductDemoOptionalNodeFamily): GraphDocument {
  const option = getProductDemoOptionalNodeOptions(currentGraph).find((item) => item.family === family)
  if (!option) {
    return currentGraph
  }

  return option.enabled
    ? removeProductDemoOptionalNode(currentGraph, family)
    : addProductDemoOptionalNode(currentGraph, family)
}

async function syncGraph() {
  renderShell()
  await editorController?.setGraph(currentGraph)
}

function query<T extends Element>(selector: string): T {
  const element = root.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Expected element for selector: ${selector}`)
  }
  return element
}
