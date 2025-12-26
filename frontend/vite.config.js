import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
    },
    allowedHosts: [
      'atlas.local',
      'atlas.ludwig-emmanuel.dev',
      'localhost',
      '10.20.0.21'
    ],
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true
      }
    }
  }
})
