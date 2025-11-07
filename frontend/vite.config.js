import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE || 'http://localhost:5050',
        changeOrigin: true,
        // On error, attempt fallback to 5000
        configure: (proxy) => {
          proxy.on('error', (err, _req, _res) => {
            if (process.env.VITE_API_BASE) return
            console.warn('[proxy] primary 5050 failed, trying 5000...')
            proxy.options.target = 'http://localhost:5000'
          })
        }
      }
    },
  },
})
