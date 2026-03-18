import { describe, expect, it } from 'vitest'

import {
  createInitialDiagnosticsState,
  createPerformanceLabState,
  createPerformanceLabSummary,
} from './index'

describe('workflow-demo-support performance lab summary', () => {
  it('keeps forced runtime mismatches explicit for evaluation', () => {
    const state = createPerformanceLabState()
    state.rendererPreference = 'webgl'
    state.kernelPreference = 'wasm'
    state.editability = 'read-only'
    state.fixture = '1000'

    const summary = createPerformanceLabSummary(
      state,
      {
        ...createInitialDiagnosticsState({
          editability: 'read-only',
          rendererPreference: 'canvas',
          kernelPreference: 'ts-fallback',
        }),
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
        syncStatus: 'ready',
        lastEvent: 'stats',
      },
    )

    expect(summary.renderer.status).toBe('Requested webgl, active canvas2d.')
    expect(summary.kernel.status).toBe('Requested wasm, active ts-fallback.')
    expect(summary.editability).toContain('default Supported contract')
    expect(summary.fixtureContractLabel).toContain('Supported tier')
    expect(summary.effectiveEditability).toBe('read-only')
    expect(summary.capabilityTitle).toBe('Supported default is active')
    expect(summary.hasSupportedDefault).toBe(true)
    expect(summary.evaluationNotes).toContain(
      'Fallback surfaced: webgl unavailable; fell back to canvas2d',
    )
  })
})
