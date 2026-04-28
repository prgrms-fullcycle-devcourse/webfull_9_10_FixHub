import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr({ include: '**/*.svg' })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
