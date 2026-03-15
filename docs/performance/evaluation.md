# Performance Evaluation Guide

Use `apps/performance-lab` when you need evidence about runtime behavior, not just a first-run product feel.

## What to evaluate

- fixture fit across the public baseline sizes: `100`, `500`, `1000`
- whether `auto` mode resolves to the backend and kernel path you expect
- how explicit fallbacks appear when you force a runtime that is unavailable
- whether your host needs `editable` authoring or `read-only` viewing behavior

## Recommended lab flow

1. Start from the dedicated `Performance Lab` app, which defaults to `fixture=100`, `editability=editable`, and full diagnostics.
2. Confirm the diagnostics panel shows the active renderer, kernel source, and current preferences before changing anything.
3. Step through `100`, `500`, and `1000` to observe node count, edge count, and zoom behavior under the same surface contract.
4. Change `rendererPreference` between `auto`, `webgl`, and `canvas` to see whether the runtime stays on the requested path or reports a fallback.
5. Change `kernelPreference` between `auto`, `wasm`, and `ts-fallback` to confirm which kernel source is active and whether a fallback reason is exposed.
6. Switch `editability` to `read-only` when your evaluation target is viewer-style embedding rather than authoring.

## How to read diagnostics

- `Renderer`: the active backend path, such as `webgl` or `canvas2d`
- `Kernel`: the active kernel source, such as `rust-wasm` or `typescript-fallback`
- `Fallback`: explicit reason when the requested renderer or kernel could not stay on the preferred path
- `Renderer pref` / `Kernel pref`: the requested runtime mode, whether `auto` or forced
- `Nodes` / `Edges` / `Zoom`: the public runtime snapshot exposed through the `stats` event

Expected fallback examples:

- forcing `webgl` on an unsupported environment may report `webgl unavailable; fell back to canvas2d`
- forcing `wasm` when the WASM kernel is unavailable may report `wasm kernel unavailable; using typescript fallback`
- forcing `ts-fallback` should remain explicit rather than silent

## What the lab proves today

- the repo exposes one public evaluation app instead of hidden internal-only diagnostics
- benchmark fixtures for `100`, `500`, and `1000` are runnable from the same host contract
- renderer and kernel preferences are externally visible through runtime diagnostics
- fallback states stay visible enough for adopters to judge fit without reading internals

## What the lab does not prove today

- no guaranteed FPS or throughput target is published in `v0`
- no public promise beyond the current `100 / 500 / 1000` fixture set
- no claim that the TypeScript fallback path is equivalent to the target Rust/WASM path
- no license to replace the graph hot path with arbitrary DOM-heavy rendering

Keep the evaluation grounded in the project boundary rule: `engine strict, shell flexible`.
