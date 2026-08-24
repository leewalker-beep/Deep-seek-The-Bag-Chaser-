import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/**', // Exclude Playwright tests in root tests/ folder
      '**/*.spec.ts', // Exclude Playwright spec files
    ],
    globals: true,
  },
});
