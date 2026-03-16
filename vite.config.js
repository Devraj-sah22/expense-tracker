import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/, // This tells esbuild to treat .js files as .jsx
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx', // This tells esbuild to load .js files as JSX
      },
    },
  },
})