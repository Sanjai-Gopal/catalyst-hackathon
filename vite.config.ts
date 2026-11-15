/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { playwright } from '@vitest/browser-playwright'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['appwrite', 'cobe', 'canvas-confetti'],
  },
  test: {
    silent: 'passed-only',
    unstubEnvs: true,
    coverage: {
      include: ['src/lib/carenest-logic.ts', 'src/services/**/*.ts'],
      exclude: [
        'src/components/ui/**',
        'src/routeTree.gen.ts',
        'src/test-utils/**',
      ],
    },
    projects: [
      {
        // Pure-logic tests: run in Node, no browser needed (works in any CI/sandbox).
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.unit.test.ts'],
        },
      },
      {
        // Component tests: run in real headless Chromium via Playwright.
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.unit.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
