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
        name: 'Abad El Rahman',
        short_name: 'AbadElRahman',
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
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-aspect-ratio', '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-collapsible', '@radix-ui/react-context-menu', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-hover-card', '@radix-ui/react-label', '@radix-ui/react-menubar', '@radix-ui/react-navigation-menu', '@radix-ui/react-popover', '@radix-ui/react-progress', '@radix-ui/react-radio-group', '@radix-ui/react-scroll-area', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-slider', '@radix-ui/react-slot', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-toggle', '@radix-ui/react-toggle-group', '@radix-ui/react-tooltip', 'class-variance-authority', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
}));
