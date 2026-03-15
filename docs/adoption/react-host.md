# React Host Guidance

`@minislively/workflow-react` exists for React host convenience, not as the primary architecture surface.

## Positioning

- primary integration path: `@minislively/workflow-element`
- secondary integration path: `@minislively/workflow-react`

The React wrapper should stay thin and should not become the owner of graph-stage behavior.

## Recommended usage

```tsx
import { WorkflowEditor } from '@minislively/workflow-react'
import { createBasicDemoGraph } from '@minislively/workflow-nodepack-basic'

export function AgentBuilderPanel() {
  return (
    <WorkflowEditor
      graph={createBasicDemoGraph()}
      theme={{
        accent: '#22c55e',
        nodeSelected: '#22c55e',
      }}
    />
  )
}
```

## Keep React on the shell side

Good responsibilities for the React host:

- page composition
- routing
- shell layout
- host inspector panels
- responding to editor events

Responsibilities that should stay out of React:

- graph node rendering
- edge drawing
- drag-loop state ownership
- per-frame scene interaction bookkeeping

If the React layer starts owning graph-stage interaction state, the product drifts away from its performance model.
