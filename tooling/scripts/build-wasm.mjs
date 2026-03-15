import { spawnSync } from 'node:child_process'
import path from 'node:path'

const crateDir = path.resolve('packages/workflow-wasm-core/rust')
const result = spawnSync(
  'wasm-pack',
  ['build', '--target', 'bundler', '--out-dir', '../pkg', '--out-name', 'index'],
  {
    cwd: crateDir,
    stdio: 'inherit',
  },
)

if (result.error && result.error.code === 'ENOENT') {
  console.error('wasm-pack is not installed.')
  console.error('Install it with: cargo install wasm-pack')
  process.exit(1)
}

process.exit(result.status ?? 1)
