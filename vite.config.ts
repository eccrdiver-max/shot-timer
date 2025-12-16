// FIX: To resolve issues with vitest type definitions, the reference directive is removed and `defineConfig` is imported from `vitest/config`.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This explicitly tells Vite to use the 'public' directory for static assets
  // and to output the final build into the 'dist' directory. This standard
  // configuration is crucial for ensuring all necessary files like manifest.json,
  // sw.js, and icons are included in the final deployment package.
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});