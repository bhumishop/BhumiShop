import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/bhumi-shop/',
  plugins: [vue()],
  server: {
    allowedHosts: ['propeller-demise-shakiness.ngrok-free.dev']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
