import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // Load env file based on current mode
  const env = loadEnv(mode, process.cwd(), '')

  // Use BASE_URL from env or default
  // For GitHub Pages: set VITE_BASE_URL=/bhumi-shop/ in production
  // For localhost: leave unset or set to /
  const base = env.VITE_BASE_URL || '/'

  return {
    base,
    plugins: [vue(), tailwindcss()],
    server: {
      allowedHosts: ['propeller-demise-shakiness.ngrok-free.dev'],
      // SPA fallback for dev server - all routes serve index.html
      historyApiFallback: true
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'i18n-vendor': ['vue-i18n'],
            'animation-vendor': ['gsap', 'motion-v'],
            '3d-vendor': ['three', 'ogl', 'postprocessing']
          }
        }
      },
      // Enable source maps for debugging (disable in production if not needed)
      sourcemap: false,
      // Minify with terser for better compression
      minify: 'esbuild',
      // Asset size limit warning (500KB)
      chunkSizeWarningLimit: 500
    }
  }
})
