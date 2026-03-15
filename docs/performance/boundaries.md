# Performance Boundary

The editor is designed around one rule:

`Engine strict, shell flexible.`

## Allowed to vary per company

- color, typography, spacing, radius
- shell layout
- inspector content
- toolbar composition
- host chrome and branding

## Not open-ended

- graph node body rendering
- edge draw path
- hot interaction state

## Default runtime path

- worker-backed rendering when `OffscreenCanvas` is available
- `WebGL` renderer as the first renderer attempt
- Canvas 2D fallback when GPU path is not available

The baseline demo keeps the public contract explicit even where the underlying implementation is intentionally minimal.
