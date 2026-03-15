import { describe, expect, it } from 'vitest'

import { defaultTheme, mergeTheme } from './index'

describe('workflow-editor-shell', () => {
  it('merges shell theme overrides over defaults', () => {
    const theme = mergeTheme({ accent: '#ff0000' })

    expect(theme.accent).toBe('#ff0000')
    expect(theme.canvasBg).toBe(defaultTheme.canvasBg)
  })
})
