/**
 * Storefront Edge Functions API Client for BhumiShop
 *
 * All data access goes through edge functions instead of direct Supabase table access.
 * This provides:
 * - Rate limiting
 * - Input sanitization
 * - Server-side validation
 * - Audit trails
 * - Proper security layers
 *
 * Edge functions are deployed from BhumiAdm to the shared Supabase project.
 */

import { supabase } from '../supabase'

const EDGE_FUNCTION_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

/**
 * Get auth headers for edge function calls.
 * Uses the current Supabase session token.
 */
async function getAuthHeaders() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {})
    }
  } catch {
    return { 'Content-Type': 'application/json' }
  }
}

/**
 * Raw fetch wrapper for edge functions with full URL control.
 */
async function fetchEdgeFunction(method, path, body = null) {
  const headers = await getAuthHeaders()
  const url = path.startsWith('http') ? path : `${EDGE_FUNCTION_BASE}/${path}`

  const options = {
    method,
    headers
  }
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Request failed: ${response.status}`)
  }

  return response.json()
}

// ============================================
// Storefront Products API
// ============================================

export const storefrontProducts = {
  /**
   * GET /storefront-products - List all active products
   * @param {number} [limit=50] - Max items to return (1-100)
   * @param {number} [offset=0] - Pagination offset
   * @returns {Promise<{data: Array, count: number, limit: number, offset: number}>}
   */
  list({ limit = 50, offset = 0 } = {}) {
    const url = new URL(`${EDGE_FUNCTION_BASE}/storefront-products`)
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('offset', String(offset))
    console.log('[storefrontApi] Calling edge function:', url.toString())
    return fetchEdgeFunction('GET', url.toString())
  },

  /**
   * GET /storefront-products/categories - List active categories
   * @returns {Promise<{data: Array}>}
   */
  categories() {
    console.log('[storefrontApi] Calling edge function: storefront-products/categories')
    return fetchEdgeFunction('GET', 'storefront-products/categories')
  }
}

// ============================================
// Storefront Orders API
// ============================================

export const storefrontOrders = {
  /**
   * GET /storefront-orders - List user's orders (requires auth)
   * @returns {Promise<{data: Array}>}
   */
  list() {
    return fetchEdgeFunction('GET', 'storefront-orders')
  },

  /**
   * GET /storefront-orders/{orderNumber} - Get single order (requires auth)
   * @param {string} orderNumber - Order number like BHS-2024-001
   * @returns {Promise<{data: Object}>}
   */
  get(orderNumber) {
    return fetchEdgeFunction('GET', `storefront-orders/${orderNumber}`)
  },

  /**
   * POST /storefront-orders - Create new order (guest checkout OK)
   * @param {Object} orderData
   * @returns {Promise<{data: Object, duplicate?: boolean}>}
   */
  create(orderData) {
    return fetchEdgeFunction('POST', 'storefront-orders', orderData)
  }
}

// ============================================
// Storefront Auth API
// ============================================

export const storefrontAuth = {
  /**
   * POST /storefront-auth/verify-session - Verify current session
   * @param {string|null} token - Session access token
   * @returns {Promise<{authenticated: boolean, user: Object|null}>}
   */
  verifySession(token) {
    return fetchEdgeFunction('POST', 'storefront-auth/verify-session', { token })
  },

  /**
   * POST /storefront-auth/get-user - Get current user profile with roles
   * @param {string} token - Session access token
   * @returns {Promise<{user: Object}>}
   */
  getUser(token) {
    return fetchEdgeFunction('POST', 'storefront-auth/get-user', { token })
  },

  /**
   * POST /storefront-auth/sign-out - Sign out user
   * @param {string|null} token - Session access token
   * @returns {Promise<{message: string}>}
   */
  signOut(token) {
    return fetchEdgeFunction('POST', 'storefront-auth/sign-out', { token })
  }
}

// ============================================
// Storefront Cart API
// ============================================

export const storefrontCart = {
  /**
   * GET /storefront-cart - Get current user's cart
   * @returns {Promise<{data: Object, items: Array}>}
   */
  get() {
    return fetchEdgeFunction('GET', 'storefront-cart')
  },

  /**
   * POST /storefront-cart - Create/update cart (replace all items)
   * @param {Array} items - Cart items array
   * @returns {Promise<{data: Object, items: Array}>}
   */
  set(items) {
    return fetchEdgeFunction('POST', 'storefront-cart', { items })
  },

  /**
   * PUT /storefront-cart - Update item quantity
   * @param {number} productId - Product ID
   * @param {number} quantity - New quantity (1-99)
   * @param {string|null} size - Size variant
   * @returns {Promise<{data: Object, items: Array}>}
   */
  updateQuantity(productId, quantity, size = null) {
    return fetchEdgeFunction('PUT', 'storefront-cart', { product_id: productId, quantity, size })
  },

  /**
   * DELETE /storefront-cart/{productId} - Remove item from cart
   * @param {number|string} productId - Product ID to remove
   * @returns {Promise<{data: Object, items: Array}>}
   */
  removeItem(productId) {
    return fetchEdgeFunction('DELETE', `storefront-cart/${productId}`)
  },

  /**
   * DELETE /storefront-cart - Clear entire cart
   * @returns {Promise<{message: string, items: Array}>}
   */
  clear() {
    return fetchEdgeFunction('DELETE', 'storefront-cart')
  }
}

// ============================================
// Storefront Shipping API
// ============================================

export const storefrontShipping = {
  /**
   * POST /storefront-shipping/calculate - Calculate shipping cost
   * @param {Array} items - Cart items
   * @param {string} destinationCep - Brazilian CEP (8 digits)
   * @param {string} [country='BR'] - Country code
   * @returns {Promise<{data: Object}>}
   */
  calculate(items, destinationCep, country = 'BR') {
    return fetchEdgeFunction('POST', 'storefront-shipping/calculate', {
      items,
      destination_cep: destinationCep,
      country
    })
  },

  /**
   * GET /storefront-shipping/state?cep= - Get state from CEP
   * @param {string} cep - Brazilian CEP
   * @returns {Promise<{state: string, zone: string}>}
   */
  getStateFromCep(cep) {
    return fetchEdgeFunction('GET', `storefront-shipping/state?cep=${encodeURIComponent(cep)}`)
  }
}

// Export unified client
export const storefrontApi = {
  products: storefrontProducts,
  orders: storefrontOrders,
  auth: storefrontAuth,
  cart: storefrontCart,
  shipping: storefrontShipping
}

export default storefrontApi
