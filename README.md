# WASM-First Workflow Editor

Framework-agnostic, embeddable, WASM-first workflow editor monorepo.

## v0 promise

This repository does not promise infinite scale. It promises a measurable baseline:

- `Web Component` is the primary integration path
- `React` stays a secondary host wrapper
- the graph stage stays on an engine-shaped path
- a runnable minimum demo exists from a clean checkout
- benchmark fixtures for `100`, `500`, and `1000` nodes are committed

## What ships in this baseline

- Runnable `Web Component` demo
- Runnable `React` host demo
- Package seams for core, worker runtime, renderers, shell, custom element, and React adapter
- Architecture, adoption, and performance-boundary docs

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
pnpm demo:react
```

If `wasm-pack` is not installed yet, `pnpm wasm:build` will explain how to install it and the rest of the repo still runs on the TypeScript fallback path.

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
- `@minislively/workflow-nodepack-basic`: starter graph fixture and node catalog

## Docs

- [Architecture](./docs/architecture/overview.md)
- [Web Component adoption](./docs/adoption/web-component.md)
- [React host guidance](./docs/adoption/react-host.md)
- [Performance boundary](./docs/performance/boundaries.md)
- [Performance baseline](./docs/performance/baselines.md)

## License

MIT. See [LICENSE](./LICENSE).
