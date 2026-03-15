import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

const rootDir = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@minislively\/(.+)$/,
        replacement: path.resolve(rootDir, 'packages/$1/src'),
      },
    ],
  },
})
