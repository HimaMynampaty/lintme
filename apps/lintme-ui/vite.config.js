import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monacoPkg from 'vite-plugin-monaco-editor';

const monacoEditorPlugin = monacoPkg.default;

export default defineConfig({
  root: './',
  plugins: [
    svelte(),
    monacoEditorPlugin({
      languages: ['yaml', 'markdown']
    })
  ],
  server: {
    port: 5173
  },
  define: {
    "process.env": {},
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['dictionary-en']
  }
});
