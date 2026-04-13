/**
 * Translation helper for Pinia stores.
 * Caches the i18n instance to avoid repeated global access.
 * Use this instead of importing i18n.global directly in stores.
 */
import { i18n } from '../i18n'

// Cache the translation function reference
let cachedT = null

/**
 * Get the cached translation function
 */
function getCachedT() {
  if (!cachedT) {
    cachedT = i18n.global.t.bind(i18n.global)
  }
  return cachedT
}

/**
 * Translate a key in stores
 * @param {string} key - Translation key
 * @param {object} [params] - Optional interpolation parameters
 * @returns {string} Translated string
 */
export function t(key, params) {
  return getCachedT()(key, params)
}

/**
 * Clear the cached translation function (useful for testing)
 */
export function clearTranslationCache() {
  cachedT = null
}
