import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the built app opens from a file path or any sub-path.
  base: './',
  plugins: [react()],
});
