import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

var HOST = '' || 'localhost';

export default defineConfig({
  plugins: [react()],
  server: {
    host: HOST,
    port: 5173, // Vite dev server port
    proxy: {
      '/api': {
        target: `http://${HOST}:3000`, // URL for your Express backend
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
