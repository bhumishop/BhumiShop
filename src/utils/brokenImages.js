/**
 * Broken image tracker for BhumiShop
 * Tracks URLs that have failed to load to avoid retrying them
 */

const brokenImageUrls = new Set()

/**
 * Check if a URL is likely to fail based on known patterns.
 * @param {string} url - The URL to check
 * @returns {boolean} True if the URL looks broken
 */
export function isLikelyBrokenCdnUrl(url) {
  if (!url || !url.startsWith('http')) return false

  // Check for old jsDelivr CDN URLs that are now broken due to 50MB limit
  if (url.includes('cdn.jsdelivr.net') && url.includes('cdn_images')) {
    return true
  }

  // Check for raw.githubusercontent.com URLs with cdn_images
  if (url.includes('raw.githubusercontent.com') && url.includes('cdn_images')) {
    // Only mark as broken if it's in the broken cache
    return brokenImageUrls.has(url)
  }

  // Check if this URL has been marked as broken
  if (brokenImageUrls.has(url)) return true

  return false
}

/**
 * Mark a URL as broken so it won't be retried.
 * @param {string} url - The URL to mark as broken
 */
export function markImageUrlAsBroken(url) {
  if (url) {
    brokenImageUrls.add(url)
  }
}

/**
 * Clear the broken image cache (e.g., on page refresh).
 */
export function clearBrokenImageCache() {
  brokenImageUrls.clear()
}

/**
 * Handle image load error.
 * @param {Event} event - The error event
 * @returns {string|null} The broken URL or null
 */
export function handleImageLoadError(event) {
  const img = event.target
  const src = img?.src || img?.getAttribute('src')
  if (src) {
    markImageUrlAsBroken(src)
  }
  return src
}
