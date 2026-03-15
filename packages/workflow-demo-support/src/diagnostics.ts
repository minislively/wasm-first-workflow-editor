import type { EngineEvent, RuntimePreferences } from '@minislively/workflow-types'

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
