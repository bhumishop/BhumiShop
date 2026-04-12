import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import en from '../src/i18n/locales/en.json'
import ptBR from '../src/i18n/locales/pt-BR.json'
import zh from '../src/i18n/locales/zh.json'
import ja from '../src/i18n/locales/ja.json'
import es from '../src/i18n/locales/es.json'
import th from '../src/i18n/locales/th.json'
import ne from '../src/i18n/locales/ne.json'
import hi from '../src/i18n/locales/hi.json'

// Create a global i18n instance for tests
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'pt-BR',
  messages: {
    en,
    'pt-BR': ptBR,
    zh,
    ja,
    es,
    th,
    ne,
    hi
  },
  globalInjection: true
})

// Create pinia instance
const pinia = createPinia()
setActivePinia(pinia)

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
})

// Configure Vue Test Utils
config.global.plugins = [i18n, pinia]

// Make i18n available globally
globalThis.i18n = i18n
globalThis.pinia = pinia
