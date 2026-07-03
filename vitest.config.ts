import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/**', // Exclude Playwright tests in root tests/ folder
    ],
    globals: true,
  },
});
