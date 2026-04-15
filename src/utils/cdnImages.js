/**
 * GitHub CDN URL utilities for product images.
 *
 * Transforms Supabase Storage URLs to GitHub CDN (jsDelivr) URLs
 * and provides helpers for image URL generation.
 *
 * CDN URL format: https://cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}
 */

// CDN Configuration - these should match your GitHub repository
// Images are uploaded to BhumiAdm repo's 'cdn' branch via GitHub Actions
const CDN_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'BhumiAdm'
const CDN_REPO = import.meta.env.VITE_GITHUB_REPO || 'BhumiAdm'
const CDN_BRANCH = import.meta.env.VITE_CDN_BRANCH || 'cdn'
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${CDN_OWNER}/${CDN_REPO}@${CDN_BRANCH}`

/**
 * Check if a URL is a Supabase Storage URL
 */
export function isSupabaseUrl(url) {
  return url && url.includes('supabase.co/storage')
}

/**
 * Check if a URL is already a GitHub CDN URL
 */
export function isCdnUrl(url) {
  return url && url.includes('cdn.jsdelivr.net/gh/')
}

/**
 * Transform a Supabase Storage URL to a GitHub CDN URL.
 *
 * Supabase: https://xxx.supabase.co/storage/v1/object/public/product-images/12345/000_image.jpg
 * CDN:      https://cdn.jsdelivr.net/gh/owner/repo@cdn/products/12345/000_image.jpg
 *
 * If preferWebp is true and the URL ends with .jpg/.png, returns the .webp variant
 * (jsDelivr supports both, WebP is smaller/faster).
 */
export function transformToCdnUrl(url, preferWebp = false) {
  if (!url) return url
  // Already a CDN URL
  if (isCdnUrl(url)) {
    if (preferWebp && !url.endsWith('.webp')) {
      return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/, '.webp')
    }
    return url
  }
  // Check if it's a direct images.uiclap.com or umapenca.imgix.net URL
  if (url.includes('images.uiclap.com') || url.includes('umapenca.imgix.net')) {
    // These are original source URLs - we can't transform them directly
    // The scraper should have already uploaded them to CDN
    return url
  }
  if (!isSupabaseUrl(url)) return url

  try {
    // Extract the object path from Supabase URL
    // Format: /storage/v1/object/public/{bucket}/{path}
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
    if (!match) return url

    let path = match[1]

    // Normalize path: ensure it has proper prefix
    if (!path.startsWith('uiclap/') && !path.startsWith('products/')) {
      path = `products/${path}`
    }

    let cdnUrl = `${CDN_BASE}/${path}`

    // If preferWebp, try to return the .webp variant
    if (preferWebp && /\.(jpg|jpeg|png)(\?.*)?$/.test(cdnUrl)) {
      cdnUrl = cdnUrl.replace(/\.(jpg|jpeg|png)(\?.*)?$/, '.webp')
    }

    return cdnUrl
  } catch {
    return url // Return original on error
  }
}

/**
 * Get both original and WebP CDN URLs for an image.
 * Returns { original, webp } for fallback support.
 */
export function getCdnImageUrls(url) {
  return {
    original: transformToCdnUrl(url, false),
    webp: transformToCdnUrl(url, true),
  }
}

/**
 * Transform all image URLs in a product object to CDN URLs.
 * Handles: image, images array, color_swatches, and variant image_urls
 * @param {Object} product - The product object
 * @param {boolean} preferWebp - If true, use WebP variants for faster loading
 */
export function transformProductImagesToCdn(product, preferWebp = true) {
  if (!product) return product

  const transformed = { ...product }

  // Transform main image
  if (transformed.image) {
    transformed.image = transformToCdnUrl(transformed.image, preferWebp)
  }

  // Transform images array
  if (Array.isArray(transformed.images)) {
    transformed.images = transformed.images.map(url => transformToCdnUrl(url, preferWebp))
  }

  // Transform color swatches
  if (Array.isArray(transformed.color_swatches)) {
    transformed.color_swatches = transformed.color_swatches.map(url => transformToCdnUrl(url, false))
  }

  // Transform variant image_urls
  if (Array.isArray(transformed.variants)) {
    transformed.variants = transformed.variants.map(v => {
      if (v.image_url) {
        return { ...v, image_url: transformToCdnUrl(v.image_url, preferWebp) }
      }
      return v
    })
  }

  return transformed
}

/**
 * Generate a CDN URL for a product image given its path components.
 */
export function generateCdnImageUrl(productId, imageIndex = 0, prefix = 'products') {
  const ext = '.jpg'
  const filename = prefix === 'uiclap'
    ? `${String(imageIndex).padStart(3, '0')}_cover${ext}`
    : `${String(imageIndex).padStart(3, '0')}_image${ext}`

  return `${CDN_BASE}/${prefix}/${productId}/${filename}`
}

/**
 * Prefetch helper: transform URLs before prefetching
 */
export function prepareImageForPrefetch(url) {
  return transformToCdnUrl(url)
}

/**
 * Vue composable for CDN image URL transformation
 */
export function useCdnImages() {
  return {
    transformToCdnUrl,
    transformProductImagesToCdn,
    generateCdnImageUrl,
    isCdnUrl,
    isSupabaseUrl,
    cdnBase: CDN_BASE,
  }
}
