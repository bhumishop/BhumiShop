import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'
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
      const { data, error: err } = await supabase
        .from('orders')
        .select('*, order_status_history(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (err) throw err
      orders.value = data || []
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
      let query = supabase
        .from('orders')
        .select('*, order_items(*), order_status_history(*)')
        .eq('order_number', orderNumber)

      // If not admin, verify ownership via user_id
      if (!isAdmin && userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error: err } = await query.single()

      if (err) throw err
      currentOrder.value = data
      return data
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
      // Check for idempotency key to prevent duplicate orders
      if (orderData.idempotencyKey) {
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id, order_number')
          .eq('idempotency_key', orderData.idempotencyKey)
          .single()
        
        if (existingOrder) {
          console.warn('Duplicate order detected via idempotency key:', orderData.idempotencyKey)
          currentOrder.value = existingOrder
          return existingOrder
        }
      }

      const { data: orderNumber, error: numError } = await supabase.rpc('generate_order_number')
      if (numError) throw numError

      const orderPayload = {
        order_number: orderNumber,
        idempotency_key: orderData.idempotencyKey || null,
        status: 'pending',
        total: orderData.total,
        payment_method: orderData.paymentMethod,
        payment_status: 'pending',
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        shipping_address: orderData.shippingAddress || null,
        notes: orderData.notes || null,
        user_id: orderData.userId || null
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single()

      if (orderError) throw orderError

      const itemsPayload = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        size: item.size || null
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsPayload)

      if (itemsError) throw itemsError

      // Do NOT manually insert order_status_history — the database trigger handles it

      currentOrder.value = order
      return order
    } catch (err) {
      error.value = err.message || t('stores.orders.createError')
      console.error('createOrder error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrderPaymentStatus(orderId, paymentStatus, paymentRef) {
    try {
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
