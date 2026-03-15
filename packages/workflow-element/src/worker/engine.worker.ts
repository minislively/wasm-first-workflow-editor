import { EngineController } from '@minislively/workflow-engine-worker'
import type { EngineCommand, EngineEvent } from '@minislively/workflow-types'

let controller: EngineController | undefined

self.onmessage = (message: MessageEvent<EngineCommand>) => {
  if (message.data.type === 'init' && message.data.canvas) {
    controller = new EngineController(
      message.data.canvas,
      emitEvent,
      message.data.theme,
    )
  }

  controller?.handle(message.data)
}

function emitEvent(event: EngineEvent) {
  self.postMessage(event)
}
