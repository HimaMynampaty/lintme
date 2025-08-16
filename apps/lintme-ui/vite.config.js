// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monaco from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    svelte(),
    monaco({ languages: ['yaml', 'markdown'] }),
  ],

  server: { port: 5173 },

  resolve: {
    alias: {
      path: 'path-browserify',
      process: 'process/browser',
    },
  },

  // keep only what you truly need here
  define: {
    'process.env': {},
  },

  // put the global shim ONLY in esbuild prebundle so it doesn't touch your source
  optimizeDeps: {
    include: ['monaco-editor', 'monaco-yaml', 'path-browserify'],
    exclude: ['dictionary-en'],
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  },

  worker: { format: 'es' },
  build: { target: 'esnext' },
});
