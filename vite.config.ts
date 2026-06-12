import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const config = {
  base: '/family-world-cup/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
};

export default defineConfig(config);
