import type {
  CanvasSize,
  SceneSnapshot,
  ThemeTokens,
} from '@minislively/workflow-types'

export type CanvasRenderer = {
  backend: 'canvas2d'
  resize: (size: CanvasSize) => void
  render: (scene: SceneSnapshot) => void
  dispose: () => void
}

export function createCanvasRenderer(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  theme: ThemeTokens,
): CanvasRenderer {
  const context = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null

  if (!context) {
    throw new Error('Canvas 2D context is unavailable.')
  }

  const resize = (size: CanvasSize) => {
    canvas.width = Math.max(1, Math.floor(size.width * size.dpr))
    canvas.height = Math.max(1, Math.floor(size.height * size.dpr))
    context.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
  }

  const render = (scene: SceneSnapshot) => {
    const { viewport, graph, selectionIds, size } = scene

    context.clearRect(0, 0, size.width, size.height)
    context.fillStyle = theme.canvasBg
    context.fillRect(0, 0, size.width, size.height)

    context.strokeStyle = theme.grid
    context.lineWidth = 1
    const gridStep = 64 * viewport.zoom
    const offsetX = (-viewport.x * viewport.zoom) % gridStep
    const offsetY = (-viewport.y * viewport.zoom) % gridStep

    for (let x = offsetX; x < size.width; x += gridStep) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, size.height)
      context.stroke()
    }

    for (let y = offsetY; y < size.height; y += gridStep) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(size.width, y)
      context.stroke()
    }

    context.save()
    context.translate(-viewport.x * viewport.zoom, -viewport.y * viewport.zoom)
    context.scale(viewport.zoom, viewport.zoom)

    context.strokeStyle = theme.edge
    context.lineWidth = 2 / viewport.zoom
    graph.edges.forEach((edge) => {
      const source = graph.nodes.find((node) => node.id === edge.source)
      const target = graph.nodes.find((node) => node.id === edge.target)

      if (!source || !target) {
        return
      }

      const sourceX = source.position.x + source.size.width
      const sourceY = source.position.y + source.size.height / 2
      const targetX = target.position.x
      const targetY = target.position.y + target.size.height / 2

      context.beginPath()
      context.moveTo(sourceX, sourceY)
      context.bezierCurveTo(
        sourceX + 48,
        sourceY,
        targetX - 48,
        targetY,
        targetX,
        targetY,
      )
      context.stroke()
    })

    graph.nodes.forEach((node) => {
      const selected = selectionIds.includes(node.id)
      context.fillStyle = selected ? theme.nodeSelected : theme.nodeFill
      context.strokeStyle = selected ? theme.accent : theme.nodeStroke
      context.lineWidth = selected ? 3 / viewport.zoom : 1.5 / viewport.zoom
      roundRect(
        context,
        node.position.x,
        node.position.y,
        node.size.width,
        node.size.height,
        18,
      )
      context.fill()
      context.stroke()

      context.fillStyle = node.color
      context.fillRect(node.position.x + 14, node.position.y + 14, 10, 10)

      context.fillStyle = theme.shellText
      context.font = '600 15px "Space Grotesk", system-ui'
      context.fillText(node.title, node.position.x + 32, node.position.y + 24)
      context.fillStyle = theme.shellMuted
      context.font = '500 12px "IBM Plex Sans", system-ui'
      context.fillText(
        node.subtitle ?? node.type,
        node.position.x + 14,
        node.position.y + 46,
      )
    })

    context.restore()
  }

  return {
    backend: 'canvas2d',
    resize,
    render,
    dispose: () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
    },
  }
}

function roundRect(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + width, y, x + width, y + height, radius)
  context.arcTo(x + width, y + height, x, y + height, radius)
  context.arcTo(x, y + height, x, y, radius)
  context.arcTo(x, y, x + width, y, radius)
  context.closePath()
}
