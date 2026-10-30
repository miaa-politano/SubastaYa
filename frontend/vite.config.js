import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '^/api/auctions/\\d+/bids': {
        target: 'http://localhost:5273',
        changeOrigin: true,
        secure: false
      },
      '/hubs': {
        target: 'http://localhost:5273',
        changeOrigin: true,
        ws: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});