# WASM-First Workflow Editor

Framework-agnostic, embeddable, WASM-first workflow editor monorepo.

[![verify](https://github.com/minislively/wasm-first-workflow-editor/actions/workflows/verify.yml/badge.svg)](https://github.com/minislively/wasm-first-workflow-editor/actions/workflows/verify.yml)

![Web Component demo](./docs/assets/web-component-demo.png)

## v0 promise

This repository does not promise infinite scale. It promises a measurable baseline:

- `Web Component` is the primary integration path
- `React` stays a secondary host wrapper
- the graph stage stays on an engine-shaped path
- a runnable minimum demo exists from a clean checkout
- benchmark fixtures for `100`, `500`, and `1000` nodes are committed

## Why this exists

Most node editors let shell convenience leak into the graph hot path. This repository does the opposite:

- the graph stage is treated like a scene engine
- the host shell stays open for branding and integration
- the primary adoption path is `Web Component`, not framework lock-in

## What ships in this baseline

- Runnable `Web Component` demo
- Runnable `React` host demo
- Package seams for core, worker runtime, renderers, shell, custom element, and React adapter
- Architecture, adoption, and performance-boundary docs

## Product Demo

Use `apps/demo-web-component` when you want to understand the editor as a product:

- small default graph
- direct editing feel
- template-first example swaps for guided API-style flows
- lightweight runtime feedback
- clear `Web Component`-first story

Run it with:

```bash
pnpm demo:web-component
```

## Performance Lab

Use `apps/performance-lab` when you want to evaluate runtime behavior:

- dedicated app instead of an in-page mode toggle
- fixture selector for `basic / 100 / 500 / 1000`
- diagnostics for backend, kernel source, node count, edge count, zoom, and fallback reason
- explicit controls for `editability`, `rendererPreference`, and `kernelPreference`
- requested-vs-active runtime rows so forced preferences can be compared against what the engine actually resolved
- degraded-by-default heavy tiers with an explicit experimental-editing opt-in
- syncing and fallback callouts so evaluators can tell when a fixture/control change is still in flight
- benchmark-oriented reading of the same editor contract

The lab is a truth surface, not a marketing surface:

- visible controls should match actual runtime behavior
- requested and active runtime state should stay side by side
- heavier fixtures should be evaluated with explicit diagnostics, not implied maturity
- current repo state keeps `100` as the default editable baseline and downgrades `500 / 1000` to degraded viewer mode by default

Run it with:

```bash
pnpm demo:performance-lab
```

Default state model:

- `Product Demo`: fixed `basic` fixture, editable interactions, lightweight runtime snapshot
- `Performance Lab`: `fixture=100`, `editability=editable`, full diagnostics

Evaluation guidance:

- compare `requested` and `active` runtime rows after changing renderer or kernel preferences
- treat `Fallback visible` as a first-class result, not a hidden error
- treat `500` and `1000` as navigation-first tiers unless you explicitly opt into experimental editing
- keep the public fixture promise bounded to `100 / 500 / 1000` until heavier scenarios are explicitly validated

Recommended evaluation path:

1. Start in `Performance Lab` and confirm the current renderer, kernel source, and fallback state.
2. Step through the public fixtures `100`, `500`, and `1000`.
3. Compare `rendererPreference` and `kernelPreference` in `auto` versus forced modes.
4. Confirm `500` and `1000` enter degraded read-only mode by default, then enable experimental editing only if you are intentionally probing beyond the trustworthy baseline.
5. Switch `editability` to `read-only` on lighter tiers if your target integration is a viewer rather than an editor.

## Public Reliability Contract

The public surfaces are intentionally split:

- `Product Demo`: trustworthy first-run surface, fixed to the `basic` graph and lightweight runtime feedback
- `Performance Lab`: diagnostics-forward surface for fixture comparison and runtime preference evaluation

Current trustworthy baseline:

- `basic`: product-oriented editable baseline
- `100`: lab-oriented editable baseline for interaction smoke and diagnostics comparison
- `500 / 1000`: public evaluation fixtures that default to degraded viewer mode unless a host explicitly opts into experimental editing

Near-term usage guidance:

- treat `Product Demo` as the place to assess the editor feel
- treat `Performance Lab` as the place to assess runtime selection, fallback visibility, and heavier fixture behavior
- prefer template-first examples and host-controlled API wiring over broad freeform editing promises when presenting the project publicly

For the full surface contract, see [Public Surface Reliability](./docs/product/reliability.md).

## Demo surfaces

Primary host:

![Web Component host](./docs/assets/web-component-demo.png)

Secondary host:

![React host](./docs/assets/react-host-demo.png)

## Product rule

`Engine is strict, shell is flexible.`

- The graph scene is treated as a rendering engine.
- Product teams are expected to customize shell, inspector, toolbar, theming, and host layout.
- Product teams are not expected to replace the graph hot path with arbitrary DOM-heavy node bodies.

## Quick start

```bash
pnpm install
pnpm bench:fixtures
pnpm typecheck
pnpm test
pnpm wasm:test
pnpm wasm:build
pnpm build
pnpm demo:web-component
```

In another terminal:

```bash
pnpm demo:performance-lab
```

In another terminal:

```bash
pnpm demo:react
```

If `wasm-pack` is not installed yet, `pnpm wasm:build` will explain how to install it and the rest of the repo still runs on the TypeScript fallback path.

## Integration surfaces

- Primary: `@minislively/workflow-element`
- Secondary: `@minislively/workflow-react`
- Supporting: shared types, engine, renderers, and wasm kernel packages

## Benchmark fixtures

- `basic`: product-oriented default graph
- `100`: light lab fixture
- `500`: degraded-by-default medium evaluation fixture
- `1000`: degraded-by-default heavy public viewing fixture

## Package map

- `@minislively/workflow-types`: shared protocol and graph types
- `@minislively/workflow-core`: graph helpers, hit testing, viewport math
- `@minislively/workflow-wasm-core`: TypeScript bridge plus Rust/WASM kernel seam
- `@minislively/workflow-engine-worker`: engine controller for worker and main-thread fallback
- `@minislively/workflow-renderer-webgl`: primary GPU renderer
- `@minislively/workflow-renderer-canvas`: fallback canvas renderer
- `@minislively/workflow-editor-shell`: shell theme tokens and styling contract
- `@minislively/workflow-element`: primary `Web Component` integration surface
- `@minislively/workflow-react`: secondary React wrapper
- `@minislively/workflow-demo-support`: shared fixtures and diagnostics helpers for demo apps
- `@minislively/workflow-nodepack-basic`: starter graph fixture and node catalog

## Docs

- [Architecture](./docs/architecture/overview.md)
- [Public surface reliability](./docs/product/reliability.md)
- [Web Component adoption](./docs/adoption/web-component.md)
- [React host guidance](./docs/adoption/react-host.md)
- [Performance boundary](./docs/performance/boundaries.md)
- [Performance baseline](./docs/performance/baselines.md)
- [Performance evaluation guide](./docs/performance/evaluation.md)
- [Contributing](./CONTRIBUTING.md)
- [Release notes](./docs/release/v0.1.0.md)
- [Launch post draft](./docs/release/launch-post.md)

## License

MIT. See [LICENSE](./LICENSE).
