/**
 * Image optimization utility for BhumiShop
 * - Converts image URLs to use WebP format via weserv.nl proxy
 * - Generates responsive srcset with multiple sizes
 * - Provides optimal sizes attribute for browser selection
 *
 * Uses images.weserv.nl as a free, no-API-key image optimization proxy
 * that supports WebP conversion, resizing, and caching via Cloudflare CDN.
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
 * @returns {string} - Optimized image URL
 */
export function getOptimizedUrl(url, width = 800, options = {}) {
  if (!isValidHttpUrl(url)) return url

  const {
    quality = 80,
    format = 'webp',
    fit = 'cover',
    output = 'webp'
  } = options

  // weserv.nl URL format: https://images.weserv.nl?url=<encoded>&w=<width>&q=<quality>&output=<format>&fit=<fit>
  const params = new URLSearchParams({
    url: url,
    w: String(width),
    q: String(quality),
    output: output,
    fit: fit,
    // Enable caching hints
    'cache-status': 'true'
  })

  return `https://images.weserv.nl/?${params.toString()}`
}

/**
 * Generate srcset attribute value with multiple responsive sizes
 * Returns string like: "url?w=400 400w, url?w=800 800w, url?w=1200 1200w"
 *
 * @param {string} url - Original image URL
 * @param {number[]} sizes - Array of widths to generate
 * @returns {string} - srcset attribute value
 */
export function generateSrcset(url, sizes = RESPONSIVE_SIZES) {
  if (!isValidHttpUrl(url)) return ''

  // Filter sizes to only include those smaller than or equal to max 1200
  const filteredSizes = sizes.filter(w => w <= 1200)

  return filteredSizes
    .map(width => {
      const optimizedUrl = getOptimizedUrl(url, width)
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
      // Product cards: full width on mobile, ~50% on tablet, ~33% on desktop
      return '(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw'
    case 'gallery':
      // Gallery main image: mostly full width
      return '(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 1200px'
    case 'thumbnail':
      // Thumbnails: small fixed size
      return '(max-width: 640px) 15vw, 80px'
    case 'hero':
      // Hero/banner: full width always
      return '100vw'
    case 'masonry':
      // Masonry items: variable width
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
 * @returns {string} - Optimized URL for single-src fallback
 */
export function getImageForLayout(url, layout = 'card') {
  if (!isValidHttpUrl(url)) return url

  switch (layout) {
    case 'thumbnail':
      return getOptimizedUrl(url, 150)
    case 'card':
      return getOptimizedUrl(url, 600)
    case 'gallery':
      return getOptimizedUrl(url, 1200)
    case 'hero':
      return getOptimizedUrl(url, 1600)
    default:
      return getOptimizedUrl(url, 800)
  }
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

  // For preloading, use the largest size we'll need
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
    webpSupportCache = true // Assume support on server
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
 * Returns array of source objects for programmatic use
 *
 * @param {string} url - Original image URL
 * @param {object} options - Options
 * @returns {Array} - Array of source configurations
 */
export function getPictureSources(url, options = {}) {
  if (!isValidHttpUrl(url)) return []

  const {
    sizes = RESPONSIVE_SIZES,
    layout = 'card'
  } = options

  const sources = []

  // WebP source (modern browsers)
  const webpSrcset = sizes
    .map(width => `${getOptimizedUrl(url, width, { output: 'webp' })} ${width}w`)
    .join(', ')

  sources.push({
    srcset: webpSrcset,
    type: 'image/webp',
    sizes: generateSizes(layout)
  })

  // AVIF source (even more modern, smaller files)
  const avifSrcset = sizes
    .map(width => `${getOptimizedUrl(url, width, { output: 'avif' })} ${width}w`)
    .join(', ')

  sources.push({
    srcset: avifSrcset,
    type: 'image/avif',
    sizes: generateSizes(layout)
  })

  return sources
}

/**
 * Combine original URL transformation with optimization
 * Transforms jsDelivr -> GitHub raw, then applies optimization
 *
 * @param {string} url - Original URL from database
 * @param {string} category - Product category (for t-shirt transformation)
 * @param {number} width - Target width
 * @returns {string} - Final optimized URL
 */
export function transformAndOptimize(url, category = '', width = 800) {
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
  return getOptimizedUrl(transformed, width)
}
