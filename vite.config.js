import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api calls go to the Stratos web server (npm run server)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': `http://localhost:${process.env.API_PORT || 8787}`
    }
  }
})
