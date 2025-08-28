/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  base: '', // Required for mobile builds
  plugins: [
    react(),
    legacy(),
  ],
  optimizeDeps: {
    include: ['aos'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://aiyohealth-production-9439.up.railway.app/',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    hmr: {
      port: 24678,
      host: 'localhost'
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist', // Output folder for Capacitor's webDir
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});