# Performance Evaluation Guide

Use `apps/performance-lab` when you need evidence about runtime behavior, not just a first-run product feel.

## What to evaluate

- fixture fit across the public baseline sizes: `100`, `500`, `1000`
- whether `auto` mode resolves to the backend and kernel path you expect
- how explicit fallbacks appear when you force a runtime that is unavailable
- whether your host needs `editable` authoring or `read-only` viewing behavior
- whether the visible controls for a given fixture match the maturity you want to present publicly

## Recommended lab flow

1. Start from the dedicated `Performance Lab` app, which defaults to `fixture=100`, `editability=editable`, and full diagnostics.
2. Confirm the diagnostics panel shows the active renderer, kernel source, and current preferences before changing anything.
3. Step through `100`, `500`, and `1000` to observe node count, edge count, and zoom behavior under the same surface contract.
4. Verify that `500` and `1000` switch into explicit degraded read-only mode by default before enabling any experimental heavy-tier editing.
5. Change `rendererPreference` between `auto`, `webgl`, and `canvas` to see whether the runtime stays on the requested path or reports a fallback.
6. Change `kernelPreference` between `auto`, `wasm`, and `ts-fallback` to confirm which kernel source is active and whether a fallback reason is exposed.
7. Switch `editability` to `read-only` on lighter tiers when your evaluation target is viewer-style embedding rather than authoring.

## Trustworthy reading of fixture tiers

- `100` is the current editable lab baseline
- `500` and `1000` are public degraded-by-default evaluation fixtures
- if you are presenting heavier fixtures publicly today, keep the default read-only contract unless you intentionally enable experimental editing
- keep the tier-policy message and requested-vs-active diagnostics visible when you override the default heavy-tier behavior

## How to read diagnostics

- `Renderer`: the active backend path, such as `webgl` or `canvas2d`
- `Kernel`: the active kernel source, such as `rust-wasm` or `typescript-fallback`
- `Fallback`: explicit reason when the requested renderer or kernel could not stay on the preferred path
- `Renderer pref` / `Kernel pref`: the requested runtime mode, whether `auto` or forced
- `Nodes` / `Edges` / `Zoom`: the public runtime snapshot exposed through the `stats` event
- `Tier policy` / `Fixture contract`: whether the current fixture is an editing baseline or a degraded-by-default viewer tier

Expected fallback examples:

- forcing `webgl` on an unsupported environment may report `webgl unavailable; fell back to canvas2d`
- forcing `wasm` when the WASM kernel is unavailable may report `wasm kernel unavailable; using typescript fallback`
- forcing `ts-fallback` should remain explicit rather than silent

## What the lab proves today

- the repo exposes one public evaluation app instead of hidden internal-only diagnostics
- benchmark fixtures for `100`, `500`, and `1000` are runnable from the same host contract
- renderer and kernel preferences are externally visible through runtime diagnostics
- heavy tiers are visibly degraded by default instead of silently implying mature editing
- fallback states stay visible enough for adopters to judge fit without reading internals
- the current default baseline is honest: `fixture=100`, `editability=editable`, diagnostics visible
- heavy tiers surface degraded-by-default policy before experimental editing is enabled

## What the lab does not prove today

- no guaranteed FPS or throughput target is published in `v0`
- no public promise beyond the current `100 / 500 / 1000` fixture set
- no claim that the TypeScript fallback path is equivalent to the target Rust/WASM path
- no license to replace the graph hot path with arbitrary DOM-heavy rendering
- no claim that opt-in heavy-tier editing is as trustworthy as the `basic / 100` editing baseline

Keep the evaluation grounded in the project boundary rule: `engine strict, shell flexible`.
