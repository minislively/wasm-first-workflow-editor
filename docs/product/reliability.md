# Public Surface Reliability

This repository treats `Product Demo` and `Performance Lab` as public surfaces, not internal-only examples.

The reliability rule is simple:

- if a control or interaction is visible, the runtime behavior should match that promise
- if a capability is degraded, experimental, or unavailable, the UI and docs should say so directly

## Surface split

### Product Demo

`apps/demo-web-component` is the first-run product surface:

- fixed `basic` fixture
- editable baseline
- lightweight runtime snapshot
- no lab controls, fixture toggles, or diagnostics-heavy evaluation panels

This keeps the visible contract narrow enough to stay trustworthy.

### Performance Lab

`apps/performance-lab` is the evaluation surface:

- public fixtures: `basic / 100 / 500 / 1000`
- explicit runtime controls for `editability`, `rendererPreference`, and `kernelPreference`
- requested-vs-active diagnostics rows
- explicit fallback reporting when the preferred runtime path is unavailable

This surface is where heavier fixture behavior should be interpreted.

## Current shipped baseline

The current codebase supports these public expectations:

- `basic` is the product-oriented editable baseline
- `100` is the default lab baseline for editing and diagnostics comparison
- `500 / 1000` default to read-only degraded mode with explicit tier-policy messaging
- diagnostics expose backend, kernel source, counts, zoom, and fallback state through public events
- browser tests cover the visible split between Product Demo and Performance Lab, plus runtime diagnostics honesty

## Heavy-tier reliability contract

The reliability-oriented PRD asks for `500 / 1000` to be degraded-by-default unless explicitly justified. The current tree implements that policy in the public lab surface:

- `apps/performance-lab` still defaults to `fixture=100` and `editability=editable`
- switching to `500` or `1000` forces the default public mode back to `read-only`
- the UI labels those tiers as degraded-by-default and offers an explicit opt-in for experimental editing
- diagnostics keep requested and active state visible so the override remains honest

Public docs should therefore describe `500 / 1000` as degraded evaluation fixtures, not as proof of equally trustworthy editing maturity.

## Host vs engine contract

Reliability depends on keeping the architecture boundary intact:

- host owns routing, persistence, shell layout, inspector UI, and API-driven flows
- engine owns pointer handling, drag loops, selection mechanics, hit testing, pan/zoom, and graph-stage rendering

The `Web Component` contract remains the primary public integration path. React stays a secondary host wrapper, not the graph hot path owner.

## Template-first public story

Near-term public guidance should stay template-first:

- start from a runnable example flow
- let adopters swap API nodes, settings, and host-owned shell wiring
- avoid overselling broad freeform editing where reliability still depends on fixture size and runtime conditions

This keeps the public promise aligned with the current trustworthy baseline.
