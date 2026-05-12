import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storefrontCart } from '../api/storefrontApi'

const CART_STORAGE_KEY = 'bhumi-cart'
const MAX_QUANTITY = 99

function sanitizeText(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/[<>"'&]/g, '').trim()
}

function sanitizeObject(obj) {
  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else if (value !== null && value !== undefined) {
      sanitized[key] = value
    }
  }
  return sanitized
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(item =>
      item && typeof item.id !== 'undefined' && typeof item.price === 'number'
    )
  } catch {
    return []
  }
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch { /* quota exceeded — silently ignore */ }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref(loadCartFromStorage())
  const isOpen = ref(false)
  const synced = ref(false) // Track if cart has been synced to server

  // Optimized throttled localStorage write — batch updates within 100ms window
  let _saveTimer = null
  let _pendingSave = false
  const _saveCartLocal = () => {
    if (_saveTimer) {
      _pendingSave = true
      return
    }
    _pendingSave = true
    _saveTimer = setTimeout(() => {
      _saveTimer = null
      if (_pendingSave) {
        _pendingSave = false
        saveCartToStorage(items.value)
      }
    }, 100)
  }

  // Use shallow watch with manual deep comparison for better performance
  watch(items, _saveCartLocal, { deep: true })

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  const fulfillmentGroups = computed(() => {
    const groups = {}
    for (const item of items.value) {
      const type = item.fulfillment_type || 'own'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(item)
    }
    return groups
  })

  const hasUmaPencaItems = computed(() => {
    return items.value.some(item => {
      const ft = item.fulfillment_type
      return ft === 'uma_penca' || ft === 'uma penca'
    })
  })

  const hasUiclapItems = computed(() => {
    return items.value.some(item => item.fulfillment_type === 'uiclap')
  })

  const hasOwnItems = computed(() => {
    return items.value.some(item => !item.fulfillment_type || item.fulfillment_type === 'own')
  })

  const hasDigitalItems = computed(() => {
    return items.value.some(item => item.fulfillment_type === 'digital')
  })

  const ownItemsTotal = computed(() => {
    return items.value
      .filter(item => !item.fulfillment_type || item.fulfillment_type === 'own')
      .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  const umaPencaItemsTotal = computed(() => {
    return items.value
      .filter(item => {
        const ft = item.fulfillment_type
        return ft === 'uma_penca' || ft === 'uma penca'
      })
      .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  const uiclapItemsTotal = computed(() => {
    return items.value
      .filter(item => item.fulfillment_type === 'uiclap')
      .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  const totalWeight = computed(() => {
    return items.value
      .filter(item => item.fulfillment_type === 'own' || !item.fulfillment_type)
      .reduce((sum, item) => sum + ((item.weight || 0.3) * item.quantity), 0)
  })

  function _cartKey(item) {
    return `${item.id}_${item.size || 'default'}`
  }

  /**
   * Sync local cart to server via edge function.
   * Called after mutations to ensure server-side persistence.
   */
  async function _syncToServer() {
    if (synced.value && items.value.length > 0) {
      try {
        await storefrontCart.set(items.value.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          fulfillment_type: item.fulfillment_type,
          weight: item.weight,
          image: item.image
        })))
      } catch {
        // Cart sync to server failed (non-critical)
      }
    }
  }

  function addItem(product) {
    const quantity = Math.min(Math.max(Math.floor(product.quantity) || 1, 1), MAX_QUANTITY)
    const size = product.size || null
    const key = _cartKey({ id: product.id, size })

    const existingIndex = items.value.findIndex(item => _cartKey(item) === key)

    if (existingIndex !== -1) {
      const existing = items.value[existingIndex]
      const newQty = Math.min(existing.quantity + quantity, MAX_QUANTITY)
      items.value[existingIndex] = { ...existing, quantity: newQty }
    } else {
      const sanitizedProduct = sanitizeObject(product)
      items.value.push({
        id: sanitizedProduct.id,
        name: sanitizedProduct.name || '',
        price: Number(product.price) || 0,
        image: sanitizedProduct.image || '',
        category: sanitizedProduct.category || '',
        quantity,
        size: sanitizedProduct.size || null,
        fulfillment_type: sanitizedProduct.fulfillment_type || 'own',
        weight: Number(product.weight) || 0.3,
        dimensions: product.dimensions || null,
        shipping_zones: product.shipping_zones || null
      })
    }

    // Sync to server asynchronously
    _syncToServer()
  }

  function removeItem(productId, size) {
    const key = _cartKey({ id: productId, size: size || null })
    const index = items.value.findIndex(item => _cartKey(item) === key)
    if (index > -1) {
      items.value.splice(index, 1)
    }

    // Sync to server asynchronously
    _syncToServer()
  }

  function updateQuantity(productId, quantity, size) {
    const key = _cartKey({ id: productId, size: size || null })
    const item = items.value.find(item => _cartKey(item) === key)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId, size)
      } else {
        item.quantity = Math.min(Math.max(Math.floor(quantity), 1), MAX_QUANTITY)
      }
    }

    // Sync to server asynchronously
    _syncToServer()
  }

  async function clearCart() {
    items.value = []
    synced.value = false

    // Clear server cart
    try {
      await storefrontCart.clear()
    } catch {
      // Clear server cart failed (non-critical)
    }
  }

  /**
   * Load cart from server. Falls back to localStorage if server unavailable.
   * Should be called once during app initialization.
   */
  async function loadCart() {
    try {
      const result = await storefrontCart.get()
      if (result.items && Array.isArray(result.items)) {
        // Map server cart items to local format
        items.value = result.items.map(item => ({
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          quantity: item.quantity,
          size: item.size,
          fulfillment_type: item.fulfillment_type || 'own',
          weight: item.weight || 0.3,
          image: item.image || '',
          category: ''
        }))
        synced.value = true
        saveCartToStorage(items.value) // Update localStorage backup
        return
      }
    } catch {
      // Load server cart failed, using localStorage fallback
    }
    // Fallback: already loaded from localStorage in ref initialization
  }

  function toggleDrawer() {
    isOpen.value = !isOpen.value
  }

  function openDrawer() {
    isOpen.value = true
  }

  function closeDrawer() {
    isOpen.value = false
  }

  return {
    items,
    isOpen,
    synced,
    totalItems,
    totalPrice,
    fulfillmentGroups,
    hasUmaPencaItems,
    hasUiclapItems,
    hasOwnItems,
    hasDigitalItems,
    ownItemsTotal,
    umaPencaItemsTotal,
    uiclapItemsTotal,
    totalWeight,
    loadCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleDrawer,
    openDrawer,
    closeDrawer
  }
})
