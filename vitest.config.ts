import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  // `sanity` pulls vite 8 into the dependency tree while vitest types against
  // vite 7; the React plugin is runtime-compatible across both, so bridge the
  // duplicated Plugin types here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
