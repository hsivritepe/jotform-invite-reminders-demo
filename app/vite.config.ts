import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The @jf/design-system package is consumed straight from TS/SCSS source.
// Alias it so Vite transpiles it as part of this app's build.
const dsSrc = fileURLToPath(
  new URL('../packages/design-system/src', import.meta.url),
)

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const pagesBase =
  process.env.GITHUB_ACTIONS === 'true' && repositoryName && !repositoryName.endsWith('.github.io')
    ? `/${repositoryName}/`
    : '/'

// https://vite.dev/config/
export default defineConfig({
  base: pagesBase,
  plugins: [react()],
  resolve: {
    alias: [
      // Order matters: the more specific entry must come first.
      {
        find: '@jf/design-system/styles',
        replacement: `${dsSrc}/styles/app.scss`,
      },
      { find: '@jf/design-system', replacement: dsSrc },
    ],
  },
})
