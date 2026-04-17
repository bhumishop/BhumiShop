import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupI18n } from './i18n'
import './assets/main.css'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  // Setup i18n with async locale loading
  const i18n = await setupI18n()

  app.use(pinia)
  app.use(i18n)
  app.use(router)

  app.config.errorHandler = (err, instance, info) => {
    // Suppress known Vue transition runtime errors during navigation
    // These occur when TransitionGroup elements are removed before leave animation completes
    if (err?.message?.includes('Cannot read properties of null (reading \'parentNode\')')) {
      return // Silently ignore transition cleanup errors
    }
    console.error('[BhumiShop Error]', err, info)
  }

  app.mount('#app')

  // Handle SPA redirect from 404 page after router is ready
  // This ensures the router has finished initializing before navigating
  const redirectPath = sessionStorage.getItem('spa-redirect-path')
  if (redirectPath) {
    sessionStorage.removeItem('spa-redirect-path')
    // Wait for router to be ready, then navigate to the intended path
    await router.isReady()
    router.replace(redirectPath)
  }
}

bootstrap()
