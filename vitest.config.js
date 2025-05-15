// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/tests/**/*.spec.js'],
    coverage: { reporter: ['text', 'html'] },
  }
});
