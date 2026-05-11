<template>
  <div class="app-root">
    <!-- Preloader -->
    <Preloader />

    <!-- Noise overlay - global subtle texture -->
    <Noise
      :pattern-size="250"
      :pattern-scale-x="1"
      :pattern-scale-y="1"
      :pattern-alpha="5"
    />

    <!-- Click spark effect -->
    <ClickSpark
      spark-color="#8b5cf6"
      :spark-size="10"
      :spark-radius="20"
      :spark-count="10"
      :duration="500"
      easing="ease-out"
      :extra-scale="1.1"
    >
      <div class="app-content-wrapper paper-texture">
        <!-- Velvet texture overlay -->
        <div class="velvet-texture" aria-hidden="true"></div>
        <AppHeader />
        <main class="app-main">
          <router-view v-slot="{ Component, route: currentRoute }">
            <transition name="page" mode="out-in">
              <component :is="Component" :key="currentRoute.path" />
            </transition>
          </router-view>
        </main>
        <AppFooter />
        <CartDrawer v-if="!isCartRoute" />
        <ToastContainer />
        <!-- Mobile language switcher bubble -->
        <LanguageSwitcher bubble />
      </div>
    </ClickSpark>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, computed, defineAsyncComponent, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { refreshScrollTriggers, initGlobalAnimations, revertGlobalAnimations } from './utils/animations'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useCartStore } from './stores/cart'
import { useSEO, routeSEO } from './composables/useSEO'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const router = useRouter()

// Lazy load heavy visual effect components with error handling
const CartDrawer = defineAsyncComponent({
  loader: () => import('./components/layout/CartDrawer.vue'),
  errorComponent: { render: () => null },
  loadingComponent: { render: () => null }
})
const ToastContainer = defineAsyncComponent({
  loader: () => import('./components/common/BaseToast.vue'),
  errorComponent: { render: () => null },
  loadingComponent: { render: () => null }
})
const ClickSpark = defineAsyncComponent({
  loader: () => import('./components/common/ClickSpark.vue'),
  errorComponent: { render: () => null },
  loadingComponent: { render: () => null }
})
const Preloader = defineAsyncComponent({
  loader: () => import('./components/common/Preloader.vue'),
  errorComponent: { render: () => null },
  loadingComponent: { render: () => null }
})
const Noise = defineAsyncComponent({
  loader: () => import('./components/common/Noise.vue'),
  errorComponent: { render: () => null },
  loadingComponent: { render: () => null }
})

const authStore = useAuthStore()
const themeStore = useThemeStore()
const cartStore = useCartStore()
const route = useRoute()
const { updateMetaTags } = useSEO()
const isCartRoute = computed(() => route.name === 'cart')

// Update SEO meta tags on route change
function updateRouteSEO() {
  const routeName = route.name
  const seoConfig = routeSEO[routeName]

  if (seoConfig) {
    updateMetaTags(seoConfig)

    // Add noindex if specified
    if (seoConfig.noindex) {
      const meta = document.querySelector('meta[name="robots"]')
      if (meta) {
        meta.setAttribute('content', 'noindex, nofollow')
      }
    }
  }
}

// Refresh ScrollTrigger and update SEO on every route change
let routeWatchDebounce = null
watch(() => route.path, async (newPath, oldPath) => {
  if (newPath === oldPath) return

  // Close cart drawer on navigation (only if open)
  if (cartStore.isOpen) {
    cartStore.closeDrawer()
  }

  // Debounce: cancel pending refresh to avoid redundant work on fast navigation
  if (routeWatchDebounce) {
    clearTimeout(routeWatchDebounce)
  }

  // Update SEO immediately (lightweight)
  updateRouteSEO()

  // Debounce ScrollTrigger refresh - use shorter delay for snappier navigation
  routeWatchDebounce = setTimeout(async () => {
    // Wait for next tick to ensure the new component has mounted
    await nextTick()

    try {
      revertGlobalAnimations()
      initGlobalAnimations()
      refreshScrollTriggers(100)
    } catch (e) {
      // Silent fail - animations may not be initialized
    }
    routeWatchDebounce = null
  }, 100)
})

onMounted(() => {
  authStore.initialize()
  themeStore.init()
  initGlobalAnimations()
  updateRouteSEO()
})

onUnmounted(() => {
  revertGlobalAnimations()
  if (routeWatchDebounce) {
    clearTimeout(routeWatchDebounce)
    routeWatchDebounce = null
  }
})
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.app-content-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.app-main {
  flex: 1;
  padding-top: var(--header-height-fixed, 4rem);
  position: relative;
  z-index: 1;
}

/* Velvet texture - must be behind all content */
.velvet-texture {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.01) 1px, rgba(255,255,255,0.01) 2px),
    repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.008) 1px, rgba(255,255,255,0.008) 2px);
  background-size: 100% 3px, 3px 100%;
  background-repeat: repeat;
}

/* Page transition - CSS only, no JS dependency */
.page-enter-active {
  animation: page-fade-slide-in 0.35s ease-out;
}

.page-leave-active {
  animation: page-fade-slide-out 0.2s ease-in;
}

@keyframes page-fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes page-fade-slide-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}
</style>
