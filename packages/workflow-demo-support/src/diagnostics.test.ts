import { describe, expect, it } from 'vitest'

import {
  applyReadyDiagnostics,
  applyStatsDiagnostics,
  createInitialDiagnosticsState,
  markDiagnosticsSyncing,
} from './index'

describe('workflow-demo-support diagnostics', () => {
  it('keeps fallback rendering explicit after ready and stats updates', () => {
    const readyDiagnostics = applyReadyDiagnostics(
      createInitialDiagnosticsState({
        editability: 'editable',
        rendererPreference: 'auto',
        kernelPreference: 'auto',
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

    expect(diagnostics.fallbackReason).toBe('webgl unavailable')
    expect(diagnostics.preferences.rendererPreference).toBe('canvas')
    expect(diagnostics.preferences.kernelPreference).toBe('ts-fallback')
    expect(diagnostics.nodeCount).toBe(500)
    expect(diagnostics.zoom).toBe(1.25)
    expect(diagnostics.syncStatus).toBe('ready')
  })

  it('keeps requested preferences visible while a lab update is syncing', () => {
    const diagnostics = markDiagnosticsSyncing(
      createInitialDiagnosticsState({
        editability: 'editable',
        rendererPreference: 'webgl',
        kernelPreference: 'auto',
      }),
      {
        editability: 'editable',
        rendererPreference: 'webgl',
        kernelPreference: 'auto',
      },
      1000,
      999,
    )

    expect(diagnostics.syncStatus).toBe('syncing')
    expect(diagnostics.preferences.rendererPreference).toBe('webgl')
    expect(diagnostics.nodeCount).toBe(1000)
    expect(diagnostics.edgeCount).toBe(999)
  })
})
