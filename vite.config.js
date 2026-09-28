import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ollama': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
        configure: (proxy) => {
          proxy.on('error', () => {
            // Silently suppress ECONNREFUSED when Ollama is offline
          });
        }
      }
    }
  }
})
