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
  },
});
