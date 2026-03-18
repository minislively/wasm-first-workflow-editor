# Performance Baseline

This repository is still early, so the public promise is bounded.

## v0 benchmark fixtures

- `100` nodes: Guaranteed editable baseline for sanity and smoke
- `500` nodes: Supported heavy-tier evaluation with a read-only default
- `1000` nodes: Supported heavy-viewing evaluation with a read-only default

## What the baseline means today

- fixtures exist in `benchmarks/fixtures/`
- smoke validation can read and count them
- the renderer/engine seams are explicit enough to benchmark without redesigning the package graph

## What the baseline does not mean yet

- no hard FPS guarantee is published in `v0`
- no `3000+` node public promise yet
- no claim that current TypeScript placeholders equal the target Rust/WASM kernel path
- no claim that Supported heavy tiers are equivalent to the Guaranteed editable baseline

The purpose of `v0` is to make the performance architecture credible and testable before stronger numerical promises are made.
