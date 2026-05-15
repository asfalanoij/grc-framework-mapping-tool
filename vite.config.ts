import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages base path. Production builds are served from
// https://asfalanoij.github.io/grc-framework-mapping-tool/
// Local dev (`npm run dev`) uses '/'.
const base = process.env.NODE_ENV === 'production' ? '/grc-framework-mapping-tool/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
    // Hoist framework data + lib code into shared chunks so the heavy
    // JSON datasets aren't duplicated across lazy-loaded views.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/_raw/') || id.includes('src/data/frameworks/')) {
            return 'framework-data';
          }
          if (id.includes('node_modules/dexie')) {
            return 'vendor-dexie';
          }
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          if (id.includes('node_modules/zod')) {
            return 'vendor-zod';
          }
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
