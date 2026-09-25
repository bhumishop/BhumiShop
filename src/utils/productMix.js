/**
 * Category-aware mixing helpers for product displays.
 *
 * Problem: the storefront API returns products ordered by `id DESC`, so when
 * one category (e.g. t-shirts) is bulk-imported last it occupies the whole
 * first page(s). Every "All / unfiltered" surface that did
 * `products.slice(0, N)` then showed t-shirts only.
 *
 * Fix: round-robin interleave by category so "All" views always mix books,
 * t-shirts and every other category, while filtered views keep their order.
 */

/** Normalize a product category into a stable grouping key. */
export function getCategoryKey(product) {
  const raw = product?.category ?? ''
  const key = String(raw).trim().toLowerCase()
  return key === '' ? '__none__' : key
}

/**
 * Round-robin interleave preserving each category's internal order.
 * Groups keep first-appearance order, then items are picked 1-by-1 per group.
 *
 * @param {Array} products - products in their current (sorted/filtered) order
 * @returns {Array} new array, same items, interleaved by category
 */
export function interleaveByCategory(products) {
  if (!Array.isArray(products) || products.length <= 1) {
    return Array.isArray(products) ? [...products] : []
  }

  const groups = new Map()
  for (const product of products) {
    const key = getCategoryKey(product)
    const bucket = groups.get(key)
    if (bucket) bucket.push(product)
    else groups.set(key, [product])
  }

  // Single category (or all uncategorized): nothing to mix.
  if (groups.size <= 1) return [...products]

  const lists = [...groups.values()]
  const out = []
  let index = 0
  let remaining = products.length
  while (remaining > 0) {
    let progressed = false
    for (const list of lists) {
      if (index < list.length) {
        out.push(list[index])
        remaining--
        progressed = true
      }
    }
    index++
    // Safety: should never happen, but avoid an infinite loop on bad input.
    if (!progressed) break
  }
  return out
}

/**
 * Interleave then take the first `limit` items.
 * Used by home highlights + circular gallery which show a fixed window.
 */
export function pickMixedProducts(products, limit = 10) {
  if (!Array.isArray(products) || products.length === 0) return []
  const mixed = interleaveByCategory(products)
  if (limit == null || limit >= mixed.length) return mixed
  return mixed.slice(0, Math.max(0, limit))
}

/** True when the catalog is filtered down to one category. */
export function isCategoryFiltered(activeCategory) {
  return Boolean(activeCategory) && activeCategory !== 'todos'
}

/**
 * Order the product list for the full products page.
 *
 * Ordering only — the caller passes an already filtered catalog
 * (`store.filteredProducts`), which is why `activeCategory` is used solely to
 * decide whether categories may be interleaved.
 *
 * @param {Array} products - filtered catalog (any order)
 * @param {string} sortBy - 'newest' | 'price-asc' | 'price-desc' | 'name-asc'
 * @param {string} activeCategory - store category filter ('' / 'todos' = All)
 * @returns {Array} new array in display order
 */
export function orderProducts(products, sortBy = 'newest', activeCategory = '') {
  const list = Array.isArray(products) ? [...products] : []
  switch (sortBy) {
    case 'price-asc':
      return list.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price-desc':
      return list.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'name-asc':
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'newest':
    default: {
      const newestFirst = list.sort((a, b) => b.id - a.id)
      // "All": mix every category round-robin so page 1 never shows a single
      // bulk-imported category only. A picked category keeps its pure order.
      if (isCategoryFiltered(activeCategory)) return newestFirst
      return interleaveByCategory(newestFirst)
    }
  }
}
