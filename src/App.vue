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
      <div class="app-content-wrapper">
        <!-- Velvet texture overlay -->
        <div class="velvet-texture" aria-hidden="true"></div>
        <AppHeader />
        <main class="app-main">
          <router-view v-slot="{ Component, route: currentRoute }">
            <transition name="page" mode="out-in" @enter="onPageEnter" @leave="onPageLeave">
              <component :is="Component" :key="currentRoute.path" />
            </transition>
          </router-view>
        </main>
        <AppFooter />
        <CartDrawer v-if="!isCartRoute" />
        <ToastContainer />
      </div>
    </ClickSpark>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, computed, defineAsyncComponent, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { pageEnter, pageLeave, refreshScrollTriggers, initGlobalAnimations, revertGlobalAnimations } from './utils/animations'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useCartStore } from './stores/cart'
import { useSEO, routeSEO } from './composables/useSEO'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

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

function onPageEnter(el, done) {
  pageEnter(el, done)
}

function onPageLeave(el, done) {
  pageLeave(el, done)
}

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
watch(() => route.path, async (newPath, oldPath) => {
  if (newPath === oldPath) return

  // Close cart drawer on navigation
  cartStore.closeDrawer()

  // Wait for next tick to ensure the new component has mounted
  await nextTick()

  // Additional delay to ensure DOM updates are complete
  setTimeout(() => {
    // Clean up old ScrollTrigger instances before refreshing
    try {
      revertGlobalAnimations()
      initGlobalAnimations()
      refreshScrollTriggers(150)
      updateRouteSEO()
    } catch (e) {
      console.warn('[App.vue] Route watch error:', e)
    }
  }, 50)
})

onMounted(() => {
  authStore.initialize()
  themeStore.init()
  initGlobalAnimations()
  updateRouteSEO()
})

onUnmounted(() => {
  revertGlobalAnimations()
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
</style>
