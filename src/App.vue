<template>
  <div class="app-root">
    <AppHeader />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in" @enter="onPageEnter" @leave="onPageLeave">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
    <CartDrawer />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { pageEnter, pageLeave, refreshScrollTriggers, initGlobalAnimations, revertGlobalAnimations } from './utils/animations'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import CartDrawer from './components/layout/CartDrawer.vue'
import ToastContainer from './components/common/BaseToast.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute()

function onPageEnter(el, done) {
  pageEnter(el, done)
}

function onPageLeave(el, done) {
  pageLeave(el, done)
}

// Refresh ScrollTrigger on every route change
// This is critical: scroll positions change when navigating between pages
watch(() => route.path, () => {
  // Wait for DOM to update, then refresh
  requestAnimationFrame(() => {
    refreshScrollTriggers()
  })
})

onMounted(() => {
  authStore.initialize()
  themeStore.init()
  initGlobalAnimations()
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
}

.app-main {
  flex: 1;
  padding-top: var(--header-height);
}
</style>
