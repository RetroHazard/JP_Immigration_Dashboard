import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // scripts/ too, so build and CI logic is tested beside its subject.
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{ts,mts,mjs}'],
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
