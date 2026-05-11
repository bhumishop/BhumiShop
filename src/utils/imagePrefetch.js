/**
 * Image prefetching and progressive loading utility
 * - Prefetches images when they're about to enter the viewport
 * - Uses IntersectionObserver for lazy loading with prefetching
 * - Implements a simple LRU cache to avoid duplicate loads
 */

const MAX_CACHE_SIZE = 50
const imageCache = new Map()
const prefetchQueue = new Set()
export let pendingPrefetches = 0
const MAX_CONCURRENT_PREFETCHES = 3
const activeImageLoads = new Set()

/**
 * Prefetch an image URL by loading it into memory
 */
export function prefetchImage(url, priority = 'low') {
  if (!url || url.startsWith('data:')) return
  if (imageCache.has(url)) return
  if (prefetchQueue.has(url)) return

  // Respect concurrent fetch limit
  if (pendingPrefetches >= MAX_CONCURRENT_PREFETCHES && priority === 'low') return

  prefetchQueue.add(url)
  pendingPrefetches++

  const img = new Image()
  activeImageLoads.add(img)

  img.onload = () => {
    imageCache.set(url, true)
    prefetchQueue.delete(url)
    pendingPrefetches--
    activeImageLoads.delete(img)
    maintainCacheSize()
  }
  img.onerror = () => {
    prefetchQueue.delete(url)
    pendingPrefetches--
    activeImageLoads.delete(img)
  }
  img.src = url
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
  if (imageCache.size > MAX_CACHE_SIZE) {
    const firstKey = imageCache.keys().next().value
    imageCache.delete(firstKey)
  }
}

/**
 * Create an IntersectionObserver that prefetches images when they're near the viewport
 */
export function createImagePrefetchObserver({ rootMargin = '200px' } = {}) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return { observe: () => {}, unobserve: () => {}, disconnect: () => {} }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.dataset.src || img.src
          if (src && !isImageCached(src)) {
            prefetchImage(src, 'high')
          }
          observer.unobserve(img)
        }
      })
    },
    { rootMargin }
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
 */
export function prefetchProductImages(products, maxCount = 12) {
  if (!Array.isArray(products)) return

  const imagesToPrefetch = products
    .slice(0, maxCount)
    .map((p) => transformProductImage(p.image))
    .filter(Boolean)
    .filter((img) => !img.startsWith('data:'))

  imagesToPrefetch.forEach((url, index) => {
    // Stagger prefetches to avoid overwhelming the network
    setTimeout(() => prefetchImage(url, index < 4 ? 'high' : 'low'), index * 100)
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
  pendingPrefetches = 0
}
