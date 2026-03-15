// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import { defineWorkflowEditor, WorkflowEditorElement } from './index'

describe('workflow-element', () => {
  it('dispatches ready with runtime preferences and fallback reason', () => {
    defineWorkflowEditor()
    const element = document.createElement('workflow-editor') as WorkflowEditorElement & {
      statsBadge?: HTMLSpanElement
      statusBadge?: HTMLSpanElement
      handleEngineEvent: (event: unknown) => void
    }

    const statusBadge = document.createElement('span')
    element.statusBadge = statusBadge

    let received: unknown
    element.addEventListener('ready', (event) => {
      received = (event as CustomEvent).detail
    })

    element.handleEngineEvent({
      type: 'ready',
      backend: 'canvas2d',
      kernelSource: 'typescript-fallback',
      preferences: {
        editability: 'read-only',
        rendererPreference: 'canvas',
        kernelPreference: 'ts-fallback',
      },
      fallbackReason: 'kernel forced to typescript fallback',
    })

    expect(received).toEqual({
      type: 'ready',
      backend: 'canvas2d',
      kernelSource: 'typescript-fallback',
      preferences: {
        editability: 'read-only',
        rendererPreference: 'canvas',
        kernelPreference: 'ts-fallback',
      },
      fallbackReason: 'kernel forced to typescript fallback',
    })
    expect(statusBadge.textContent).toContain('canvas2d')
    expect(statusBadge.textContent).toContain('typescript-fallback')
  })

  it('dispatches stats as a public custom event', () => {
    defineWorkflowEditor()
    const element = document.createElement('workflow-editor') as WorkflowEditorElement & {
      statsBadge?: HTMLSpanElement
      statusBadge?: HTMLSpanElement
      handleEngineEvent: (event: unknown) => void
    }

    const statsBadge = document.createElement('span')
    const statusBadge = document.createElement('span')
    element.statsBadge = statsBadge
    element.statusBadge = statusBadge

    let received: unknown
    element.addEventListener('stats', (event) => {
      received = (event as CustomEvent).detail
    })

    element.handleEngineEvent({
      type: 'stats',
      backend: 'webgl',
      kernelSource: 'rust-wasm',
      nodeCount: 100,
      edgeCount: 99,
      zoom: 1.25,
      preferences: {
        editability: 'editable',
        rendererPreference: 'auto',
        kernelPreference: 'auto',
      },
      fallbackReason: null,
    })

    expect(received).toEqual({
      type: 'stats',
      backend: 'webgl',
      kernelSource: 'rust-wasm',
      nodeCount: 100,
      edgeCount: 99,
      zoom: 1.25,
      preferences: {
        editability: 'editable',
        rendererPreference: 'auto',
        kernelPreference: 'auto',
      },
      fallbackReason: null,
    })
    expect(statsBadge.textContent).toContain('100 nodes')
    expect(statsBadge.textContent).toContain('rust-wasm')
  })
})
