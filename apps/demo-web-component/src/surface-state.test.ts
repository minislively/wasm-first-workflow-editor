import { describe, expect, it } from 'vitest'

import { createSurfaceState } from './surface-state'

describe('demo surface state', () => {
  it('defaults Product Demo to the lightweight product-oriented state', () => {
    expect(createSurfaceState('product-demo')).toEqual({
      surfaceMode: 'product-demo',
      fixture: 'basic',
      editability: 'editable',
      rendererPreference: 'auto',
      kernelPreference: 'auto',
      diagnosticsVisibility: 'hidden',
    })
  })

  it('defaults Performance Lab to the diagnostics-forward evaluation state', () => {
    expect(createSurfaceState('performance-lab')).toEqual({
      surfaceMode: 'performance-lab',
      fixture: '100',
      editability: 'editable',
      rendererPreference: 'auto',
      kernelPreference: 'auto',
      diagnosticsVisibility: 'full',
    })
  })
})
