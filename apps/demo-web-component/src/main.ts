import './style.css'

import { createWorkflowEditor } from '@minislively/workflow-element'
import { createBasicDemoGraph } from '@minislively/workflow-nodepack-basic'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root was not found.')
}

app.innerHTML = `
  <main class="page">
    <section class="hero">
      <div class="copy">
        <p class="eyebrow">web component first</p>
        <h1>Drop the workflow editor into any host without inheriting a React-shaped hot path.</h1>
        <p class="lede">
          This host uses the primary embeddable surface: a custom element backed by a worker-aware engine controller, a WebGL-first renderer seam, and a shell that stays open for product branding.
        </p>
      </div>
      <div class="meta">
        <div class="meta-card">
          <span>Primary path</span>
          <strong>Custom element</strong>
        </div>
        <div class="meta-card">
          <span>Secondary path</span>
          <strong>React wrapper</strong>
        </div>
        <div class="meta-card">
          <span>Rule</span>
          <strong>Engine strict / shell flexible</strong>
        </div>
      </div>
    </section>
    <section class="mount-shell">
      <div id="mount"></div>
    </section>
  </main>
`

await createWorkflowEditor({
  mount: document.querySelector<HTMLElement>('#mount')!,
  graph: createBasicDemoGraph(),
  theme: {
    accent: '#14b8a6',
    nodeSelected: '#14b8a6',
  },
})
