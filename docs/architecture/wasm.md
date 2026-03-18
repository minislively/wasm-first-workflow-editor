# WASM Integration Path

`workflow-wasm-core` is intentionally split into two layers:

- `src/index.ts`: public TypeScript bridge and safe fallback path
- `rust/`: Rust crate compiled with `wasm-pack`

## Why the split exists

- the repo must run from a clean checkout before contributors install the Rust-to-WASM toolchain
- the engine still needs a stable import surface even when the generated WASM package is absent
- the long-term performance path should not require package-boundary changes later

## Build command

```bash
pnpm wasm:build
```

That script runs `wasm-pack build` against `packages/workflow-wasm-core/rust` and emits the generated JS/WASM wrapper into `packages/workflow-wasm-core/pkg`.

## Runtime behavior

- if the generated package exists, the bridge can load Rust exports
- if the package does not exist, the bridge falls back to TypeScript helpers
- the fallback is explicit so adoption and contributor setup do not depend on hidden global state

## Current bounded WASM scope

The current bounded kernel scope is intentionally narrow and explicit:

- `clampZoom`
- `screenToWorldX`
- `screenToWorldY`
- `panViewportX`
- `panViewportY`
- `zoomViewportX`
- `zoomViewportY`

These helpers are the current numeric-kernel contract. They are not a claim that hit testing, graph mutation, indexing, or validation already live in Rust/WASM.

## What still stays outside WASM today

- graph mutation and document updates
- node/edge indexing and adjacency ownership
- hit testing over derived scene state
- validation and metadata parsing
- renderer batching/culling policy

That split is intentional: runtime reporting should stay honest about what is currently `rust-wasm` versus what remains in the safe TypeScript path.
