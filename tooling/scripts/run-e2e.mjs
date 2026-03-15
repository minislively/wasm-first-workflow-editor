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
      stdio: 'inherit',
      env: process.env,
      shell: true,
    })
    children.push(child)
  }

  await Promise.all(servers.map((server) => waitForHttp(server.url)))

  await runPlaywright()
} finally {
  for (const child of children) {
    child.kill('SIGTERM')
  }
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
      stdio: 'inherit',
      env: {
        ...process.env,
        PLAYWRIGHT_MANUAL_SERVERS: '1',
      },
      shell: true,
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`Playwright exited with code ${code}`))
    })
  })
}
