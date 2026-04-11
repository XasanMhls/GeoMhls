import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Include push handler in the generated service worker
        importScripts: ['/sw-push.js'],
      },
      manifest: {
        name: 'GeoMhls',
        short_name: 'GeoMhls',
        description: 'Stay connected with your people, wherever they are',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mapbox: ['maplibre-gl'],
          emoji: ['@emoji-mart/data', '@emoji-mart/react'],
          motion: ['framer-motion'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@geomhls/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://localhost:5000',
      '/socket.io': {
        target: process.env.VITE_SOCKET_URL || 'http://localhost:5000',
        ws: true,
      },
    },
  },
});
