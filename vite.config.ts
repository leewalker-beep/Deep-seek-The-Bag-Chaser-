import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      filename: 'bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        "name": "Bag Chaser",
        "short_name": "BagChaser",
        "description": "Escape the mud. Build the empire. Don't lose your soul.",
        "start_url": "/",
        "display": "standalone",
        "theme_color": "#0f0f0f",
        "background_color": "#0f0f0f",
        "icons": [
          {
            "src": "/favicon.svg",
            "sizes": "any",
            "type": "image/svg+xml"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.vercel\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bag-chaser-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('zustand')) {
              return 'zustand';
            }
            return 'vendor';
          }
        }
      }
    },
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    fs: {
      strict: false
    }
  }
})
