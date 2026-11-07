/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // PostCSS is configured here so the project needs no postcss.config.js
  css: {
    postcss: { plugins: [tailwindcss(), autoprefixer()] },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
