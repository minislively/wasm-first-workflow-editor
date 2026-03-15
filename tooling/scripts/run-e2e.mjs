import { spawn } from 'node:child_process'
import net from 'node:net'
const ports = {
  webComponent: await getFreePort(),
  react: await getFreePort(),
  performanceLab: await getFreePort(),
}

const servers = [
  {
    command: 'pnpm',
    args: ['--filter', 'demo-web-component', 'exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(ports.webComponent)],
    url: `http://127.0.0.1:${ports.webComponent}`,
  },
  {
    command: 'pnpm',
    args: ['--filter', 'performance-lab', 'exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(ports.performanceLab)],
    url: `http://127.0.0.1:${ports.performanceLab}`,
  },
  {
    command: 'pnpm',
    args: ['--filter', 'demo-react-host', 'exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(ports.react)],
    url: `http://127.0.0.1:${ports.react}`,
  },
]

const children = []

try {
  for (const server of servers) {
    const child = spawn(server.command, server.args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
    child.stdout.on('data', (chunk) => process.stdout.write(chunk))
    child.stderr.on('data', (chunk) => process.stderr.write(chunk))
    children.push(child)
  }

  await Promise.all(servers.map((server) => waitForHttp(server.url)))

  await runPlaywright(ports)
} finally {
  await Promise.all(children.map(stopChild))
}

async function waitForHttp(url) {
  const deadline = Date.now() + 120000

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // server still starting
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`Timed out waiting for ${url}`)
}

function runPlaywright(ports) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'playwright', 'test'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PLAYWRIGHT_MANUAL_SERVERS: '1',
        PLAYWRIGHT_WEB_COMPONENT_BASE_URL: `http://127.0.0.1:${ports.webComponent}`,
        PLAYWRIGHT_REACT_BASE_URL: `http://127.0.0.1:${ports.react}`,
        PLAYWRIGHT_PERFORMANCE_LAB_BASE_URL: `http://127.0.0.1:${ports.performanceLab}`,
      },
    })
    child.stdout.on('data', (chunk) => process.stdout.write(chunk))
    child.stderr.on('data', (chunk) => process.stderr.write(chunk))

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`Playwright exited with code ${code}`))
    })
  })
}

function stopChild(child) {
  return new Promise((resolve) => {
    if (child.killed || child.exitCode !== null) {
      resolve()
      return
    }

    child.once('exit', () => resolve())
    child.kill('SIGTERM')
    setTimeout(() => {
      if (child.exitCode === null) {
        child.kill('SIGKILL')
      }
    }, 3000)
  })
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        server.close()
        reject(new Error('Failed to allocate a free port'))
        return
      }
      const { port } = address
      server.close(() => resolve(port))
    })
    server.on('error', reject)
  })
}
