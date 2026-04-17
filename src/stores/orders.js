import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storefrontOrders } from '../api/storefrontApi'
import { t } from '../utils/storeI18n'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchOrders(userId) {
    if (!userId) return
    loading.value = true
    error.value = null
    try {
      // Use storefront edge function instead of direct DB access
      const result = await storefrontOrders.list()
      orders.value = result.data || []
    } catch (err) {
      error.value = err.message || t('stores.orders.loadError')
      console.error('fetchOrders error:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderByNumber(orderNumber, userId = null, isAdmin = false) {
    loading.value = true
    error.value = null
    try {
      // Use storefront edge function instead of direct DB access
      const result = await storefrontOrders.get(orderNumber)
      currentOrder.value = result.data
      return result.data
    } catch (err) {
      error.value = err.message || t('stores.orders.loadOrderError')
      console.error('fetchOrderByNumber error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createOrder(orderData) {
    loading.value = true
    error.value = null
    try {
      // Use storefront edge function instead of direct DB access
      const result = await storefrontOrders.create({
        idempotencyKey: orderData.idempotencyKey || null,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        paymentProvider: orderData.paymentProvider || null,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: orderData.shippingAddress || null,
        shippingCost: orderData.shippingCost || 0,
        notes: orderData.notes || null,
        pixKey: orderData.pixKey || null,
        paymentReference: orderData.paymentReference || null,
        items: orderData.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          fulfillment_type: item.fulfillment_type || 'own'
        }))
      })

      if (result.duplicate) {
        console.warn('Duplicate order detected via idempotency key:', orderData.idempotencyKey)
      }

      currentOrder.value = result.data
      return result.data
    } catch (err) {
      error.value = err.message || t('stores.orders.createError')
      console.error('createOrder error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrderPaymentStatus(orderId, paymentStatus, paymentRef) {
    // This is a lightweight status update that stays direct
    // In a future migration, this should also go through an edge function
    try {
      const { supabase } = await import('../supabase')
      const { error: err } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          pix_key: paymentRef || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (err) throw err
    } catch (err) {
      console.error('updateOrderPaymentStatus error:', err)
      throw err
    }
  }

  function clearCurrentOrder() {
    currentOrder.value = null
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderByNumber,
    createOrder,
    updateOrderPaymentStatus,
    clearCurrentOrder
  }
})
