import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to all network interfaces
    port: 5173, // Specify the port explicitly
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
