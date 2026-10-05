import react from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';

export default defineConfig({
  fmt: {
    singleQuote: true,
    ignorePatterns: [
      'dist/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
      'workshop-artifacts/**',
      'public/mockServiceWorker.js',
      'package-lock.json',
    ],
  },
  lint: {
    categories: { correctness: 'error' },
    plugins: ['typescript', 'react', 'jsx-a11y', 'unicorn', 'oxc'],
    ignorePatterns: [
      'dist/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
      'workshop-artifacts/**',
      'public/mockServiceWorker.js',
    ],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'typescript/no-floating-promises': 'error',
      'react/rules-of-hooks': 'error',
      // A loading live region uses role=status; output represents a form/calculation result.
      'jsx-a11y/prefer-tag-over-role': 'off',
    },
    options: { typeAware: true, typeCheck: true },
  },
  plugins: lazyPlugins(() => [react()]),
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    restoreMocks: true,
  },
  run: {
    tasks: {
      'oxc:parse': { command: 'node scripts/oxc-lab.mjs parse', cache: false },
      'oxc:resolve': { command: 'node scripts/oxc-lab.mjs resolve', cache: false },
      'oxc:transform': { command: 'node scripts/oxc-lab.mjs transform', cache: false },
      'oxc:minify': {
        command: 'node scripts/oxc-lab.mjs minify',
        dependsOn: ['oxc:transform'],
        cache: false,
      },
      'oxc:all': {
        command: 'node scripts/oxc-lab.mjs summary',
        dependsOn: ['oxc:parse', 'oxc:resolve', 'oxc:minify'],
        cache: false,
      },
    },
  },
});
