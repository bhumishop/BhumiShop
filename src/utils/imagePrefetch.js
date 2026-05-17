/**
 * Image prefetching and progressive loading utility (v2)
 * - Prefetches images when they're about to enter the viewport
 * - Uses IntersectionObserver for lazy loading with prefetching
 * - Implements an LRU cache to avoid duplicate loads
 * - Respects browser connection limits with queue management
 * - Supports fetchpriority hints for browser optimization
 */

import { getOptimizedUrl } from './imageOptimizer'

const MAX_CACHE_SIZE = 100
const imageCache = new Map()
const prefetchQueue = new Set()
export let pendingPrefetches = 0
const MAX_CONCURRENT_PREFETCHES = 5
const activeImageLoads = new Set()
const prefetchPriority = new Map() // Track priority of queued URLs

/**
 * Prefetch an image URL by loading it into browser cache
 * Uses the optimized URL (WebP, resized) for faster loading
 *
 * @param {string} url - Original image URL
 * @param {object} options - Prefetch options
 */
export function prefetchImage(url, options = {}) {
  if (!url || url.startsWith('data:')) return
  if (imageCache.has(url)) return
  if (prefetchQueue.has(url)) return

  const {
    priority = 'low',        // 'high' or 'low'
    width = 600,             // Target width for optimization
    output = 'webp'          // Output format
  } = options

  // Respect concurrent fetch limit for low priority
  if (pendingPrefetches >= MAX_CONCURRENT_PREFETCHES && priority === 'low') return

  // Use optimized URL for prefetching
  const optimizedUrl = getOptimizedUrl(url, width, { output })

  prefetchQueue.add(optimizedUrl)
  prefetchPriority.set(optimizedUrl, priority)
  pendingPrefetches++

  const img = new Image()
  // Set fetchpriority hint for browser
  if (priority === 'high') {
    img.fetchPriority = 'high'
  }

  activeImageLoads.add(img)

  img.onload = () => {
    // Cache both the optimized and original URL
    imageCache.set(optimizedUrl, true)
    imageCache.set(url, true) // Also cache original so we know it's available
    prefetchQueue.delete(optimizedUrl)
    prefetchPriority.delete(optimizedUrl)
    pendingPrefetches--
    activeImageLoads.delete(img)
    maintainCacheSize()
  }
  img.onerror = () => {
    prefetchQueue.delete(optimizedUrl)
    prefetchPriority.delete(optimizedUrl)
    pendingPrefetches--
    activeImageLoads.delete(img)
  }
  img.src = optimizedUrl
}

/**
 * Check if an image is already cached
 */
export function isImageCached(url) {
  return imageCache.has(url)
}

/**
 * Maintain cache size limit (LRU eviction)
 */
function maintainCacheSize() {
  while (imageCache.size > MAX_CACHE_SIZE) {
    const firstKey = imageCache.keys().next().value
    imageCache.delete(firstKey)
  }
}

/**
 * Create an IntersectionObserver that prefetches images when they're near the viewport
 * Uses multiple thresholds for staged prefetching
 */
export function createImagePrefetchObserver({
  rootMargin = '300px',
  threshold = 0
} = {}) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return { observe: () => {}, unobserve: () => {}, disconnect: () => {} }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.dataset.src || img.src
          const priority = img.dataset.priority || 'low'

          if (src && !isImageCached(src)) {
            prefetchImage(src, {
              priority,
              width: parseInt(img.dataset.width || '600', 10),
              output: img.dataset.format || 'webp'
            })
          }
          observer.unobserve(img)
        }
      })
    },
    { rootMargin, threshold }
  )

  return {
    observe: (el) => observer.observe(el),
    unobserve: (el) => observer.unobserve(el),
    disconnect: () => observer.disconnect()
  }
}

import { transformProductImage } from './imageTransform'

/**
 * Prefetch product images from a list
 * Uses optimized URLs and staggers based on priority
 *
 * @param {Array} products - Array of product objects
 * @param {number} maxCount - Maximum number of products to prefetch
 * @param {object} options - Additional options
 */
export function prefetchProductImages(products, maxCount = 12, options = {}) {
  if (!Array.isArray(products)) return

  const {
    width = 600,
    output = 'webp',
    staggerDelay = 80
  } = options

  const imagesToPrefetch = products
    .slice(0, maxCount)
    .map((p) => ({
      url: transformProductImage(p.image, p.category),
      category: p.category,
      id: p.id
    }))
    .filter((item) => item.url && !item.url.startsWith('data:'))

  imagesToPrefetch.forEach((item, index) => {
    // First 4 images get high priority, rest get low
    const priority = index < 4 ? 'high' : 'low'

    // Stagger prefetches to avoid overwhelming the network
    setTimeout(() => {
      prefetchImage(item.url, {
        priority,
        width,
        output
      })
    }, index * staggerDelay)
  })
}

/**
 * Prefetch gallery images with higher priority for the first image
 *
 * @param {string[]} images - Array of image URLs
 * @param {string} productName - Product name for logging
 */
export function prefetchGalleryImages(images, productName = '') {
  if (!Array.isArray(images) || images.length === 0) return

  images.forEach((url, index) => {
    if (!url || url.startsWith('data:')) return

    // First image is high priority
    const priority = index === 0 ? 'high' : 'low'
    const width = index === 0 ? 1200 : 600

    setTimeout(() => {
      prefetchImage(url, { priority, width })
    }, index * 100)
  })
}

/**
 * Clear the image cache and cancel all pending prefetches
 */
export function clearImageCache() {
  // Cancel all active image loads
  for (const img of activeImageLoads) {
    img.onload = null
    img.onerror = null
    img.src = ''
  }
  activeImageLoads.clear()

  imageCache.clear()
  prefetchQueue.clear()
  prefetchPriority.clear()
  pendingPrefetches = 0
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  return {
    cached: imageCache.size,
    queued: prefetchQueue.size,
    pending: pendingPrefetches,
    active: activeImageLoads.size
  }
}
