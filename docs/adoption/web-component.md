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

await createWorkflowEditor({
  mount: document.querySelector('#mount')!,
  graph: createBasicDemoGraph(),
})
```

## Allowed customization

- theme tokens
- toolbar and layout around the editor
- shell slot composition
- host-level menus and inspector affordances

## Restricted customization

- arbitrary DOM-heavy node bodies inside the graph scene
- edge hot-path replacement with DOM
- drag-time rich form editing on the stage
