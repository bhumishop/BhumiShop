import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAbacatePay } from '../composables/useAbacatePay'
import { useOrderStore } from './orders'
import { useCartStore } from './cart'
import { useToastStore } from './toast'
import { calculateShipping, getStateFromCEP, getZoneFromState } from './shipping'
import { i18n } from '../i18n'

const t = (key) => i18n.global.t(key)

export const useCheckoutStore = defineStore('checkout', () => {
  const step = ref(1) // 1=Cart, 2=Info, 2.5=Shipping, 3=Payment, 4=Processing, 5=Confirm
  const loading = ref(false)
  const error = ref(null)
  const paymentMethod = ref('pix') // 'pix', 'billing', 'pix_bricks', 'uma_penca'
  const paymentProvider = ref('') // 'abacatepay', 'pix_bricks', 'uma_penca'
  const pixData = ref(null)
  const billingData = ref(null)
  const pixBricksReady = ref(false)
  const shippingCosts = ref(null)
  const showProviderPopup = ref(false)
  const customerInfo = ref({
    name: '',
    email: '',
    phone: '',
    taxId: '',
    address: '',
    cep: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    notes: ''
  })

  const isInfoValid = computed(() => {
    const { name, email, phone, cep } = customerInfo.value
    return (
      name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      phone.trim().length >= 10 &&
      cep.replace(/\D/g, '').length === 8
    )
  })

  const totalWithShipping = computed(() => {
    const cartStore = useCartStore()
    let total = cartStore.totalPrice
    if (shippingCosts.value) {
      if (shippingCosts.value.own?.cost) total += shippingCosts.value.own.cost
      if (shippingCosts.value.uma_penca?.cost && paymentProvider.value !== 'uma_penca') {
        total += shippingCosts.value.uma_penca.cost
      }
    }
    return total
  })

  const needsProviderSelection = computed(() => {
    const cartStore = useCartStore()
    return cartStore.hasUmaPencaItems
  })

  function setCustomerInfo(info) {
    customerInfo.value = {
      name: (info.name || '').trim(),
      email: (info.email || '').trim().toLowerCase(),
      phone: (info.phone || '').trim(),
      taxId: (info.taxId || '').trim(),
      address: (info.address || '').trim(),
      cep: (info.cep || '').trim(),
      number: (info.number || '').trim(),
      complement: (info.complement || '').trim(),
      neighborhood: (info.neighborhood || '').trim(),
      city: (info.city || '').trim(),
      state: (info.state || '').trim(),
      notes: (info.notes || '').trim()
    }
  }

  function calculateShippingCost() {
    const cartStore = useCartStore()
    const cep = customerInfo.value.cep.replace(/\D/g, '')
    if (cep.length !== 8) {
      shippingCosts.value = null
      return
    }
    shippingCosts.value = calculateShipping(cartStore.items, cep)
    const state = getStateFromCEP(cep)
    if (state) {
      customerInfo.value.state = state
    }
  }

  function selectPaymentProvider(provider) {
    paymentProvider.value = provider
    showProviderPopup.value = false

    if (provider === 'uma_penca') {
      paymentMethod.value = 'uma_penca'
    } else if (provider === 'pix_bricks') {
      paymentMethod.value = 'pix_bricks'
    } else {
      paymentMethod.value = 'pix'
    }
  }

  async function processPayment() {
    loading.value = true
    error.value = null

    try {
      const cartStore = useCartStore()
      const orderStore = useOrderStore()
      const toast = useToastStore()

      // Handle Uma Penca redirect
      if (paymentProvider.value === 'uma_penca') {
        const umaPencaItems = cartStore.items.filter(item => item.fulfillment_type === 'uma_penca')
        const storeUrl = import.meta.env.VITE_UMAPENCA_STORE_URL || 'https://prataprint.bhumisparshaschool.org'
        const productIds = umaPencaItems.map(item => `product=${item.id}`).join('&')
        window.location.href = `${storeUrl}/checkout?${productIds}&ref=bhumi-shop`
        return
      }

      // Create the order
      const order = await orderStore.createOrder({
        total: totalWithShipping.value,
        paymentMethod: paymentMethod.value,
        paymentProvider: paymentProvider.value,
        customerName: customerInfo.value.name,
        customerEmail: customerInfo.value.email,
        customerPhone: customerInfo.value.phone,
        shippingAddress: formatAddress(customerInfo.value),
        shippingCost: shippingCosts.value?.own?.cost || 0,
        notes: customerInfo.value.notes,
        userId: null,
        items: cartStore.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          fulfillment_type: item.fulfillment_type || 'own'
        }))
      })

      if (!order) throw new Error(t('stores.checkout.createOrderError'))

      // PIX Bricks (Mercado Pago) flow
      if (paymentProvider.value === 'pix_bricks') {
        step.value = 4
        return order
      }

      // AbacatePay flow
      const abacatePay = useAbacatePay()

      const customer = await abacatePay.createCustomer({
        name: customerInfo.value.name,
        email: customerInfo.value.email,
        cellphone: customerInfo.value.phone,
        taxId: customerInfo.value.taxId
      })

      if (paymentMethod.value === 'pix') {
        const pix = await abacatePay.createPixPayment({
          amount: Math.round(totalWithShipping.value * 100),
          description: `Pedido ${order.order_number}`,
          customer: customer
        })

        pixData.value = pix
        await orderStore.updateOrderPaymentStatus(order.id, 'pending', pix.id)
      } else {
        const billing = await abacatePay.createBilling({
          products: cartStore.items.map(item => ({
            name: item.name,
            price: Math.round(item.price * 100),
            quantity: item.quantity,
            description: item.size ? `Tamanho: ${item.size}` : undefined
          })),
          customer: customer,
          returnUrl: `${window.location.origin}/minhas-compras`,
          completionUrl: `${window.location.origin}/minhas-compras`
        })

        billingData.value = billing
        await orderStore.updateOrderPaymentStatus(order.id, 'pending', billing.id)
      }

      step.value = 5
      toast.success(t('stores.checkout.orderSuccess'))
      return order
    } catch (err) {
      error.value = err.message || t('stores.checkout.paymentError')
      console.error('processPayment error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function formatAddress(info) {
    const parts = [
      info.address,
      info.number ? `nº ${info.number}` : '',
      info.complement ? info.complement : '',
      info.neighborhood ? `- ${info.neighborhood}` : '',
      info.city ? info.city : '',
      info.state ? ` - ${info.state}` : '',
      info.cep ? `CEP: ${info.cep}` : ''
    ].filter(Boolean)
    return parts.join(', ')
  }

  async function checkPixStatus() {
    if (!pixData.value?.id) return null
    try {
      const abacatePay = useAbacatePay()
      const status = await abacatePay.checkPixStatus(pixData.value.id)
      if (status === 'paid') {
        const orderStore = useOrderStore()
        const toast = useToastStore()
        await orderStore.updateOrderPaymentStatus(orderStore.currentOrder?.id, 'paid', pixData.value.id)
        toast.success(t('stores.checkout.pixConfirmed'))
      }
      return status
    } catch (err) {
      console.error('checkPixStatus error:', err)
      return null
    }
  }

  async function redirectToBillingCheckout() {
    if (billingData.value?.url) {
      window.location.href = billingData.value.url
    }
  }

  function reset() {
    step.value = 1
    loading.value = false
    error.value = null
    paymentMethod.value = 'pix'
    paymentProvider.value = ''
    pixData.value = null
    billingData.value = null
    pixBricksReady.value = false
    shippingCosts.value = null
    showProviderPopup.value = false
    customerInfo.value = {
      name: '',
      email: '',
      phone: '',
      taxId: '',
      address: '',
      cep: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      notes: ''
    }
  }

  function nextStep() {
    if (step.value < 5) step.value++
  }

  function prevStep() {
    if (step.value > 1) step.value--
  }

  return {
    step,
    loading,
    error,
    paymentMethod,
    paymentProvider,
    pixData,
    billingData,
    pixBricksReady,
    shippingCosts,
    showProviderPopup,
    customerInfo,
    isInfoValid,
    totalWithShipping,
    needsProviderSelection,
    setCustomerInfo,
    calculateShippingCost,
    selectPaymentProvider,
    processPayment,
    checkPixStatus,
    redirectToBillingCheckout,
    reset,
    nextStep,
    prevStep
  }
})
