import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['67d31b9e.r3.cpolar.top'],
    hmr: false,
    cors: false,
    strictPort: true
  },
  define: {
    'import.meta.env.DEV': JSON.stringify(false)
  }
})
