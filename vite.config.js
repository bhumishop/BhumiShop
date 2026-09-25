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
          // Split per library, not per "domain". Bundling ogl together with
          // three/postprocessing meant the entry graph (App -> AppFooter ->
          // DarkVeil, which imports ogl) had to download the whole 600 kB
          // 3D chunk on first paint, even though three.js is only used by the
          // lazily-imported GridScan/CircularGallery. Same story for motion-v,
          // which is only used by the Auth route stepper.
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // Only direct dependencies here: Rollup resolves these names as
            // entry modules, and transitive packages (e.g. @vueuse/shared) are
            // not hoisted to the top level of node_modules under pnpm, which
            // fails the CI build.
            'vueuse-vendor': ['@vueuse/core'],
            'i18n-vendor': ['vue-i18n'],
            'gsap-vendor': ['gsap'],
            'motion-vendor': ['motion-v'],
            'ogl-vendor': ['ogl'],
            'three-vendor': ['three', 'postprocessing'],
            'supabase-vendor': ['@supabase/supabase-js']
          }
        }
      },
      // Enable source maps for debugging (disable in production if not needed)
      sourcemap: false,
      // Minify with esbuild for speed (set to 'terser' if raw byte size wins)
      minify: 'esbuild'
    }
  }
})
