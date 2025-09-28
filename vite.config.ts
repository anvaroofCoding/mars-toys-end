import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  publicDir: 'public',
  server: {
    host: true,
    port: 5173,
    cors: true,
    allowedHosts: [
      'localhost',
      'frontend-production-1d06.up.railway.app',
      'toysmars.uz',
      'www.toysmars.uz'
    ]
  },
   build: {
    // chunk size warning limitni oshirish (masalan 4000 KB)
    chunkSizeWarningLimit: 4000
  }
})
