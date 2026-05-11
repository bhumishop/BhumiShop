/**
 * Transform product image URL to show correct variant
 * For t-shirts: replaces 000_image with 001_image to show actual product
 * @param {string} imageUrl - The original image URL
 * @returns {string} - The transformed image URL
 */
export function transformProductImage(imageUrl) {
  if (!imageUrl) return ''
  
  let img = imageUrl
  
  // Transform old jsDelivr URLs to raw GitHub URLs
  if (img.includes('cdn.jsdelivr.net/gh')) {
    img = img.replace(
      /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\//,
      'https://raw.githubusercontent.com/$1/$2/$3/'
    )
  }
  
  // For t-shirts: replace 000_image with 001_image to show actual product
  if (img.includes('000_image')) {
    img = img.replace('000_image', '001_image')
  }
  
  return img
}