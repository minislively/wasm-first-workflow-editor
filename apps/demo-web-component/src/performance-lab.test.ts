import { describe, expect, it } from 'vitest'

import { createSurfaceState } from './surface-state'
import { createPerformanceLabSummary } from './performance-lab'

describe('performance lab summary', () => {
  it('keeps forced runtime mismatches explicit for evaluation', () => {
    const state = createSurfaceState('performance-lab')
    state.rendererPreference = 'webgl'
    state.kernelPreference = 'wasm'
    state.editability = 'read-only'

    const summary = createPerformanceLabSummary(state, {
      backend: 'canvas2d',
      kernelSource: 'typescript-fallback',
      nodeCount: 1000,
      edgeCount: 999,
      zoom: 0.9,
      fallbackReason: 'webgl unavailable; fell back to canvas2d',
      preferences: {
        editability: 'read-only',
        rendererPreference: 'canvas',
        kernelPreference: 'ts-fallback',
      },
    })

    expect(summary.renderer.status).toBe('Requested webgl, active canvas2d.')
    expect(summary.kernel.status).toBe('Requested wasm, active ts-fallback.')
    expect(summary.editability).toContain('Read-only isolates')
    expect(summary.evaluationNotes).toContain(
      'Fallback surfaced: webgl unavailable; fell back to canvas2d',
    )
  })
})
