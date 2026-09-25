// Must stay the first import: restores the URL (OAuth tokens included) saved by
// public/404.html before the Supabase client is created and scans the URL.
import './utils/restoreSpaRedirect'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n, setupI18n } from './i18n'
import './assets/main.css'

function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  // Start loading the locale messages but do NOT await them before mounting:
  // the Preloader keeps the screen covered until `i18nReady` settles, so first
  // paint is no longer blocked on 1-2 dynamic JSON imports.
  setupI18n()

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
}

bootstrap()
