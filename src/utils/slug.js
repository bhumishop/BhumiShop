/**
 * Generate a URL-friendly slug from a product name.
 * 
 * Examples:
 *   "Camiseta Bhumi - Arte & Propósito" → "camiseta-bhumi-arte-proposito"
 *   "Caneca Café 250ml" → "caneca-cafe-250ml"
 * 
 * @param {string} name - The product name
 * @param {number|string} [id] - Optional product ID to ensure uniqueness
 * @returns {string} URL-friendly slug
 */
export function generateSlug(name, id = null) {
  if (!name) return 'product'
  
  const slug = name
    .toLowerCase()
    .trim()
    // Replace accented characters with ASCII equivalents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Truncate to reasonable length
    .slice(0, 80)
  
  // Append ID if provided for uniqueness
  return id ? `${slug}-${id}` : slug
}

/**
 * Parse a product slug to extract the ID (if present).
 * 
 * @param {string} slug - The product slug
 * @returns {{ nameSlug: string, id: number|null }}
 */
export function parseSlug(slug) {
  if (!slug) return { nameSlug: slug, id: null }
  
  // Try to extract trailing ID (format: name-slug-123)
  const match = slug.match(/^(.+)-(\d+)$/)
  if (match) {
    return { nameSlug: match[1], id: parseInt(match[2], 10) }
  }
  
  return { nameSlug: slug, id: null }
}

/**
 * Find a product by its slug.
 * First tries to match by ID if present in slug, then by name match.
 * 
 * @param {Array} products - Array of products
 * @param {string} slug - The slug to match
 * @returns {object|null} Matched product or null
 */
export function findProductBySlug(products, slug) {
  if (!products || !slug) return null
  
  const { nameSlug, id } = parseSlug(slug)
  
  // If slug contains ID, try to find by ID first
  if (id !== null) {
    const byId = products.find(p => p.id === id)
    if (byId) return byId
  }
  
  // Fallback: try to match by name
  const normalizedSlug = nameSlug.toLowerCase()
  return products.find(p => {
    if (!p.name) return false
    const productSlug = generateSlug(p.name, p.id)
    return productSlug === normalizedSlug || productSlug.startsWith(normalizedSlug)
  }) || null
}
