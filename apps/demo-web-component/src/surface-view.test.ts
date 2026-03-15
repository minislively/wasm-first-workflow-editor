import { describe, expect, it } from 'vitest'

import { createSurfaceState } from './surface-state'
import {
  applyReadyDiagnostics,
  applyStatsDiagnostics,
  createInitialDiagnosticsState,
  createSurfaceViewModel,
  markDiagnosticsSyncing,
} from './surface-view'

describe('demo surface view model', () => {
  it('keeps Product Demo uncluttered by default', () => {
    const state = createSurfaceState('product-demo')
    const diagnostics = createInitialDiagnosticsState({
      editability: state.editability,
      rendererPreference: state.rendererPreference,
      kernelPreference: state.kernelPreference,
    })

    const viewModel = createSurfaceViewModel(state, diagnostics)

    expect(viewModel.summary).toContain('step into the lab')
    expect(viewModel.showLabControls).toBe(false)
    expect(viewModel.showEvaluation).toBe(false)
    expect(viewModel.showDiagnostics).toBe(false)
    expect(viewModel.modeLabel).toBe('Product Demo')
  })

  it('makes Performance Lab diagnostics and controls explicit by default', () => {
    const state = createSurfaceState('performance-lab')
    const diagnostics = createInitialDiagnosticsState({
      editability: state.editability,
      rendererPreference: state.rendererPreference,
      kernelPreference: state.kernelPreference,
    })

    const viewModel = createSurfaceViewModel(state, diagnostics)

    expect(viewModel.showLabControls).toBe(true)
    expect(viewModel.showEvaluation).toBe(true)
    expect(viewModel.showDiagnostics).toBe(true)
    expect(viewModel.modeLabel).toBe('Performance Lab')
    expect(viewModel.diagnosticsRows).toContainEqual({
      label: 'Fixture',
      value: '100',
    })
  })

  it('keeps fallback rendering explicit after ready and stats updates', () => {
    const state = createSurfaceState('performance-lab')
    const readyDiagnostics = applyReadyDiagnostics(
      createInitialDiagnosticsState({
        editability: state.editability,
        rendererPreference: state.rendererPreference,
        kernelPreference: state.kernelPreference,
      }),
      {
        type: 'ready',
        backend: 'canvas2d',
        kernelSource: 'typescript-fallback',
        preferences: {
          editability: 'read-only',
          rendererPreference: 'canvas',
          kernelPreference: 'ts-fallback',
        },
        fallbackReason: 'webgl unavailable',
      },
    )

    const diagnostics = applyStatsDiagnostics(readyDiagnostics, {
      type: 'stats',
      backend: 'canvas2d',
      kernelSource: 'typescript-fallback',
      nodeCount: 500,
      edgeCount: 499,
      zoom: 1.25,
      preferences: readyDiagnostics.preferences,
      fallbackReason: readyDiagnostics.fallbackReason,
    })

    const viewModel = createSurfaceViewModel(state, diagnostics)

    expect(viewModel.diagnosticsRows).toContainEqual({
      label: 'Fallback',
      value: 'webgl unavailable',
    })
    expect(viewModel.diagnosticsRows).toContainEqual({
      label: 'Active renderer pref',
      value: 'canvas',
    })
    expect(viewModel.diagnosticsRows).toContainEqual({
      label: 'Active kernel pref',
      value: 'ts-fallback',
    })
    expect(viewModel.diagnosticsRows).toContainEqual({
      label: 'Nodes',
      value: '500',
    })
    expect(viewModel.diagnosticsRows).toContainEqual({
      label: 'Zoom',
      value: '1.25x',
    })
    expect(viewModel.evaluationTone).toBe('warning')
    expect(viewModel.diagnosticsBannerTitle).toBe('Fallback visible')
  })

  it('shows syncing state while lab controls are still applying', () => {
    const state = createSurfaceState('performance-lab')
    state.rendererPreference = 'webgl'
    const diagnostics = markDiagnosticsSyncing(
      createInitialDiagnosticsState({
        editability: state.editability,
        rendererPreference: state.rendererPreference,
        kernelPreference: state.kernelPreference,
      }),
      {
        editability: state.editability,
        rendererPreference: state.rendererPreference,
        kernelPreference: state.kernelPreference,
      },
      1000,
      999,
    )

    const viewModel = createSurfaceViewModel(state, diagnostics)

    expect(viewModel.evaluationTone).toBe('info')
    expect(viewModel.evaluationTitle).toBe('Runtime update in progress')
    expect(viewModel.comparisonRows).toContainEqual({
      label: 'Renderer pref',
      requested: 'webgl',
      active: 'webgl',
      matches: true,
    })
    expect(viewModel.diagnosticsRows).toContainEqual({
      label: 'Sync',
      value: 'syncing',
    })
  })
})
