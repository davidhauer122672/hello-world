import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist-renderer',
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      '@engines': resolve(__dirname, 'src/engines'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
