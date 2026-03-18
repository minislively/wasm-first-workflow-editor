# Architecture Overview

## Layers

1. Shell UI on the main thread
2. Worker runtime for graph interaction state
3. WebGL primary renderer with Canvas 2D fallback
4. Adapter layer for `Web Component` and `React`

## v0 reality

This baseline proves the package seams and runnable demo flow first. The `workflow-wasm-core` package now includes a real Rust crate entrypoint so the repository can grow into actual WASM kernels without reshaping package boundaries, while the initial interaction helpers remain in TypeScript so the repository can run immediately.

## Current ownership split

The non-UI core now follows a clearer ownership model:

- `workflow-core`
  - owns graph mutation helpers
  - owns derived graph state such as node indexes, adjacency, and cached bounds/counts
  - exposes query helpers that the worker and renderers can reuse without rebuilding the same structure repeatedly
  - keeps a small compatibility wrapper layer for older helper calls, but the preferred path is the derived-state API
- `workflow-types`
  - owns the shared persisted document contract
  - keeps common product metadata typed while still leaving room for host-specific metadata through `metadata.extensions`
- `workflow-wasm-core`
  - owns numeric viewport/kernel helpers such as zoom, pan, and screen/world conversion
  - stays responsible for the `rust-wasm` vs `typescript-fallback` kernel seam
- `workflow-engine-worker`
  - owns orchestration, runtime resolution, and event emission
  - consumes derived graph state instead of recomputing scene-wide counts/bounds on every interaction path
- renderers
  - consume graph state prepared by core/worker rather than re-discovering edge endpoints through repeated full-array scans

This keeps data ownership, numeric kernel ownership, and runtime/reporting ownership separate.

## Boundary rule

- Shell owns branding, toolbar, inspector, and host layout.
- Engine owns viewport state, hit testing, graph movement, and render scheduling.
- Adapter packages must not pull host framework state into the engine hot path.

See [WASM integration path](./wasm.md) for the Rust crate and generated-package bridge model.
