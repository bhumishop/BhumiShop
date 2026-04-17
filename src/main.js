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
}

bootstrap()
