import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'legacy/',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        'src/main.tsx',
      ],
      // Coverage gates per spec §10. Global floor is 70% (hard).
      // src/domain/** is the correctness core (mapping math, scoring,
      // filters, search) — gated at 100% on lines/functions/statements
      // and 95% on branches (v8 occasionally undercounts branches on
      // empty-array .map() callbacks, hence the small allowance).
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
        'src/domain/**': {
          lines: 100,
          branches: 95,
          functions: 100,
          statements: 100,
        },
        'src/services/**': {
          lines: 80,
          branches: 80,
          functions: 80,
          statements: 80,
        },
        'src/store/**': {
          lines: 80,
          branches: 80,
          functions: 80,
          statements: 80,
        },
      },
    },
    exclude: ['node_modules', 'dist', 'tests/e2e/**', 'legacy/**'],
  },
});
