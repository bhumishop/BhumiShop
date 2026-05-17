/**
 * Image optimization utility for BhumiShop
 * - Converts image URLs to use WebP format via weserv.nl proxy
 * - Generates responsive srcset with multiple sizes
 * - Provides optimal sizes attribute for browser selection
 *
 * Uses images.weserv.nl as a free, no-API-key image optimization proxy
 * that supports WebP conversion, resizing, and caching via Cloudflare CDN.
 *
 * NOTE: AVIF output is disabled on this proxy instance.
 * Supported savers: jpg, png, webp, tiff, gif, json, jxl
 */

// Responsive image widths for srcset
const RESPONSIVE_SIZES = [200, 400, 600, 800, 1200]

/**
 * Check if a URL is a valid HTTP(S) image URL that can be optimized
 */
export function isValidHttpUrl(url) {
  if (!url) return false
  if (url.startsWith('data:')) return false
  if (url.startsWith('blob:')) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Generate an optimized image URL using weserv.nl proxy
 * Converts to WebP, resizes to target width, and applies quality settings
 *
 * @param {string} url - Original image URL
 * @param {number} width - Target width in pixels
 * @param {object} options - Additional options
 * @param {number} [options.height] - Target height (optional, enables x,y sizing)
 * @param {number} [options.quality=80] - Image quality 1-100
 * @param {string} [options.output='webp'] - Output format: 'webp', 'jpg', 'png'
 * @param {string} [options.fit='cover'] - Fit mode: 'cover', 'contain', 'fill'
 * @returns {string} - Optimized image URL
 */
export function getOptimizedUrl(url, width = 800, options = {}) {
  if (!isValidHttpUrl(url)) return url

  const {
    quality = 80,
    output = 'webp',
    fit = 'cover',
    height = null
  } = options

  const params = new URLSearchParams({
    url: url,
    w: String(width),
    q: String(quality),
    output: output,
    fit: fit
  })

  if (height) {
    params.set('h', String(height))
  }

  return `https://images.weserv.nl/?${params.toString()}`
}

/**
 * Generate srcset attribute value with multiple responsive sizes
 * Returns string like: "url?w=400 400w, url?w=800 800w, url?w=1200 1200w"
 *
 * @param {string} url - Original image URL
 * @param {number[]} sizes - Array of widths to generate
 * @param {object} options - Additional options passed to getOptimizedUrl
 * @returns {string} - srcset attribute value
 */
export function generateSrcset(url, sizes = RESPONSIVE_SIZES, options = {}) {
  if (!isValidHttpUrl(url)) return ''

  const filteredSizes = sizes.filter(w => w <= 1200)

  return filteredSizes
    .map(width => {
      const optimizedUrl = getOptimizedUrl(url, width, options)
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

/**
 * Generate sizes attribute value based on common layout breakpoints
 * Helps browser choose appropriate image size before download
 *
 * @param {string} layout - Layout type: 'card', 'gallery', 'hero', 'thumbnail'
 * @returns {string} - sizes attribute value
 */
export function generateSizes(layout = 'card') {
  switch (layout) {
    case 'card':
      return '(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw'
    case 'gallery':
      return '(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 1200px'
    case 'thumbnail':
      return '(max-width: 640px) 15vw, 80px'
    case 'hero':
      return '100vw'
    case 'masonry':
      return '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw'
    default:
      return '100vw'
  }
}

/**
 * Get the best image URL for a specific display context
 * Chooses appropriate size based on layout type
 *
 * @param {string} url - Original image URL
 * @param {string} layout - Layout type: 'card', 'gallery', 'thumbnail', 'hero'
 * @param {object} options - Additional options
 * @returns {string} - Optimized URL for single-src fallback
 */
export function getImageForLayout(url, layout = 'card', options = {}) {
  if (!isValidHttpUrl(url)) return url

  const widthMap = { thumbnail: 150, card: 600, gallery: 1200, hero: 1600 }
  return getOptimizedUrl(url, widthMap[layout] || 800, options)
}

/**
 * Preload critical image URL with appropriate priority
 * For use in <link rel="preload"> or fetchpriority attribute
 *
 * @param {string} url - Image URL
 * @param {'high' | 'low'} priority - Fetch priority
 * @returns {object} - Preload link attributes
 */
export function getPreloadAttributes(url, priority = 'high') {
  if (!isValidHttpUrl(url)) return { href: url, fetchpriority: priority }

  return {
    href: getOptimizedUrl(url, 1200),
    fetchpriority: priority
  }
}

/**
 * Check if browser supports WebP
 * Uses canvas-based detection (cached after first call)
 */
let webpSupportCache = null

export function supportsWebP() {
  if (webpSupportCache !== null) return webpSupportCache

  if (typeof window === 'undefined') {
    webpSupportCache = true
    return webpSupportCache
  }

  try {
    const canvas = document.createElement('canvas')
    webpSupportCache = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  } catch {
    webpSupportCache = false
  }

  return webpSupportCache
}

/**
 * Generate <picture> element sources for optimal format selection
 * Returns array of source configurations for WebP and JPEG fallbacks
 * (AVIF is disabled on this proxy instance)
 *
 * @param {string} url - Original image URL
 * @param {object} options - Options
 * @returns {Array} - Array of source configurations
 */
export function getPictureSources(url, options = {}) {
  if (!isValidHttpUrl(url)) return []

  const {
    sizes = RESPONSIVE_SIZES,
    layout = 'card',
    height = null,
    fit = 'cover'
  } = options

  // WebP source (primary modern format)
  const webpSrcset = sizes
    .map(width => `${getOptimizedUrl(url, width, { output: 'webp', height, fit })} ${width}w`)
    .join(', ')

  // JPEG fallback (legacy browsers)
  const jpegSrcset = sizes
    .map(width => `${getOptimizedUrl(url, width, { output: 'jpg', height, fit })} ${width}w`)
    .join(', ')

  return [
    { srcset: webpSrcset, type: 'image/webp', sizes: generateSizes(layout) },
    { srcset: jpegSrcset, type: 'image/jpeg', sizes: generateSizes(layout) }
  ]
}

/**
 * Combine original URL transformation with optimization
 * Transforms jsDelivr -> GitHub raw, then applies optimization
 *
 * @param {string} url - Original URL from database
 * @param {string} category - Product category (for t-shirt transformation)
 * @param {number} width - Target width
 * @param {object} options - Additional options
 * @returns {string} - Final optimized URL
 */
export function transformAndOptimize(url, category = '', width = 800, options = {}) {
  let transformed = url

  // Transform jsDelivr URLs to raw GitHub
  if (transformed && transformed.includes('cdn.jsdelivr.net/gh')) {
    transformed = transformed.replace(
      /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\//,
      'https://raw.githubusercontent.com/$1/$2/$3/'
    )
  }

  // Transform 000_image -> 001_image for t-shirts
  const cat = (category || '').toLowerCase()
  const isTshirt = cat.includes('camiseta') || cat.includes('t-shirt') ||
                   cat.includes('tshirt') || cat.includes('shirt') ||
                   cat.includes('vestuário') || cat.includes('wear')
  const isMug = cat.includes('caneca') || cat.includes('mug') || cat.includes('copo')

  if (transformed && transformed.includes('000_image') && isTshirt && !isMug) {
    transformed = transformed.replace('000_image', '001_image')
  }

  // Apply optimization
  return getOptimizedUrl(transformed, width, options)
}
