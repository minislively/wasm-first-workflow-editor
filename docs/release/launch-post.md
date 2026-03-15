# Launch Post Draft

## Short version

We just open-sourced `wasm-first-workflow-editor`.

It is a `framework-agnostic, embeddable, WASM-first workflow editor` built around one rule:

`engine strict, shell flexible`

What is in `v0.1.0`:

- `Web Component` as the primary integration path
- React host wrapper as the secondary path
- worker-aware engine controller
- `WebGL` primary renderer seam with Canvas fallback
- Rust/WASM kernel seam with `wasm-pack` workflow
- runnable demos and CI verification

Repo:

`https://github.com/minislively/wasm-first-workflow-editor`

Release:

`https://github.com/minislively/wasm-first-workflow-editor/releases/tag/v0.1.0`

## Longer version

Most workflow editors are easy to style until the shell starts owning the graph hot path.

This repo goes the other direction:

- the graph stage is treated like an engine
- the host shell stays open for branding and integration
- the public story starts with `Web Component`, not framework lock-in

It is still early. `v0.1.0` does not claim infinite scale or polished collaboration features.
What it does claim is a clear performance architecture, a runnable baseline, and a repo that outside teams can actually pick up and evaluate.

If you are building agent builders, workflow products, or embedded automation UIs, this is the project shape we are pushing on.
