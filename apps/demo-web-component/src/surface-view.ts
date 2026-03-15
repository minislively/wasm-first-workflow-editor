import type { EngineEvent, RuntimePreferences } from '@minislively/workflow-types'

import { createPerformanceLabSummary } from './performance-lab'
import type { DemoSurfaceState, SurfaceMode } from './surface-state'

export type DiagnosticsState = {
  backend: string
  kernelSource: string
  nodeCount: number
  edgeCount: number
  zoom: number
  fallbackReason: string | null
  preferences: RuntimePreferences
  syncStatus: 'pending' | 'syncing' | 'ready'
  lastEvent: 'ready' | 'stats' | null
}

export type SurfaceViewModel = {
  summary: string
  modeLabel: string
  modeTitle: string
  modeDescription: string
  showLabControls: boolean
  showEvaluation: boolean
  showDiagnostics: boolean
  evaluationTone: 'neutral' | 'info' | 'success' | 'warning'
  evaluationTitle: string
  evaluationDetail: string
  comparisonRows: Array<{ label: string; requested: string; active: string; matches: boolean }>
  diagnosticsBannerTitle: string
  diagnosticsBannerDetail: string
  diagnosticsRows: Array<{ label: string; value: string }>
}

export function createInitialDiagnosticsState(
  preferences: RuntimePreferences,
): DiagnosticsState {
  return {
    backend: 'pending',
    kernelSource: 'pending',
    nodeCount: 0,
    edgeCount: 0,
    zoom: 1,
    fallbackReason: null,
    preferences,
    syncStatus: 'pending',
    lastEvent: null,
  }
}

export function applyReadyDiagnostics(
  diagnostics: DiagnosticsState,
  event: Extract<EngineEvent, { type: 'ready' }>,
): DiagnosticsState {
  return {
    ...diagnostics,
    backend: event.backend,
    kernelSource: event.kernelSource,
    fallbackReason: event.fallbackReason,
    preferences: event.preferences,
    syncStatus: diagnostics.lastEvent === 'stats' ? 'ready' : 'syncing',
    lastEvent: 'ready',
  }
}

export function applyStatsDiagnostics(
  diagnostics: DiagnosticsState,
  event: Extract<EngineEvent, { type: 'stats' }>,
): DiagnosticsState {
  return {
    ...diagnostics,
    backend: event.backend,
    kernelSource: event.kernelSource,
    nodeCount: event.nodeCount,
    edgeCount: event.edgeCount,
    zoom: event.zoom,
    fallbackReason: event.fallbackReason,
    preferences: event.preferences,
    syncStatus: 'ready',
    lastEvent: 'stats',
  }
}

export function markDiagnosticsSyncing(
  diagnostics: DiagnosticsState,
  preferences: RuntimePreferences,
  nodeCount: number,
  edgeCount: number,
): DiagnosticsState {
  return {
    ...diagnostics,
    nodeCount,
    edgeCount,
    syncStatus: 'syncing',
    preferences:
      diagnostics.syncStatus === 'pending' ? preferences : diagnostics.preferences,
  }
}

export function createSurfaceViewModel(
  state: DemoSurfaceState,
  diagnostics: DiagnosticsState,
): SurfaceViewModel {
  const modeCopy = getModeCopy(state.surfaceMode)
  const performanceLabSummary = createPerformanceLabSummary(state, diagnostics)
  const comparisonRows = [
    {
      label: 'Editability',
      requested: state.editability,
      active: diagnostics.preferences.editability,
      matches: state.editability === diagnostics.preferences.editability,
    },
    {
      label: 'Renderer pref',
      requested: state.rendererPreference,
      active: diagnostics.preferences.rendererPreference,
      matches:
        state.rendererPreference === diagnostics.preferences.rendererPreference,
    },
    {
      label: 'Kernel pref',
      requested: state.kernelPreference,
      active: diagnostics.preferences.kernelPreference,
      matches: state.kernelPreference === diagnostics.preferences.kernelPreference,
    },
  ]
  const evaluation =
    state.surfaceMode !== 'performance-lab'
      ? {
          tone: 'neutral' as const,
          title: 'Product surface first',
          detail:
            'Keep diagnostics in the background here. Use Performance Lab when you want runtime evidence instead of the default product feel.',
        }
      : diagnostics.syncStatus !== 'ready'
        ? {
            tone: 'info' as const,
            title: 'Runtime update in progress',
            detail:
              'The lab is applying the latest fixture or preference change. Compare requested and active rows after the next diagnostics event lands.',
          }
        : diagnostics.fallbackReason
          ? {
              tone: 'warning' as const,
              title: 'Fallback is active',
              detail: diagnostics.fallbackReason,
            }
          : {
              tone: 'success' as const,
              title: 'Requested runtime is active',
              detail:
                'No fallback is currently reported. Use fixture size, zoom, and requested-vs-active rows below to judge fit.',
            }

  return {
    summary:
      state.surfaceMode === 'product-demo'
        ? 'Start with the built-in editor feel, then step into the lab when you need proof.'
        : 'Use fixtures and diagnostics to judge runtime fit without guessing.',
    modeLabel: modeCopy.label,
    modeTitle: modeCopy.title,
    modeDescription: modeCopy.description,
    showLabControls: state.surfaceMode === 'performance-lab',
    showEvaluation: state.surfaceMode === 'performance-lab',
    showDiagnostics: state.diagnosticsVisibility !== 'hidden',
    evaluationTone: evaluation.tone,
    evaluationTitle: evaluation.title,
    evaluationDetail: evaluation.detail,
    comparisonRows,
    diagnosticsBannerTitle: diagnostics.fallbackReason
      ? 'Fallback visible'
      : 'No fallback reported',
    diagnosticsBannerDetail:
      diagnostics.fallbackReason ??
      'Requested runtime and active runtime are currently aligned.',
    diagnosticsRows: [
      { label: 'Mode', value: state.surfaceMode },
      { label: 'Fixture', value: state.fixture },
      { label: 'Renderer', value: diagnostics.backend },
      { label: 'Kernel', value: diagnostics.kernelSource },
      { label: 'Fallback', value: diagnostics.fallbackReason ?? 'none' },
      { label: 'Nodes', value: String(diagnostics.nodeCount) },
      { label: 'Edges', value: String(diagnostics.edgeCount) },
      { label: 'Zoom', value: `${diagnostics.zoom.toFixed(2)}x` },
      { label: 'Sync', value: diagnostics.syncStatus },
      { label: 'Last event', value: diagnostics.lastEvent ?? 'none' },
      { label: 'Requested editability', value: state.editability },
      { label: 'Active editability', value: diagnostics.preferences.editability },
      { label: 'Requested renderer', value: state.rendererPreference },
      {
        label: 'Active renderer pref',
        value: diagnostics.preferences.rendererPreference,
      },
      { label: 'Requested kernel', value: state.kernelPreference },
      {
        label: 'Active kernel pref',
        value: diagnostics.preferences.kernelPreference,
      },
      { label: 'Fixture read', value: performanceLabSummary.fixtureLabel },
      { label: 'Renderer check', value: performanceLabSummary.renderer.status },
      { label: 'Kernel check', value: performanceLabSummary.kernel.status },
    ],
  }
}

function getModeCopy(mode: SurfaceMode) {
  return mode === 'product-demo'
    ? {
        label: 'Product Demo',
        title: 'Default experience for first-time OSS users',
        description:
          'Focus on the usable editor surface first. Diagnostics stay hidden here so the page still feels like a product, not a benchmark console.',
      }
    : {
        label: 'Performance Lab',
        title: 'Evaluation mode for performance-sensitive teams',
        description:
          'Load heavier fixtures, inspect runtime backend/kernel state, and compare what the engine is really doing before you adopt it.',
      }
}
