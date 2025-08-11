import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: { port: 5173 },

  resolve: {
    alias: {
      path: 'path-browserify',
      process: 'process/browser'
    }
  },

  define: {
    // various libs read process.env in browser
    'process.env': {},
    // CRITICAL: use globalThis so it also works inside Web Workers
    global: 'globalThis'
  },

  worker: { format: 'es' },      // ensure ES-module workers
  build: { target: 'esnext' },

  optimizeDeps: {
    include: ['monaco-editor', 'monaco-yaml', 'path-browserify'],
    exclude: ['dictionary-en']
  }
});
