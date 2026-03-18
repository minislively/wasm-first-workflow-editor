# Open Source Model

## Positioning

This repository is meant to be used like an **open builder foundation**:

- closer to a reusable engine/library than to a single hosted product
- closer to `xyflow`-style adoption than to a finished vertical SaaS

## What adopters should expect

Adopters use this repository to:

- embed a workflow/agent builder into their own service
- reuse the runtime, renderer, and adapter seams
- start from reference-domain demos and replace the shell/domain details with their own

Typical adopter outcomes:

- internal workflow builder
- AI agent builder
- customer-support orchestration surface
- operations/incident workflow editor
- other graph-driven business tools

## What the repository itself provides

### Core OSS foundation

- `@minislively/workflow-types`
- `@minislively/workflow-core`
- `@minislively/workflow-wasm-core`
- `@minislively/workflow-engine-worker`
- `@minislively/workflow-renderer-webgl`
- `@minislively/workflow-renderer-canvas`
- `@minislively/workflow-element`
- `@minislively/workflow-react`

### Reference surfaces

- `apps/demo-web-component`
- `apps/performance-lab`
- `apps/demo-react-host`
- `@minislively/workflow-demo-support`

These reference surfaces are **examples and proofs**, not a claim that support/sales/ops are the only intended domains.

## What support / sales / ops mean

Support / sales / ops templates in this repo should be read as:

- reference starter flows
- schema examples
- testable domain samples

They are **not** the full commercial boundary.

## Product layer vs OSS layer

### OSS layer

The OSS layer is:

- the engine/runtime
- the renderer/runtime contracts
- the adapter/integration surfaces
- the shared schema and reference examples

### Product layer

A future product layer could include:

- hosted collaboration
- auth/team management
- deployment controls
- premium domain packs
- managed cloud runtime
- enterprise support

That product layer can sit on top of the OSS foundation without changing the repository's role.

## Decision rule

When deciding whether something belongs in this repo, ask:

> Does this help outside teams build their own graph-based builder on top of the foundation?

If yes, it likely belongs in OSS.
If it only helps operate a proprietary hosted product, it likely belongs in the product layer instead.
