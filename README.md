# WASM-First Workflow Editor

Production-ready, embeddable agent builder foundation with a WASM-first runtime path.

[![verify](https://github.com/minislively/wasm-first-workflow-editor/actions/workflows/verify.yml/badge.svg)](https://github.com/minislively/wasm-first-workflow-editor/actions/workflows/verify.yml)

![Web Component demo](./docs/assets/web-component-demo.png)

## v0 promise

This repository does not promise infinite scale. It promises a builder teams can adopt quickly with a measurable runtime baseline:

- `Web Component` is the primary integration path
- `React` stays a secondary host wrapper
- the graph stage stays on an engine-shaped path
- a runnable minimum demo exists from a clean checkout
- benchmark fixtures for `100`, `500`, and `1000` nodes are committed

## Why this exists

Most node editors make it hard to ship a branded builder without letting shell convenience leak into the graph hot path. This repository does the opposite:

- Product Demo shows the representative product screen teams can adapt into their own service
- Performance Lab proves the runtime, fallback, and heavier-fixture behavior behind that product promise
- the graph stage is treated like a scene engine while the host shell stays open for branding and integration
- the primary adoption path is `Web Component`, not framework lock-in

## Open source boundary

This repository is intended to work like an **open-core builder foundation**, closer to a reusable engine than to a single hosted SaaS product.

### What is open source here

The open-source contract is the reusable builder foundation:

- graph/runtime packages
- WASM kernel seam
- worker/runtime event contract
- renderers
- `Web Component` and `React` adapters
- reference demo apps that show how the foundation behaves

### What the demos mean

The demos are **reference domains**, not the only product this repo can represent.

- `Product Demo` shows one builder-shaped shell teams can adapt
- `Performance Lab` shows one runtime-evaluation surface teams can inspect
- template choices such as support / sales / ops are examples of how a domain can be expressed on top of the foundation

That means adopters are expected to bring their own domain:

- customer support
- internal approvals
- operations workflows
- AI agent orchestration
- other graph-driven builders

### What is not claimed by the OSS boundary

This repo does **not** currently claim to be a full managed product for:

- hosted team collaboration
- deployment control plane
- template marketplace
- enterprise operations/support workflow

Those can exist later as product layers, but the repository itself is the reusable core plus reference surfaces.

## What ships in this baseline

- Runnable `Product Demo` app on the primary `Web Component` path
- Runnable `Performance Lab` proof surface
- Runnable `React` host demo for secondary integration support
- Package seams for core, worker runtime, renderers, shell, custom element, and React adapter
- Architecture, adoption, and performance-boundary docs

## Product Demo

Use `apps/demo-web-component` when you want to understand the editor as the product your team would actually embed:

- constrained builder shell with a real stage plus side-panel config flow
- template-first starter flow inside the builder surface
- constrained add/remove controls for the supported approval and follow-up node families
- lightweight runtime feedback without lab-style diagnostics overload
- representative `Web Component`-first product story with `React` kept secondary

Run it with:

```bash
pnpm demo:web-component
```

## Performance Lab

Use `apps/performance-lab` when you want to verify the runtime behavior behind the product surface:

- dedicated app instead of an in-page mode toggle
- fixture selector for `basic / 100 / 500 / 1000`
- diagnostics for backend, kernel source, node count, edge count, zoom, and fallback reason
- explicit controls for `editability`, `rendererPreference`, and `kernelPreference`
- requested-vs-active runtime rows so forced preferences can be compared against what the engine actually resolved
- Supported heavy tiers with an explicit Experimental-editing opt-in
- syncing and fallback callouts so evaluators can tell when a fixture/control change is still in flight
- benchmark-oriented proof surface for the same editor contract

The lab is a proof surface, not the main product face:

- visible controls should match actual runtime behavior
- requested and active runtime state should stay side by side
- heavier fixtures should be evaluated with explicit diagnostics, not implied maturity
- current repo state keeps `100` as the default Guaranteed editable baseline and keeps `500 / 1000` in the Supported read-only default by default

Run it with:

```bash
pnpm demo:performance-lab
```

Default state model:

- `Product Demo`: representative builder-first `basic` surface with stage interaction, side-panel config, constrained add/remove, and lightweight runtime snapshot
- `Performance Lab`: proof-oriented `fixture=100`, `editability=editable`, full diagnostics

Evaluation guidance:

- compare `requested` and `active` runtime rows after changing renderer or kernel preferences
- treat `Fallback visible` as a first-class result, not a hidden error
- treat `500` and `1000` as Supported navigation-first tiers unless you explicitly opt into Experimental editing
- keep the public fixture promise bounded to `100 / 500 / 1000` until heavier scenarios are explicitly validated

Recommended evaluation path:

1. Start in `Performance Lab` and confirm the current renderer, kernel source, and fallback state.
2. Step through the public fixtures `100`, `500`, and `1000`.
3. Compare `rendererPreference` and `kernelPreference` in `auto` versus forced modes.
4. Confirm `500` and `1000` enter the Supported read-only default by default, then enable Experimental editing only if you are intentionally probing beyond the trustworthy baseline.
5. Switch `editability` to `read-only` on lighter tiers if your target integration is a viewer rather than an editor.

## Public Reliability Contract

The public surfaces are intentionally split:

- `Product Demo`: trustworthy representative product shell for the `basic` graph, with a stage, host-owned config panel, and constrained node actions
- `Performance Lab`: diagnostics-forward proof surface for fixture comparison and runtime preference evaluation

Current trustworthy baseline:

- `basic`: product-oriented editable builder baseline
- `100`: lab-oriented editable baseline for interaction smoke and diagnostics comparison
- `500 / 1000`: public evaluation fixtures that default to the Supported read-only contract unless a host explicitly opts into Experimental editing

Near-term usage guidance:

- treat `Product Demo` as the place to assess the builder shell, side-panel flow, and constrained host-owned mutations
- treat `Performance Lab` as the place to assess runtime selection, fallback visibility, and heavier fixture behavior
- treat `React` as a supported secondary host wrapper when the surrounding product shell already lives in React
- prefer template-first starter flows, host-controlled API wiring, and constrained add/remove seams over broad freeform editing promises when presenting the project publicly

For the full surface contract, see [Public Surface Reliability](./docs/product/reliability.md).

## Demo surfaces

Primary host:

![Web Component host](./docs/assets/web-component-demo.png)

Secondary host:

![React host](./docs/assets/react-host-demo.png)

The React demo exists to show shell-level integration support. It is not the representative product screen.

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
