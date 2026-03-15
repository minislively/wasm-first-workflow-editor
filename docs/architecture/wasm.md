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
