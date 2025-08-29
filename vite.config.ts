import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
    sourcemap: false,
    minify: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/renderer/components'),
      '@/hooks': path.resolve(__dirname, './src/renderer/hooks'),
      '@/stores': path.resolve(__dirname, './src/renderer/stores'),
      '@/types': path.resolve(__dirname, './src/renderer/types'),
      '@/utils': path.resolve(__dirname, './src/renderer/utils'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    // Optimize for faster development
    watch: {
      usePolling: false,
      interval: 100,
    },
  },
  optimizeDeps: {
    exclude: ['electron'],
    force: true,
    // Pre-bundle dependencies for faster startup
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
  clearScreen: false,
  // Improve development performance
  esbuild: {
    target: 'es2020',
  },
});
