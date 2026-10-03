import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://love-you-sally.vercel.app',
        changeOrigin: true,
        secure: true,
      },
      '/storage': {
        target: 'https://love-you-sally.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

