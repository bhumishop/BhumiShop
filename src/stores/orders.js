import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)

  async function fetchOrders(userId) {
    loading.value = true
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_status_history(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (data) {
      orders.value = data
    }
    loading.value = false
  }

  async function fetchOrderByNumber(orderNumber) {
    loading.value = true
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), order_status_history(*)')
      .eq('order_number', orderNumber)
      .single()
    
    if (data) {
      currentOrder.value = data
    }
    loading.value = false
    return data
  }

  async function createOrder(orderData) {
    const { data: orderNumber, error: numError } = await supabase.rpc('generate_order_number')
    if (numError) throw numError

    const orderPayload = {
      order_number: orderNumber,
      status: 'pending',
      total: orderData.total,
      payment_method: orderData.paymentMethod,
      payment_status: 'pending',
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      shipping_address: orderData.shippingAddress,
      notes: orderData.notes,
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
      size: item.size
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsPayload)
    
    if (itemsError) throw itemsError

    await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        status: 'pending',
        description: 'Pedido recebido, aguardando pagamento'
      })

    return order
  }

  async function updateOrderStatus(orderId, status, description) {
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_status: status,
      p_description: description
    })
    if (error) throw error
  }

  return {
    orders,
    currentOrder,
    loading,
    fetchOrders,
    fetchOrderByNumber,
    createOrder,
    updateOrderStatus
  }
})
