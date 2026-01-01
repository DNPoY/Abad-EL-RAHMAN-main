/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath, URL } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Ibad Al-Rahman',
        short_name: 'IbadAlRahman',
        description: 'Your daily Muslim companion for prayers, azkar, and qibla.',
        theme_color: '#047857',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: '/icons/icon-512.webp',
            sizes: '512x512',
            type: 'image/webp'
          },
          {
            src: '/icons/icon-512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: "Prayer Times",
            short_name: "Prayers",
            description: "View Prayer Times",
            url: "/?tab=prayers",
            icons: [{ src: "/icons/icon-192.webp", sizes: "192x192", type: "image/webp" }]
          },
          {
            name: "Qibla Compass",
            short_name: "Qibla",
            description: "Find Qibla Direction",
            url: "/?tab=qibla",
            icons: [{ src: "/icons/icon-192.webp", sizes: "192x192", type: "image/webp" }]
          },
          {
            name: "Holy Quran",
            short_name: "Quran",
            description: "Read Quran",
            url: "/quran",
            icons: [{ src: "/icons/icon-192.webp", sizes: "192x192", type: "image/webp" }]
          },
          {
            name: "Azkar",
            short_name: "Azkar",
            description: "Daily Azkar",
            url: "/?tab=azkar",
            icons: [{ src: "/icons/icon-192.webp", sizes: "192x192", type: "image/webp" }]
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://admin.mokhtasr.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split Quran JSON files into separate chunks
          if (id.includes('quran-uthmani.json')) {
            return 'quran-uthmani';
          }
          if (id.includes('quran-warsh.json')) {
            return 'quran-warsh';
          }
          if (id.includes('quran-simple-clean.json')) {
            return 'quran-simple-clean';
          }

          // Split vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') ||
              id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
          }
        },
      },
    },
  },
}));
