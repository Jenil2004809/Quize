import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        app: 'index.html'
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          pdf: ['jspdf'],
          canvas: ['html2canvas'],
          spreadsheets: ['xlsx'],
          ui: ['framer-motion', 'sweetalert2', 'react-toastify', 'react-icons']
        }
      }
    }
  }
})
