import { spawn } from 'node:child_process'

const servers = [
  {
    command: 'pnpm',
    args: ['serve:web-component'],
    url: 'http://127.0.0.1:44173',
  },
  {
    command: 'pnpm',
    args: ['serve:performance-lab'],
    url: 'http://127.0.0.1:44175',
  },
  {
    command: 'pnpm',
    args: ['serve:react'],
    url: 'http://127.0.0.1:44174',
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

  await runPlaywright()
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

function runPlaywright() {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'playwright', 'test'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PLAYWRIGHT_MANUAL_SERVERS: '1',
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
