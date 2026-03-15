# Architecture Overview

## Layers

1. Shell UI on the main thread
2. Worker runtime for graph interaction state
3. WebGL primary renderer with Canvas 2D fallback
4. Adapter layer for `Web Component` and `React`

## v0 reality

This baseline proves the package seams and runnable demo flow first. The `workflow-wasm-core` package is kept as the compute seam for Rust/WASM work, while the initial interaction helpers are implemented in TypeScript so the repository can run immediately.

## Boundary rule

- Shell owns branding, toolbar, inspector, and host layout.
- Engine owns viewport state, hit testing, graph movement, and render scheduling.
- Adapter packages must not pull host framework state into the engine hot path.
