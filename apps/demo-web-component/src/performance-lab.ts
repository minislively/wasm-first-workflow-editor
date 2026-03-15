import type { RuntimePreferences } from '@minislively/workflow-types'

import type { DemoSurfaceState } from './surface-state'

export type DiagnosticsState = {
  backend: string
  kernelSource: string
  nodeCount: number
  edgeCount: number
  zoom: number
  fallbackReason: string | null
  preferences: RuntimePreferences
}

type RuntimeResolution = {
  requested: string
  active: string
  status: string
}

export type PerformanceLabSummary = {
  renderer: RuntimeResolution
  kernel: RuntimeResolution
  editability: string
  fixtureLabel: string
  fallbackLabel: string
  evaluationNotes: string[]
}

export function createPerformanceLabSummary(
  state: DemoSurfaceState,
  diagnostics: DiagnosticsState,
): PerformanceLabSummary {
  const renderer = resolveRenderer(state, diagnostics)
  const kernel = resolveKernel(state, diagnostics)

  return {
    renderer,
    kernel,
    editability:
      state.editability === 'read-only'
        ? 'Read-only isolates pan/zoom and fixture load behavior.'
        : 'Editable keeps node drag interactions active while you evaluate.',
    fixtureLabel: describeFixture(state.fixture),
    fallbackLabel: diagnostics.fallbackReason ?? 'No fallback reported.',
    evaluationNotes: createEvaluationNotes(state, diagnostics, renderer, kernel),
  }
}

function resolveRenderer(
  state: DemoSurfaceState,
  diagnostics: DiagnosticsState,
): RuntimeResolution {
  const active = diagnostics.backend === 'pending' ? 'pending' : diagnostics.backend

  if (state.rendererPreference === 'auto') {
    return {
      requested: 'auto',
      active,
      status:
        diagnostics.backend === 'pending'
          ? 'Awaiting renderer selection.'
          : `Auto selected ${active}.`,
    }
  }

  const matches =
    (state.rendererPreference === 'canvas' && diagnostics.backend === 'canvas2d') ||
    state.rendererPreference === diagnostics.backend

  return {
    requested: state.rendererPreference,
    active,
    status:
      diagnostics.backend === 'pending'
        ? `Waiting to confirm forced ${state.rendererPreference}.`
        : matches
          ? `Forced ${state.rendererPreference} is active.`
          : `Requested ${state.rendererPreference}, active ${active}.`,
  }
}

function resolveKernel(
  state: DemoSurfaceState,
  diagnostics: DiagnosticsState,
): RuntimeResolution {
  const active = diagnostics.kernelSource === 'pending'
    ? 'pending'
    : diagnostics.kernelSource === 'rust-wasm'
      ? 'wasm'
      : 'ts-fallback'

  if (state.kernelPreference === 'auto') {
    return {
      requested: 'auto',
      active,
      status:
        diagnostics.kernelSource === 'pending'
          ? 'Awaiting kernel selection.'
          : `Auto selected ${active}.`,
    }
  }

  return {
    requested: state.kernelPreference,
    active,
    status:
      diagnostics.kernelSource === 'pending'
        ? `Waiting to confirm forced ${state.kernelPreference}.`
        : active === state.kernelPreference
          ? `Forced ${state.kernelPreference} is active.`
          : `Requested ${state.kernelPreference}, active ${active}.`,
  }
}

function createEvaluationNotes(
  state: DemoSurfaceState,
  diagnostics: DiagnosticsState,
  renderer: RuntimeResolution,
  kernel: RuntimeResolution,
): string[] {
  const notes = [
    `Fixture check: ${describeFixture(state.fixture)}`,
    `Interaction mode: ${state.editability === 'read-only' ? 'navigation-only' : 'editing enabled'}`,
  ]

  if (state.rendererPreference !== 'auto' || state.kernelPreference !== 'auto') {
    notes.push(`Forced runtime: renderer ${renderer.status} Kernel ${kernel.status}`)
  } else if (diagnostics.backend !== 'pending' && diagnostics.kernelSource !== 'pending') {
    notes.push(`Auto runtime: ${renderer.status} ${kernel.status}`)
  }

  if (diagnostics.fallbackReason) {
    notes.push(`Fallback surfaced: ${diagnostics.fallbackReason}`)
  } else {
    notes.push('Fallback surfaced: none')
  }

  return notes
}

function describeFixture(fixture: DemoSurfaceState['fixture']) {
  switch (fixture) {
    case 'basic':
      return 'basic fixture for product feel and onboarding'
    case '100':
      return '100 nodes for sanity and interaction smoke'
    case '500':
      return '500 nodes for routine editing evaluation'
    case '1000':
      return '1000 nodes for the public heavy baseline'
  }
}
