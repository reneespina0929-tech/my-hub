// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'], // Tell Vite to include your svg
      manifest: {
        name: 'Meow Mart Hub',
        short_name: 'MyHub',
        description: 'IT Project Suite for 2BSIT-5',
        theme_color: '#4E342E',
        background_color: '#E0FFF0',
        display: 'standalone', // <--- THIS is what removes the address bar
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable' // Makes it look good on Android/iOS
          }
        ]
      }
    })
  ],
  base: '/my-hub/', 
})