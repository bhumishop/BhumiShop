import { createI18n } from 'vue-i18n'

// Supported locales
export const supportedLocales = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷', dir: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', dir: 'ltr' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' }
]

export const defaultLocale = 'pt-BR'

// Detect user locale from browser
export function detectLocale() {
  // Check localStorage first (user preference)
  const stored = localStorage.getItem('locale')
  if (stored && supportedLocales.find(l => l.code === stored)) {
    return stored
  }

  // Check navigator languages
  const languages = navigator.languages || [navigator.language]
  for (const lang of languages) {
    // Try exact match first
    const exact = supportedLocales.find(l => l.code === lang)
    if (exact) return lang

    // Try language code only (e.g., 'en' from 'en-US')
    const langCode = lang.split('-')[0]
    const partial = supportedLocales.find(l => l.code === langCode)
    if (partial) return partial.code
  }

  return defaultLocale
}

// Load locale messages dynamically
async function loadLocaleMessages(locale) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    return messages.default
  } catch (error) {
    console.error(`Failed to load locale messages for ${locale}:`, error)
    return {}
  }
}

// Create i18n instance
export const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: detectLocale(),
  fallbackLocale: defaultLocale,
  fallbackWarn: false,
  missingWarn: false,
  silentTranslationWarn: true,
  globalInjection: true, // Inject $t globally
  datetimeFormats: {
    'en': { short: { year: 'numeric', month: 'short', day: 'numeric' } },
    'pt-BR': { short: { day: 'numeric', month: 'short', year: 'numeric' } },
    'zh': { short: { year: 'numeric', month: 'short', day: 'numeric' } },
    'ja': { short: { year: 'numeric', month: 'short', day: 'numeric' } },
    'es': { short: { day: 'numeric', month: 'short', year: 'numeric' } },
    'th': { short: { year: 'numeric', month: 'short', day: 'numeric' } },
    'ne': { short: { year: 'numeric', month: 'short', day: 'numeric' } },
    'hi': { short: { year: 'numeric', month: 'short', day: 'numeric' } }
  },
  numberFormats: {
    'en': { currency: { style: 'currency', currency: 'BRL' } },
    'pt-BR': { currency: { style: 'currency', currency: 'BRL' } },
    'zh': { currency: { style: 'currency', currency: 'BRL' } },
    'ja': { currency: { style: 'currency', currency: 'BRL' } },
    'es': { currency: { style: 'currency', currency: 'BRL' } },
    'th': { currency: { style: 'currency', currency: 'BRL' } },
    'ne': { currency: { style: 'currency', currency: 'BRL' } },
    'hi': { currency: { style: 'currency', currency: 'BRL' } }
  }
})

// Set initial messages (will be loaded asynchronously)
i18n.global.setLocaleMessage(i18n.global.locale.value, {})

// Export setup function for use in main.js
export async function setupI18n() {
  const locale = i18n.global.locale.value
  const messages = await loadLocaleMessages(locale)
  i18n.global.setLocaleMessage(locale, messages)

  // Load fallback locale too
  if (locale !== defaultLocale) {
    const fallbackMessages = await loadLocaleMessages(defaultLocale)
    i18n.global.setLocaleMessage(defaultLocale, fallbackMessages)
  }

  return i18n
}

// Export function to change locale
export async function changeLocale(locale) {
  if (!supportedLocales.find(l => l.code === locale)) {
    console.warn(`Unsupported locale: ${locale}`)
    return
  }

  const currentLocale = i18n.global.locale.value
  if (currentLocale === locale) return

  const messages = await loadLocaleMessages(locale)
  i18n.global.setLocaleMessage(locale, messages)
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)

  // Update html lang attribute
  document.documentElement.lang = locale
}

export default i18n
