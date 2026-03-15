# Web Component Adoption

`@minislively/workflow-element` is the primary integration surface.

## Why this is primary

- Works in framework and non-framework hosts
- Matches the product promise of embeddability
- Keeps the host contract smaller than a framework-first package

## Host example

```ts
import { createWorkflowEditor } from '@minislively/workflow-element'
import { createBasicDemoGraph } from '@minislively/workflow-nodepack-basic'

const editor = await createWorkflowEditor({
  mount: document.querySelector('#mount')!,
  graph: createBasicDemoGraph(),
  theme: {
    accent: '#14b8a6',
    nodeSelected: '#14b8a6',
  },
})
```

## Event contract

The host should listen to editor events instead of pulling graph-stage state directly into app-level rendering.

```ts
const mount = document.querySelector('#mount')!
const { element } = await createWorkflowEditor({
  mount,
  graph: createBasicDemoGraph(),
})

element.addEventListener('ready', (event) => {
  const detail = (event as CustomEvent).detail
  console.log('runtime ready', detail.backend, detail.kernelSource)
})

element.addEventListener('selection', (event) => {
  const detail = (event as CustomEvent).detail
  console.log('selection', detail.selected)
})

element.addEventListener('change', (event) => {
  const detail = (event as CustomEvent).detail
  console.log('graph updated', detail.graph)
})
```

### What each event is for

- `ready`: tells the host which renderer/backend and kernel source are active
- `selection`: lets the host react to current node selection without subscribing to the full scene loop
- `change`: emits the current graph document when graph state changes

## Non-React host example

See [non-react-host.html](./non-react-host.html) for a plain HTML host that mounts the editor, listens to `ready`, `selection`, and `change`, and applies a host-owned theme.

## Theming and shell customization

The host may customize the shell aggressively without moving heavy UI into the graph stage.

```ts
await createWorkflowEditor({
  mount: document.querySelector('#mount')!,
  graph: createBasicDemoGraph(),
  theme: {
    shellBg: '#111827',
    shellPanel: '#0f172a',
    shellBorder: '#334155',
    shellText: '#e2e8f0',
    shellMuted: '#94a3b8',
    accent: '#22c55e',
    nodeSelected: '#22c55e',
  },
})
```

Typical host-owned customization:

- shell layout around the editor
- toolbar placement
- surrounding inspector chrome
- brand color, font, spacing, iconography
- host-specific menus and actions that react to editor events

## Boundary rule

The shell is intentionally customizable. The graph hot path is intentionally constrained.

## Allowed customization

- theme tokens
- toolbar and layout around the editor
- shell slot composition
- host-level menus and inspector affordances

## Restricted customization

- arbitrary DOM-heavy node bodies inside the graph scene
- edge hot-path replacement with DOM
- drag-time rich form editing on the stage

Why this restriction exists:

- it keeps the graph stage on an engine-shaped path
- it prevents host framework state from becoming the bottleneck
- it preserves the worker/WebGL/WASM split that the product is built around
