import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cpSync, existsSync, rmSync } from 'node:fs'

import { defineConfig, type Plugin } from 'vite'

const rootDir = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))

export default defineConfig({
  plugins: [copyOptionalWasmPkgPlugin(rootDir)],
  resolve: {
    alias: [
      {
        find: /^@minislively\/(.+)$/,
        replacement: path.resolve(rootDir, 'packages/$1/src'),
      },
    ],
  },
})

function copyOptionalWasmPkgPlugin(rootDir: string): Plugin {
  let resolvedRoot = ''
  let resolvedOutDir = 'dist'

  return {
    name: 'copy-optional-wasm-pkg',
    apply: 'build',
    configResolved(config) {
      resolvedRoot = config.root
      resolvedOutDir = config.build.outDir
    },
    closeBundle() {
      const sourceDir = path.resolve(rootDir, 'packages/workflow-wasm-core/pkg')

      if (!existsSync(sourceDir)) {
        return
      }

      const targetDir = path.resolve(resolvedRoot, resolvedOutDir, 'pkg')
      rmSync(targetDir, { recursive: true, force: true })
      cpSync(sourceDir, targetDir, { recursive: true })
    },
  }
}
