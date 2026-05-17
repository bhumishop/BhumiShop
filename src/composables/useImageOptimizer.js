/**
 * useImageOptimizer - Composable for image optimization via weserv.nl proxy
 *
 * Uses images.weserv.nl as a free image optimization proxy that supports
 * WebP conversion, resizing, and caching via Cloudflare CDN.
 *
 * NOTE: AVIF output is disabled on this proxy instance.
 * Supported formats: jpg, png, webp, tiff, gif, json, jxl
 *
 * @example
 * const { optimizedSrc, srcset, sizes, handleImageError } = useImageOptimizer(src, {
 *   category: 'camiseta',
 *   layout: 'card',
 *   width: 600
 * })
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Supported output formats (AVIF is disabled on this proxy)
const SUPPORTED_OUTPUTS = ['webp', 'jpg', 'png', 'tiff', 'gif', 'jxl']

// Responsive image widths for srcset
const RESPONSIVE_SIZES = [200, 400, 600, 800, 1200]

// Layout-based sizes configurations
const LAYOUT_SIZES = {
  card: '(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw',
  gallery: '(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 1200px',
  thumbnail: '(max-width: 640px) 15vw, 80px',
  hero: '100vw',
  masonry: '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw'
}

/**
 * Check if a URL is a valid HTTP(S) URL
 */
function isValidHttpUrl(url) {
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
 * Transform CDN URLs to raw GitHub URLs
 * - jsDelivr -> raw.githubusercontent.com
 * - 000_image -> 001_image for t-shirts (not mugs)
 */
function transformUrl(url, category = '') {
  if (!url) return url
  let transformed = url

  // Transform jsDelivr URLs to raw GitHub
  if (transformed.includes('cdn.jsdelivr.net/gh')) {
    transformed = transformed.replace(
      /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\//,
      'https://raw.githubusercontent.com/$1/$2/$3/'
    )
  }

  // Transform 000_image -> 001_image for t-shirts only
  const cat = (category || '').toLowerCase()
  const isTshirt = cat.includes('camiseta') || cat.includes('t-shirt') ||
                   cat.includes('tshirt') || cat.includes('shirt') ||
                   cat.includes('vestuário') || cat.includes('wear')
  const isMug = cat.includes('caneca') || cat.includes('mug') || cat.includes('copo')

  if (transformed.includes('000_image') && isTshirt && !isMug) {
    transformed = transformed.replace('000_image', '001_image')
  }

  return transformed
}

/**
 * Generate an optimized image URL using weserv.nl proxy
 *
 * @param {string} url - Original or transformed image URL
 * @param {object} options
 * @param {number} options.width - Target width (default: 800)
 * @param {number} options.height - Target height (optional)
 * @param {number} options.quality - Quality 1-100 (default: 80)
 * @param {string} options.output - Output format: 'webp', 'jpg', 'png' (default: 'webp')
 * @param {string} options.fit - Fit mode: 'cover', 'contain', 'fill' (default: 'cover')
 * @returns {string|null} Optimized URL or null if invalid
 */
function getOptimizedUrl(url, {
  width = 800,
  height = null,
  quality = 80,
  output = 'webp',
  fit = 'cover'
} = {}) {
  if (!isValidHttpUrl(url)) return url

  // Ensure output format is supported
  const format = SUPPORTED_OUTPUTS.includes(output) ? output : 'webp'

  const params = new URLSearchParams({
    url: url,
    w: String(width),
    q: String(quality),
    output: format,
    fit: fit
  })

  if (height) {
    params.set('h', String(height))
  }

  return `https://images.weserv.nl/?${params.toString()}`
}

/**
 * Generate srcset for responsive images
 */
function generateSrcset(url, options = {}) {
  const {
    sizes = RESPONSIVE_SIZES,
    maxWidth = 1200,
    height = null,
    quality = 80,
    output = 'webp',
    fit = 'cover'
  } = options

  if (!isValidHttpUrl(url)) return ''

  const filteredSizes = sizes.filter(w => w <= maxWidth)
  return filteredSizes
    .map(width => {
      const optimizedUrl = getOptimizedUrl(url, { width, height, quality, output, fit })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

/**
 * Get sizes attribute for a layout type
 */
function getSizesForLayout(layout = 'card') {
  return LAYOUT_SIZES[layout] || '100vw'
}

/**
 * Composable for image optimization
 *
 * @param {import('vue').Ref<string>} srcRef - Reactive source URL
 * @param {object} options
 * @param {string} options.category - Product category for URL transformation
 * @param {string} options.layout - Layout type for sizing
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height (optional)
 * @param {number} options.quality - Image quality
 * @param {string} options.output - Output format
 * @param {string} options.fit - Fit mode
 * @param {number[]} options.srcsetSizes - Custom srcset widths
 * @returns {object} Reactive optimization state
 */
export function useImageOptimizer(srcRef, options = {}) {
  const {
    category = '',
    layout = 'card',
    width = 800,
    height = null,
    quality = 80,
    output = 'webp',
    fit = 'cover',
    srcsetSizes = RESPONSIVE_SIZES,
    maxWidth = 1200
  } = options

  // Internal state
  const useDirectUrl = ref(false) // Fallback: skip proxy when it fails
  const hasError = ref(false)
  const isLoaded = ref(false)

  // Transformed URL (jsDelivr -> GitHub, 000 -> 001)
  const transformedUrl = computed(() => {
    return transformUrl(srcRef.value, category)
  })

  // Whether the URL can be optimized (HTTP(S) and not a data/blob URL)
  const canOptimize = computed(() => isValidHttpUrl(transformedUrl.value))

  // Main optimized src (for fallback <img> element)
  const optimizedSrc = computed(() => {
    if (!srcRef.value) return ''
    const url = transformedUrl.value

    // When proxy fails, return direct URL
    if (useDirectUrl.value) {
      return isValidHttpUrl(url) ? url : url
    }

    // Generate optimized URL through proxy
    return getOptimizedUrl(url, { width, height, quality, output, fit })
  })

  // WebP srcset for <source type="image/webp">
  const webpSrcset = computed(() => {
    if (!srcRef.value || useDirectUrl.value) return ''
    return generateSrcset(transformedUrl.value, {
      sizes: srcsetSizes,
      maxWidth,
      height,
      quality,
      output: 'webp',
      fit
    })
  })

  // PNG srcset for <source type="image/png"> (useful for transparency)
  const pngSrcset = computed(() => {
    if (!srcRef.value || useDirectUrl.value) return ''
    // Only generate PNG srcset if the source might have transparency
    const url = transformedUrl.value.toLowerCase()
    if (!url.includes('.png')) return ''

    return generateSrcset(transformedUrl.value, {
      sizes: srcsetSizes,
      maxWidth,
      height,
      quality,
      output: 'png',
      fit
    })
  })

  // JPEG srcset (legacy fallback)
  const jpegSrcset = computed(() => {
    if (!srcRef.value || useDirectUrl.value) return ''
    return generateSrcset(transformedUrl.value, {
      sizes: srcsetSizes,
      maxWidth,
      height,
      quality: Math.min(quality + 5, 95), // JPEG slightly higher quality
      output: 'jpg',
      fit
    })
  })

  // Sizes attribute for responsive images
  const sizesAttr = computed(() => getSizesForLayout(layout))

  /**
   * Handle image load success
   */
  function handleLoad(event) {
    isLoaded.value = true
    return event
  }

  /**
   * Handle image load error - retry with direct URL if proxy fails
   */
  function handleImageError(event) {
    // If proxy URL failed and we haven't tried direct yet, retry with direct URL
    if (!useDirectUrl.value && canOptimize.value) {
      useDirectUrl.value = true
      isLoaded.value = false
      hasError.value = false
      return event
    }

    hasError.value = true
    return event
  }

  /**
   * Reset state (call when src changes)
   */
  function reset() {
    isLoaded.value = false
    hasError.value = false
    useDirectUrl.value = false
  }

  // Auto-reset when src changes
  if (srcRef) {
    watch(srcRef, reset)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    reset()
  })

  return {
    // Reactive URLs
    optimizedSrc,
    webpSrcset,
    pngSrcset,
    jpegSrcset,
    sizesAttr,
    transformedUrl,

    // State
    isLoaded,
    hasError,
    useDirectUrl,
    canOptimize,

    // Handlers
    handleLoad,
    handleImageError,
    reset
  }
}

/**
 * Simple URL-only transform (no proxy)
 * Useful when you need just the transformed URL without optimization
 */
export function getTransformedUrl(url, category = '') {
  return transformUrl(url, category)
}

/**
 * Get an optimized URL directly (non-reactive)
 */
export function getOptimizedImageUrl(url, options = {}) {
  const transformed = transformUrl(url, options.category || '')
  return getOptimizedUrl(transformed, options)
}

/**
 * Generate responsive srcset (non-reactive)
 */
export function getImageSrcset(url, options = {}) {
  const transformed = transformUrl(url, options.category || '')
  return generateSrcset(transformed, options)
}

export default useImageOptimizer
