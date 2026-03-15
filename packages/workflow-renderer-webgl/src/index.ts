import type {
  CanvasSize,
  SceneSnapshot,
  ThemeTokens,
} from '@minislively/workflow-types'

type WebGlRenderer = {
  backend: 'webgl'
  resize: (size: CanvasSize) => void
  render: (scene: SceneSnapshot) => void
  dispose: () => void
}

export function createWebGlRenderer(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  theme: ThemeTokens,
): WebGlRenderer | null {
  const context = canvas.getContext('webgl') as WebGLRenderingContext | null

  if (!context) {
    return null
  }

  const program = createProgram(context)
  const positionLocation = context.getAttribLocation(program, 'a_position')
  const colorLocation = context.getAttribLocation(program, 'a_color')
  const resolutionLocation = context.getUniformLocation(program, 'u_resolution')
  const positionBuffer = context.createBuffer()
  const colorBuffer = context.createBuffer()

  if (!resolutionLocation || !positionBuffer || !colorBuffer) {
    return null
  }

  const resize = (size: CanvasSize) => {
    canvas.width = Math.max(1, Math.floor(size.width * size.dpr))
    canvas.height = Math.max(1, Math.floor(size.height * size.dpr))
    context.viewport(0, 0, canvas.width, canvas.height)
  }

  const render = (scene: SceneSnapshot) => {
    const { graph, viewport, selectionIds } = scene
    const width = canvas.width
    const height = canvas.height

    context.clearColor(...hexToRgba(theme.canvasBg))
    context.clear(context.COLOR_BUFFER_BIT)
    context.useProgram(program)
    context.uniform2f(resolutionLocation, width, height)

    const edgeVertices: number[] = []
    const edgeColors: number[] = []
    const edgeColor = hexToRgba(theme.edge)

    graph.edges.forEach((edge) => {
      const source = graph.nodes.find((node) => node.id === edge.source)
      const target = graph.nodes.find((node) => node.id === edge.target)

      if (!source || !target) {
        return
      }

      const sourceX =
        (source.position.x + source.size.width - viewport.x) * viewport.zoom
      const sourceY =
        (source.position.y + source.size.height / 2 - viewport.y) *
        viewport.zoom
      const targetX = (target.position.x - viewport.x) * viewport.zoom
      const targetY =
        (target.position.y + target.size.height / 2 - viewport.y) *
        viewport.zoom

      edgeVertices.push(
        sourceX,
        sourceY,
        targetX,
        targetY,
      )
      edgeColors.push(...edgeColor, ...edgeColor)
    })

    bindGeometry(
      context,
      positionBuffer,
      colorBuffer,
      positionLocation,
      colorLocation,
      edgeVertices,
      edgeColors,
    )
    context.drawArrays(context.LINES, 0, edgeVertices.length / 2)

    const nodeVertices: number[] = []
    const nodeColors: number[] = []

    graph.nodes.forEach((node) => {
      const fill = hexToRgba(
        selectionIds.includes(node.id) ? theme.nodeSelected : node.color,
      )
      const x = (node.position.x - viewport.x) * viewport.zoom
      const y = (node.position.y - viewport.y) * viewport.zoom
      const widthScaled = node.size.width * viewport.zoom
      const heightScaled = node.size.height * viewport.zoom

      pushRect(nodeVertices, x, y, widthScaled, heightScaled)
      for (let index = 0; index < 6; index += 1) {
        nodeColors.push(...fill)
      }
    })

    bindGeometry(
      context,
      positionBuffer,
      colorBuffer,
      positionLocation,
      colorLocation,
      nodeVertices,
      nodeColors,
    )
    context.drawArrays(context.TRIANGLES, 0, nodeVertices.length / 2)
  }

  return {
    backend: 'webgl',
    resize,
    render,
    dispose: () => {
      context.deleteBuffer(positionBuffer)
      context.deleteBuffer(colorBuffer)
      context.deleteProgram(program)
    },
  }
}

function createProgram(context: WebGLRenderingContext) {
  const vertexShader = context.createShader(context.VERTEX_SHADER)
  const fragmentShader = context.createShader(context.FRAGMENT_SHADER)

  if (!vertexShader || !fragmentShader) {
    throw new Error('Unable to create shaders.')
  }

  context.shaderSource(
    vertexShader,
    `
      attribute vec2 a_position;
      attribute vec4 a_color;
      uniform vec2 u_resolution;
      varying vec4 v_color;

      void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clip = zeroToTwo - 1.0;
        gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
        v_color = a_color;
      }
    `,
  )
  context.compileShader(vertexShader)

  context.shaderSource(
    fragmentShader,
    `
      precision mediump float;
      varying vec4 v_color;

      void main() {
        gl_FragColor = v_color;
      }
    `,
  )
  context.compileShader(fragmentShader)

  const program = context.createProgram()

  if (!program) {
    throw new Error('Unable to create shader program.')
  }

  context.attachShader(program, vertexShader)
  context.attachShader(program, fragmentShader)
  context.linkProgram(program)

  return program
}

function bindGeometry(
  context: WebGLRenderingContext,
  positionBuffer: WebGLBuffer,
  colorBuffer: WebGLBuffer,
  positionLocation: number,
  colorLocation: number,
  positions: number[],
  colors: number[],
) {
  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer)
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(positions),
    context.DYNAMIC_DRAW,
  )
  context.enableVertexAttribArray(positionLocation)
  context.vertexAttribPointer(positionLocation, 2, context.FLOAT, false, 0, 0)

  context.bindBuffer(context.ARRAY_BUFFER, colorBuffer)
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(colors),
    context.DYNAMIC_DRAW,
  )
  context.enableVertexAttribArray(colorLocation)
  context.vertexAttribPointer(colorLocation, 4, context.FLOAT, false, 0, 0)
}

function pushRect(
  positions: number[],
  x: number,
  y: number,
  width: number,
  height: number,
) {
  positions.push(
    x,
    y,
    x + width,
    y,
    x,
    y + height,
    x,
    y + height,
    x + width,
    y,
    x + width,
    y + height,
  )
}

function hexToRgba(value: string): [number, number, number, number] {
  const hex = value.replace('#', '')
  const chunk = hex.length === 3 ? hex.split('').map((char) => char + char) : [
    hex.slice(0, 2),
    hex.slice(2, 4),
    hex.slice(4, 6),
  ]

  const [red, green, blue] = chunk.map((item) => Number.parseInt(item, 16) / 255)
  return [red, green, blue, 1]
}
