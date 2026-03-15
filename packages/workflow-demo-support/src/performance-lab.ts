import type { Editability, RuntimePreferences } from '@minislively/workflow-types'

import type { DiagnosticsState } from './diagnostics'
import {
  describeFixtureTier,
  getFixtureInteractionContract,
  isDegradedFixture,
  resolvePerformanceLabEditability,
  type FixtureKey,
  type PerformanceLabState,
} from './fixtures'

type RuntimeResolution = {
  requested: string
  active: string
  status: string
}

export type PerformanceLabSummary = {
  renderer: RuntimeResolution
  kernel: RuntimeResolution
  editability: string
  effectiveEditability: Editability
  fixtureLabel: string
  fixtureContractLabel: string
  fallbackLabel: string
  capabilityTitle: string
  capabilityDetail: string
  degradedByDefault: boolean
  evaluationNotes: string[]
}

export function createPerformanceLabSummary(
  state: PerformanceLabState,
  diagnostics: DiagnosticsState,
): PerformanceLabSummary {
  const renderer = resolveRenderer(state, diagnostics)
  const kernel = resolveKernel(state, diagnostics)
  const effectiveEditability = resolvePerformanceLabEditability(
    state.fixture,
    state.editability,
    state.allowExperimentalEditing,
  )
  const degradedByDefault = isDegradedFixture(state.fixture)

  return {
    renderer,
    kernel,
    editability: describeEditability(state, effectiveEditability),
    effectiveEditability,
    fixtureLabel: describeFixture(state.fixture),
    fixtureContractLabel: describeFixtureTier(state.fixture),
    fallbackLabel: diagnostics.fallbackReason ?? 'No fallback reported.',
    capabilityTitle: getCapabilityTitle(degradedByDefault, state.allowExperimentalEditing),
    capabilityDetail: getCapabilityDetail(
      state.fixture,
      state.editability,
      effectiveEditability,
      state.allowExperimentalEditing,
    ),
    degradedByDefault,
    evaluationNotes: createEvaluationNotes(
      state,
      diagnostics,
      renderer,
      kernel,
      effectiveEditability,
    ),
  }
}

function describeEditability(
  state: PerformanceLabState,
  effectiveEditability: Editability,
) {
  const contract = getFixtureInteractionContract(state.fixture)

  if (effectiveEditability === 'read-only') {
    return contract.tier === 'degraded-viewer'
      ? 'Read-only is the default public contract for this fixture tier.'
      : 'Read-only isolates pan/zoom and fixture load behavior.'
  }

  return contract.tier === 'degraded-viewer'
    ? 'Editable overrides the degraded default and should be treated as an explicit experiment.'
    : 'Editable keeps node drag interactions active while you evaluate.'
}

function resolveRenderer(
  state: PerformanceLabState,
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
  state: PerformanceLabState,
  diagnostics: DiagnosticsState,
): RuntimeResolution {
  const active =
    diagnostics.kernelSource === 'pending'
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
  state: PerformanceLabState,
  diagnostics: DiagnosticsState,
  renderer: RuntimeResolution,
  kernel: RuntimeResolution,
  effectiveEditability: Editability,
): string[] {
  const notes = [
    `Fixture check: ${describeFixture(state.fixture)}`,
    `Contract check: ${describeFixtureTier(state.fixture)}`,
    `Interaction mode: ${effectiveEditability === 'read-only' ? 'navigation-only' : 'editing enabled'}`,
  ]

  if (isDegradedFixture(state.fixture) && !state.allowExperimentalEditing) {
    notes.push('Heavy fixture policy: read-only is enforced until experimental editing is explicitly enabled.')
  } else if (isDegradedFixture(state.fixture) && state.allowExperimentalEditing) {
    notes.push('Heavy fixture policy: experimental editing is explicitly enabled for this session.')
  }

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

export function getActiveKernelPreference(
  diagnostics: DiagnosticsState,
): RuntimePreferences['kernelPreference'] {
  return diagnostics.kernelSource === 'rust-wasm' ? 'wasm' : 'ts-fallback'
}

export function describeFixture(fixture: FixtureKey) {
  switch (fixture) {
    case 'basic':
      return 'basic fixture for product feel and onboarding'
    case '100':
      return '100 nodes for sanity and interaction smoke'
    case '500':
      return '500 nodes for degraded-by-default runtime evaluation'
    case '1000':
      return '1000 nodes for the public heavy-viewing baseline'
  }
}

function getCapabilityTitle(
  degradedByDefault: boolean,
  allowExperimentalEditing: boolean,
) {
  if (!degradedByDefault) {
    return 'Editing-capable baseline'
  }

  return allowExperimentalEditing
    ? 'Experimental editing enabled'
    : 'Degraded mode is active'
}

function getCapabilityDetail(
  fixture: FixtureKey,
  requestedEditability: Editability,
  effectiveEditability: Editability,
  allowExperimentalEditing: boolean,
) {
  if (!isDegradedFixture(fixture)) {
    return 'This public tier keeps editing available by default, so the visible controls match the editing-capable baseline promise.'
  }

  if (!allowExperimentalEditing) {
    return '500 and 1000 stay read-only by default. Pan, zoom, diagnostics, and fixture switching remain trustworthy while broad editing stays explicitly degraded.'
  }

  if (requestedEditability === 'read-only' || effectiveEditability === 'read-only') {
    return 'Experimental editing is unlocked for this heavy tier, but the current request still keeps the runtime in read-only mode.'
  }

  return 'Experimental editing is enabled for this heavy tier. Treat direct graph edits as an investigative path, not as the default public promise.'
}
