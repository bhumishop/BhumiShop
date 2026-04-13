import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const CART_STORAGE_KEY = 'bhumi-cart'
const MAX_QUANTITY = 99

function sanitizeText(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/[<>"'&]/g, '').trim()
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

export const useCartStore = defineStore('cart', () => {
  const items = ref(loadCartFromStorage())
  const isOpen = ref(false)

  // Throttled localStorage write — batch updates within 50ms window
  let _saveTimer = null
  const _saveCart = () => {
    if (_saveTimer) return
    _saveTimer = setTimeout(() => {
      _saveTimer = null
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value))
      } catch { /* quota exceeded — silently ignore */ }
    }, 50)
  }

  watch(items, _saveCart, { deep: true })

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
    return items.value.some(item => item.fulfillment_type === 'uma_penca')
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
      .filter(item => item.fulfillment_type === 'uma_penca')
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
      items.value.push({
        id: product.id,
        name: sanitizeText(product.name || ''),
        price: Number(product.price) || 0,
        image: product.image || '',
        category: product.category || '',
        quantity,
        size,
        fulfillment_type: product.fulfillment_type || 'own',
        weight: product.weight || 0.3,
        dimensions: product.dimensions || null,
        shipping_zones: product.shipping_zones || null
      })
    }
  }

  function removeItem(productId, size) {
    const key = _cartKey({ id: productId, size: size || null })
    const index = items.value.findIndex(item => _cartKey(item) === key)
    if (index > -1) {
      items.value.splice(index, 1)
    }
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
  }

  function clearCart() {
    items.value = []
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
    totalItems,
    totalPrice,
    fulfillmentGroups,
    hasUmaPencaItems,
    hasOwnItems,
    hasDigitalItems,
    ownItemsTotal,
    umaPencaItemsTotal,
    totalWeight,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleDrawer,
    openDrawer,
    closeDrawer
  }
})
