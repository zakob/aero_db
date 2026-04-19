import { defineConfig, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin for request logging
function requestLoggingPlugin() {
  return {
    name: 'request-logging',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const start = Date.now()
        const { method, url } = req
        
        res.on('finish', () => {
          const duration = Date.now() - start
          const { statusCode } = res
          console.log(`[Vite] ${method} ${url} ${statusCode} ${duration}ms`)
        })
        
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), requestLoggingPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})