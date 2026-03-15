import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@minislively\/(.+)$/,
        replacement: path.resolve(rootDir, 'packages/$1/src'),
      },
    ],
  },
})
