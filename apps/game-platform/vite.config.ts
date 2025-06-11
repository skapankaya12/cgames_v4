import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, '../../packages/ui-kit'),
      '@svc': path.resolve(__dirname, '../../packages/services'),
      '@types': path.resolve(__dirname, '../../packages/types'),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
    exclude: ['pdfjs-dist/build/pdf.worker.min.js']
  },
  worker: {
    format: 'es'
  },
  server: {
    host: '0.0.0.0', // Expose to all network interfaces
    port: 5174, // Specify the port explicitly (matching package.json dev script)
    strictPort: true, // Don't try another port if this one is taken
    // This will allow all hosts, so we don't need to update for new ngrok URLs
    cors: true, // Enable CORS for all origins
    allowedHosts: [
      'localhost',
      '77b9-176-219-146-87.ngrok-free.app',
      '.ngrok-free.app' // Allow all ngrok-free.app subdomains
    ]
  },
})
