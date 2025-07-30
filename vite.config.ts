import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'Bible Study Plan App',
        short_name: 'Bible Study',
        description: 'A comprehensive Bible study planning and reading application',
        theme_color: '#FFD700',
        background_color: '#000000',
        display: 'standalone',
        scope: './',
        start_url: './',
        orientation: 'portrait',
        categories: ['education', 'books', 'reference'],
        icons: [
          {
            src: './pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: './pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: './pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        sourcemap: false,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/bible-reader-alpha\.vercel\.app\/api\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bible-api-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  // Ensure API files are included in the build
  publicDir: 'public',
  build: {
    // Copy API folder to dist
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    assetsDir: 'assets',
    outDir: 'dist',
    // Ensure all assets are included
    copyPublicDir: true
  },
  // Development server configuration
  server: {
    fs: {
      allow: ['..']
    }
  },
  // Preview server configuration (for testing production build locally)
  preview: {
    port: 4173,
    host: true
  },
  experimental: {
    renderBuiltUrl(filename: string) {
      return filename.startsWith('/') ? filename.slice(1) : filename;
    }
  }
})
