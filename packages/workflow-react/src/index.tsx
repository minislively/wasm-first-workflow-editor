import { defineWorkflowEditor } from '@minislively/workflow-element'
import type {
  GraphDocument,
  RuntimePreferences,
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
  preferences?: Partial<RuntimePreferences>
}

export type WorkflowEditorProps = Pick<WorkflowEditorOptions, 'graph' | 'theme' | 'preferences'> & {
  className?: string
  style?: CSSProperties
}

export function WorkflowEditor({
  graph,
  theme,
  preferences,
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
    elementRef.current.preferences = preferences
  }, [graph, theme, preferences])

  return createElement('workflow-editor', {
    ref: elementRef,
    className,
    style,
  })
}
