import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Genuíno Investments',
        short_name: 'Genuíno',
        description: 'Investimentos imobiliários de luxo em Portugal e Suíça',
        theme_color: '#2C3E50',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['business', 'lifestyle', 'real estate'],
        lang: 'pt-PT',
        dir: 'ltr'
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/eyvfrocuuhxleroghybv\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React e React Router
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          
          // Radix UI (componentes UI)
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          
          // Bibliotecas pesadas de gráficos/dados
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/react-big-calendar')) {
            return 'charts-vendor';
          }
          
          // Editor de texto rico
          if (id.includes('node_modules/react-quill') || 
              id.includes('node_modules/quill')) {
            return 'editor-vendor';
          }
          
          // Supabase e queries
          if (id.includes('node_modules/@supabase') || 
              id.includes('node_modules/@tanstack/react-query')) {
            return 'data-vendor';
          }
          
          // Páginas admin em chunk separado
          if (id.includes('src/pages/admin')) {
            return 'admin-pages';
          }
          
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-vendor';
          }
          
          // Utilities
          if (id.includes('node_modules/papaparse') || 
              id.includes('node_modules/zod')) {
            return 'utils-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: mode === 'production' ? 'esbuild' : false,
  },
}));
