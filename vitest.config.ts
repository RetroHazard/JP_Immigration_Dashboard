import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // scripts/ as well as src/, so build- and CI-side logic can be tested beside
    // its subject instead of reaching back into scripts/ from a src/ test.
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{ts,mts,mjs}'],
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
