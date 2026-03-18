# WASM-First Workflow Editor

Embeddable workflow/agent builder foundation for web apps.

[![verify](https://github.com/minislively/wasm-first-workflow-editor/actions/workflows/verify.yml/badge.svg)](https://github.com/minislively/wasm-first-workflow-editor/actions/workflows/verify.yml)

![Web Component demo](./docs/assets/web-component-demo.png)

## Start here

```bash
pnpm install
pnpm demo:web-component
```

This launches the primary **Reference App** for the `Web Component` integration path.

## What this repo is for

- reusable workflow/agent builder runtime packages
- `Web Component` as the primary integration surface
- `React` as a secondary host wrapper
- a WASM kernel seam with a safe TypeScript fallback
- reference examples for embedding and runtime evaluation

## What this repo is not

- not a hosted collaboration product
- not a deployment control plane
- not a finished support / sales / ops SaaS

Support / sales / ops flows in this repository are **reference domains**, not the only intended domains.

## Examples

- `Reference App` — `pnpm demo:web-component`
- `Performance Example` — `pnpm demo:performance-lab`
- `React Example` — `pnpm demo:react`

## Current baseline

- `Web Component` is the primary path
- `React` is a secondary host wrapper
- benchmark fixtures for `100`, `500`, and `1000` nodes are committed
- the runtime keeps a clear `rust-wasm` vs `typescript-fallback` seam

For the OSS positioning and boundary details, see [Open source model](./docs/product/open-source-model.md).

## Reference App

Use `apps/demo-web-component` when you want the clearest example of the primary embed path:

- constrained builder shell with a real stage plus side-panel config flow
- template-first starter flow inside the reference surface
- constrained add/remove controls for the supported approval and follow-up node families
- lightweight runtime feedback without evaluation-surface diagnostics
- representative `Web Component`-first example with `React` kept secondary

## Performance Example

Use `apps/performance-lab` when you want to verify runtime behavior separately from the main reference surface:

- dedicated evaluation app instead of an in-page mode toggle
- fixture selector for `basic / 100 / 500 / 1000`
- diagnostics for backend, kernel source, node count, edge count, zoom, and fallback reason
- explicit controls for `editability`, `rendererPreference`, and `kernelPreference`
- requested-vs-active runtime rows so forced preferences can be compared against what the engine actually resolved
- Supported heavy tiers with an explicit Experimental-editing opt-in
- benchmark-oriented runtime proof surface

## React Example

Use `apps/demo-react-host` when the surrounding shell already lives in React and you want to see the secondary host wrapper in isolation.

Default state model:

- `Reference App`: builder-first `basic` surface with stage interaction, side-panel config, constrained add/remove, and lightweight runtime snapshot
- `Performance Example`: proof-oriented `fixture=100`, `editability=editable`, full diagnostics

Evaluation guidance:

- compare `requested` and `active` runtime rows after changing renderer or kernel preferences
- treat `Fallback visible` as a first-class result, not a hidden error
- treat `500` and `1000` as Supported navigation-first tiers unless you explicitly opt into Experimental editing
- keep the public fixture promise bounded to `100 / 500 / 1000` until heavier scenarios are explicitly validated

Recommended evaluation path:

1. Start in `Performance Example` and confirm the current renderer, kernel source, and fallback state.
2. Step through the public fixtures `100`, `500`, and `1000`.
3. Compare `rendererPreference` and `kernelPreference` in `auto` versus forced modes.
4. Confirm `500` and `1000` enter the Supported read-only default by default, then enable Experimental editing only if you are intentionally probing beyond the trustworthy baseline.
5. Switch `editability` to `read-only` on lighter tiers if your target integration is a viewer rather than an editor.

## Public Reliability Contract

The public example surfaces are intentionally split:

- `Reference App`: trustworthy primary reference shell for the `basic` graph, with a stage, host-owned config panel, and constrained node actions
- `Performance Example`: diagnostics-forward runtime evaluation surface for fixture comparison and runtime preference evaluation

Current trustworthy baseline:

- `basic`: product-oriented editable builder baseline
- `100`: lab-oriented editable baseline for interaction smoke and diagnostics comparison
- `500 / 1000`: public evaluation fixtures that default to the Supported read-only contract unless a host explicitly opts into Experimental editing

Near-term usage guidance:

- treat `Reference App` as the place to assess the builder shell, side-panel flow, and constrained host-owned mutations
- treat `Performance Example` as the place to assess runtime selection, fallback visibility, and heavier fixture behavior
- treat `React` as a supported secondary host wrapper when the surrounding product shell already lives in React
- prefer template-first starter flows, host-controlled API wiring, and constrained add/remove seams over broad freeform editing promises when presenting the project publicly

For the full surface contract, see [Public Surface Reliability](./docs/product/reliability.md).

## Example surfaces

Primary host:

![Web Component host](./docs/assets/web-component-demo.png)

Secondary host:

![React host](./docs/assets/react-host-demo.png)

The React example exists to show shell-level integration support. It is not the primary reference surface.

## Product rule

`Engine is strict, shell is flexible.`

- The graph scene is treated as a rendering engine.
- Product teams are expected to customize shell, inspector, toolbar, theming, and host layout.
- Product teams are not expected to replace the graph hot path with arbitrary DOM-heavy node bodies.

## Full local verification

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
- `500`: Supported medium evaluation fixture with a read-only default
- `1000`: Supported heavy public viewing fixture with a read-only default

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
- `@minislively/workflow-demo-support`: reference-domain fixtures, diagnostics helpers, and demo metadata
- `@minislively/workflow-nodepack-basic`: minimal starter graph fixture and node catalog

## Docs

- [Architecture](./docs/architecture/overview.md)
- [Open source model](./docs/product/open-source-model.md)
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
