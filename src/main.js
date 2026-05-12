import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupI18n } from './i18n'
import './assets/main.css'

// Check for SPA redirect path BEFORE bootstrapping
const spaRedirectPath = sessionStorage.getItem('spa-redirect-path')
if (spaRedirectPath) {
  sessionStorage.removeItem('spa-redirect-path')
}

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  // Setup i18n with async locale loading
  const i18n = await setupI18n()

  app.use(pinia)
  app.use(i18n)
  app.use(router)

  app.config.errorHandler = (err, instance, info) => {
    if (err?.message?.includes('Cannot read properties of null (reading \'parentNode\')')) {
      return
    }
    console.error('[BhumiShop Error]', err, info)
  }

  app.mount('#app')

  // After app is mounted, handle redirect if needed
  if (spaRedirectPath) {
    await router.isReady()
    const currentPath = router.currentRoute.value.path
    if (currentPath !== spaRedirectPath && currentPath !== '/') {
      await router.replace(spaRedirectPath)
    }
  }
}

bootstrap()