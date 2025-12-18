import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // ✅ THÊM: Ignore certificate errors cho localhost
    proxy: {
      '/api': {
        target: 'https://localhost:7202',
        changeOrigin: true,
        secure: false, // ✅ Ignore SSL errors
      }
    }
  }
})

