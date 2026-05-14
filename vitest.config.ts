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
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
    exclude: ['node_modules', 'dist', 'tests/e2e/**', 'legacy/**'],
  },
});
