import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import { piaMarkdown } from './plugins/markdown.ts'

const root = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  // relative base: dist/ works from any sub-path (GitHub Pages, S3 folder...); routes are hash-based
  base: './',
  plugins: [
    piaMarkdown({ contentDir: path.join(root, 'content') }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
