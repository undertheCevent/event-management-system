import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5266',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5266',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Target modern browsers — avoids legacy-JS transforms that inflate bundle size
    target: 'es2020',
    rollupOptions: {
      output: {
        // Split vendors into stable, independently-cacheable chunks.
        // Heavy deps (recharts, @zxing, amplify) only download when their
        // route is first visited thanks to route-level lazy loading.
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // Charts — heavy, only loaded on Dashboard / Insights pages
          if (id.includes('recharts') || id.match(/\/d3-/)) return 'vendor-charts'

          // QR scanner — heavy, only loaded on Check-in page
          if (id.includes('@zxing') || id.includes('qrcode.react')) return 'vendor-qr'

          // All other node_modules share one stable chunk for optimal
          // cache reuse across deploys.  Grouping everything together
          // avoids circular-chunk warnings from tightly-coupled packages
          // (aws-amplify ↔ react-dom ↔ react-router internals, etc.).
          return 'vendor'
        },
      },
    },
  },
})
