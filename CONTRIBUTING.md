# Contributing

## Principles

- Keep the graph hot path on the engine side.
- Keep shell flexibility out of scene rendering internals.
- Prefer explicit package seams over convenience imports that blur ownership.
- Preserve the `Web Component` primary path. React remains a secondary host surface.

## Local setup

```bash
pnpm install
pnpm bench:fixtures
pnpm typecheck
pnpm test
pnpm wasm:test
pnpm wasm:build
pnpm build
```

## Development workflow

Run the primary host:

```bash
pnpm demo:web-component
```

Run the secondary host:

```bash
pnpm demo:react
```

## Before opening a PR

- `pnpm typecheck`
- `pnpm test`
- `pnpm wasm:test`
- `pnpm wasm:build`
- `pnpm build`
- `pnpm bench:smoke`

## What to avoid

- Do not move drag-loop or per-frame scene state into host framework code.
- Do not introduce arbitrary DOM-heavy node bodies into the graph scene.
- Do not make React the architectural source of truth for the editor.

## Contribution lanes

- Docs and adoption: host examples, event docs, theming, integration guidance
- Engine: worker protocol, viewport math, hit testing, geometry helpers
- WASM: Rust kernel exports, wasm-pack bridge, performance-oriented kernels
- Rendering: WebGL path, Canvas fallback, scene batching, status overlays
