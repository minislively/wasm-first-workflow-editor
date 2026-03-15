import { defineWorkflowEditor } from '@minislively/workflow-element'
import type {
  GraphDocument,
  ThemeTokens,
  WorkflowEditorOptions,
} from '@minislively/workflow-types'
import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
} from 'react'

type WorkflowEditorElementHandle = HTMLElement & {
  graph?: GraphDocument
  theme?: Partial<ThemeTokens>
}

export type WorkflowEditorProps = Pick<WorkflowEditorOptions, 'graph' | 'theme'> & {
  className?: string
  style?: CSSProperties
}

export function WorkflowEditor({
  graph,
  theme,
  className,
  style,
}: WorkflowEditorProps) {
  const elementRef = useRef<WorkflowEditorElementHandle | null>(null)

  useEffect(() => {
    defineWorkflowEditor()
  }, [])

  useLayoutEffect(() => {
    if (!elementRef.current) {
      return
    }

    elementRef.current.graph = graph
    elementRef.current.theme = theme
  }, [graph, theme])

  return createElement('workflow-editor', {
    ref: elementRef,
    className,
    style,
  })
}
