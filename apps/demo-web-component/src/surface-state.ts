import type {
  Editability,
  KernelPreference,
  RendererPreference,
} from '@minislively/workflow-types'

import type { FixtureKey } from './fixtures'

export type SurfaceMode = 'product-demo' | 'performance-lab'
export type DiagnosticsVisibility = 'hidden' | 'summary' | 'full'

export type DemoSurfaceState = {
  surfaceMode: SurfaceMode
  fixture: FixtureKey
  editability: Editability
  rendererPreference: RendererPreference
  kernelPreference: KernelPreference
  diagnosticsVisibility: DiagnosticsVisibility
}

export function createSurfaceState(mode: SurfaceMode): DemoSurfaceState {
  return mode === 'product-demo'
    ? {
        surfaceMode: 'product-demo',
        fixture: 'basic',
        editability: 'editable',
        rendererPreference: 'auto',
        kernelPreference: 'auto',
        diagnosticsVisibility: 'hidden',
      }
    : {
        surfaceMode: 'performance-lab',
        fixture: '100',
        editability: 'editable',
        rendererPreference: 'auto',
        kernelPreference: 'auto',
        diagnosticsVisibility: 'full',
      }
}
