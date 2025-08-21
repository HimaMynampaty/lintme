import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

import monacoPkg from 'vite-plugin-monaco-editor';
const monacoEditorPlugin = monacoPkg.default || monacoPkg;

export default defineConfig({
  plugins: [
    svelte(),
    monacoEditorPlugin({
      languages: ['yaml', 'markdown'],
    }),
  ],

  server: { port: 5173 },

  resolve: {
    alias: {
      path: 'path-browserify',
      process: 'process/browser',
    },
  },

  define: {
    'process.env': {},
  },

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
