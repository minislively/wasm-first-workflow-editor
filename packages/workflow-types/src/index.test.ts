import { describe, expect, it } from 'vitest'

import {
  isWorkflowBuilderStateMetadata,
  isWorkflowNodeStatus,
} from './index'

describe('workflow-types', () => {
  it('recognizes workflow node statuses', () => {
    expect(isWorkflowNodeStatus('idle')).toBe(true)
    expect(isWorkflowNodeStatus('ready')).toBe(true)
    expect(isWorkflowNodeStatus('running')).toBe(true)
    expect(isWorkflowNodeStatus('broken')).toBe(false)
  })

  it('validates builder-state metadata shape', () => {
    expect(
      isWorkflowBuilderStateMetadata({
        templateKey: 'support-triage',
        optionalNodes: {
          review: true,
        },
        actionCount: 1,
        presetKeys: {
          trigger: 'trigger-webhook',
        },
        statusOverrides: {
          publish: 'running',
        },
      }),
    ).toBe(true)

    expect(
      isWorkflowBuilderStateMetadata({
        templateKey: 'support-triage',
        optionalNodes: {
          review: 'yes',
        },
        actionCount: 1,
      }),
    ).toBe(false)
  })

  it('allows document metadata to carry host extension data', () => {
    const metadata = {
      name: 'Host graph',
      supportTier: 'guaranteed',
      extensions: {
        hostProjectId: 'demo-123',
        featureFlags: ['beta-runtime'],
      },
    }

    expect(metadata.extensions).toMatchObject({
      hostProjectId: 'demo-123',
    })
  })
})
