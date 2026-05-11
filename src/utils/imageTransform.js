/**
 * Transform product image URL to show correct variant
 * For t-shirts: replaces 000_image with 001_image to show actual product
 * For mugs (caneca): keeps 000_image (no transformation needed)
 * @param {string} imageUrl - The original image URL
 * @param {string} category - The product category (optional)
 * @returns {string} - The transformed image URL
 */
export function transformProductImage(imageUrl, category = '') {
  if (!imageUrl) return ''
  
  let img = imageUrl
  
  // Transform old jsDelivr URLs to raw GitHub URLs
  if (img.includes('cdn.jsdelivr.net/gh')) {
    img = img.replace(
      /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\//,
      'https://raw.githubusercontent.com/$1/$2/$3/'
    )
  }
  
  // Only transform for t-shirts, NOT for mugs/canecas
  // Check if category contains t-shirt related terms
  const cat = (category || '').toLowerCase()
  const isTshirt = cat.includes('camiseta') || cat.includes('t-shirt') || cat.includes('tshirt') || cat.includes('shirt') || cat.includes('vestuário') || cat.includes('wear')
  const isMug = cat.includes('caneca') || cat.includes('mug') || cat.includes('copo')
  
  // Only apply 000 -> 001 for t-shirts, keep 000 for mugs
  if (img.includes('000_image') && isTshirt && !isMug) {
    img = img.replace('000_image', '001_image')
  }
  
  return img
}