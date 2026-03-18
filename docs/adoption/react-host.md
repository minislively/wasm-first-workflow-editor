# React Host Guidance

`@minislively/workflow-react` exists for React host convenience, not as the primary architecture surface or the representative product story.
Treat it as technical support for teams whose surrounding shell already runs in React, after the Reference App and `Web Component` contract have established the primary path.

## Positioning

- primary integration path: `@minislively/workflow-element`
- secondary integration path: `@minislively/workflow-react`
- use this when your surrounding application shell already lives in React and you want to preserve the same engine boundary

The React wrapper should stay thin and should not become the owner of graph-stage behavior.
It should also not become the proof surface for runtime maturity; that role belongs to `apps/performance-lab`.

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
- embedding the same builder contract inside an existing React product shell

Responsibilities that should stay out of React:

- graph node rendering
- edge drawing
- drag-loop state ownership
- per-frame scene interaction bookkeeping

If the React layer starts owning graph-stage interaction state, the product drifts away from its performance model.

The recommended sequence is:

1. validate the product contract with the `Web Component` path first
2. use `Performance Example` to validate heavier fixtures, runtime selection, and fallback reporting
3. adopt the React wrapper when React is the host-shell requirement, not the reason the editor exists
