## Summary

- 

## Verification

- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm wasm:test`
- [ ] `pnpm wasm:build`
- [ ] `pnpm build`
- [ ] `pnpm bench:smoke`

## Boundary checks

- [ ] Graph hot path remains on the engine side
- [ ] `Web Component` remains the primary integration surface
- [ ] No arbitrary DOM-heavy node body behavior was introduced
