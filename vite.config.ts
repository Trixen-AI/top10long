import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// The dashboard is a React Router app under /app/. Deep links such as /app/portfolio must
// load app/index.html (not the landing page) in dev and preview; vercel.json does the same in production.
function dashboardFallback(): Plugin {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    const url = req.url ?? ''
    const path = url.split('?')[0]
    if (path.startsWith('/app') && !path.includes('.') && path !== '/app/index.html') req.url = '/app/index.html'
    next()
  }
  return {
    name: 'dashboard-fallback',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), dashboardFallback()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // Three entries: the landing page, /docs/ and the /app/ dashboard.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        docs: fileURLToPath(new URL('./docs/index.html', import.meta.url)),
        app: fileURLToPath(new URL('./app/index.html', import.meta.url)),
      },
    },
  },
})
