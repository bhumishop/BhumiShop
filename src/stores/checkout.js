import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAbacatePay } from '../composables/useAbacatePay'
import { useOrderStore } from './orders'
import { useCartStore } from './cart'
import { useProductStore } from './products'
import { useToastStore } from './toast'
import { useAuthStore } from './auth'
import { calculateShipping, getStateFromCEP, getZoneFromState } from './shipping'
import { t } from '../utils/storeI18n'

function generateIdempotencyKey() {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

function sanitizeProductId(id) {
  const parsed = parseInt(id, 10)
  return isNaN(parsed) ? null : parsed
}

export const useCheckoutStore = defineStore('checkout', () => {
  const step = ref(1) // 1=Cart, 2=Info, 2.5=Shipping, 3=Payment, 4=Processing, 5=Confirm
  const loading = ref(false)
  const error = ref(null)
  const idempotencyKey = ref(null)
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
    country: 'BR',
    address: '',
    cep: '',
    postalCode: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    notes: ''
  })

  // Cache store instances to avoid re-computation
  const cartStore = useCartStore()

  const isInfoValid = computed(() => {
    const { name, email, phone, cep, postalCode, country } = customerInfo.value
    const code = postalCode || cep
    const validPostal = country === 'BR'
      ? code.replace(/\D/g, '').length === 8
      : code.trim().length > 0

    return (
      name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      phone.trim().length >= 10 &&
      validPostal
    )
  })

  // Use a function to compute total to avoid stale closures
  const computeTotalWithShipping = () => {
    let total = cartStore.totalPrice
    if (shippingCosts.value) {
      if (shippingCosts.value.own?.cost) total += shippingCosts.value.own.cost
      if (shippingCosts.value.uma_penca?.cost && paymentProvider.value !== 'uma_penca') {
        total += shippingCosts.value.uma_penca.cost
      }
    }
    return total
  }

  // Compute total shipping cost including all fulfillment types
  const computeShippingCostTotal = () => {
    if (!shippingCosts.value) return 0
    let total = 0
    if (shippingCosts.value.own?.cost) total += shippingCosts.value.own.cost
    if (shippingCosts.value.uma_penca?.cost && paymentProvider.value !== 'uma_penca') {
      total += shippingCosts.value.uma_penca.cost
    }
    return total
  }

  const totalWithShipping = computed(() => computeTotalWithShipping())

  const needsProviderSelection = computed(() => cartStore.hasUmaPencaItems)

  function setCustomerInfo(info) {
    customerInfo.value = {
      name: (info.name || '').trim(),
      email: (info.email || '').trim().toLowerCase(),
      phone: (info.phone || '').trim(),
      taxId: (info.taxId || '').trim(),
      country: (info.country || 'BR').trim(),
      address: (info.address || '').trim(),
      cep: (info.cep || '').trim(),
      postalCode: (info.postalCode || info.cep || '').trim(),
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
    const country = customerInfo.value.country || 'BR'
    const cep = (customerInfo.value.cep || '').replace(/\D/g, '')

    // For non-Brazil orders, use flat international rate
    if (country !== 'BR') {
      const intlItems = cartStore.items.filter(item => item.fulfillment_type !== 'digital')
      if (intlItems.length === 0) {
        shippingCosts.value = {
          own: { cost: 0, days: null },
          uma_penca: { cost: null, days: null },
          digital: { cost: 0, days: null, note: t('stores.shipping.immediateDigitalDelivery') }
        }
        return
      }

      // Flat international shipping rate
      const intlRate = 45.00
      shippingCosts.value = {
        own: { cost: intlRate, days: '10-20', note: t('stores.shipping.internationalShipping') },
        uma_penca: { cost: null, days: null, note: t('stores.shipping.calculatedByUmaPenca') },
        digital: { cost: 0, days: null, note: t('stores.shipping.immediateDigitalDelivery') }
      }
      return
    }

    // Brazil: require 8-digit CEP
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
    idempotencyKey.value = generateIdempotencyKey()

    try {
      const cartStore = useCartStore()
      const orderStore = useOrderStore()
      const toast = useToastStore()

      // Validate cart products exist and are active before processing
      const productStore = useProductStore()
      const invalidItems = cartStore.items.filter(item => {
        const product = productStore.getProductById(item.id)
        return !product || product.is_active === false || product.is_archived === true
      })
      
      if (invalidItems.length > 0) {
        const invalidNames = invalidItems.map(i => i.name).join(', ')
        throw new Error(`${t('stores.checkout.invalidProducts')}: ${invalidNames}`)
      }

      // Handle Uma Penca redirect - now opens in new tabs instead of redirecting
      if (paymentProvider.value === 'uma_penca') {
        // The view layer handles opening new tabs and filtering cart items
        // Just return here to avoid further processing
        return
      }

      // Create the order
      const authStore = useAuthStore()
      const order = await orderStore.createOrder({
        idempotencyKey: idempotencyKey.value,
        total: totalWithShipping.value,
        paymentMethod: paymentMethod.value,
        paymentProvider: paymentProvider.value,
        customerName: customerInfo.value.name,
        customerEmail: customerInfo.value.email,
        customerPhone: customerInfo.value.phone,
        shippingAddress: formatAddress(customerInfo.value),
        shippingCost: computeShippingCostTotal(),
        notes: customerInfo.value.notes,
        userId: authStore.user?.id || null,
        items: cartStore.items.map(item => ({
          id: sanitizeProductId(item.id),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          fulfillment_type: item.fulfillment_type || 'own'
        }))
      })

      if (!order) throw new Error(t('stores.checkout.createOrderError'))

      // All payment flows go to step 4 for payment processing/display
      // Step 4 handles: PIX QR display, Billing redirect card, PIX Bricks, Uma Penca redirect
      // Step 5 is for post-payment confirmation (after user returns)
      step.value = 4

      // PIX Bricks (Mercado Pago) flow - continue to render bricks in step 4
      if (paymentProvider.value === 'pix_bricks') {
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
          description: `${t('stores.checkout.orderPrefix')} ${order.order_number}`,
          customer: customer
        })

        pixData.value = pix
        await orderStore.updateOrderPaymentStatus(order.id, 'pending', pix.id)
      } else {
        const shippingCost = computeShippingCostTotal()
        const billing = await abacatePay.createBilling({
          products: [
            ...cartStore.items.map(item => ({
              name: item.name,
              price: Math.round(item.price * 100),
              quantity: item.quantity,
              description: item.size ? `${t('stores.checkout.sizePrefix')}: ${item.size}` : undefined
            })),
            ...(shippingCost > 0 ? [{
              name: t('stores.checkout.shipping'),
              price: Math.round(shippingCost * 100),
              quantity: 1,
              description: 'Shipping cost'
            }] : [])
          ],
          customer: customer,
          returnUrl: `${window.location.origin}/minhas-compras`,
          completionUrl: `${window.location.origin}/minhas-compras`
        })

        billingData.value = billing
        await orderStore.updateOrderPaymentStatus(order.id, 'pending', billing.id)
      }

      // Stay on step 4 for payment processing/display
      // Don't advance to step 5 until payment is confirmed or user returns
      toast.success(t('stores.checkout.orderSuccess'))
      return order
    } catch (err) {
      error.value = err.message || t('stores.checkout.paymentError')
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
      info.postalCode || info.cep ? `${info.country === 'BR' ? 'CEP' : 'ZIP'}: ${info.postalCode || info.cep}` : '',
      info.country ? info.country : ''
    ].filter(Boolean)
    return parts.join(', ')
  }

  async function checkPixStatus() {
    if (!pixData.value?.id) return { status: null, confirmed: false }
    try {
      const abacatePay = useAbacatePay()
      const status = await abacatePay.checkPixStatus(pixData.value.id)
      if (status === 'paid') {
        const orderStore = useOrderStore()
        const toast = useToastStore()
        const orderId = orderStore.currentOrder?.id
        if (orderId) {
          await orderStore.updateOrderPaymentStatus(orderId, 'paid', pixData.value.id)
          toast.success(t('stores.checkout.pixConfirmed'))
        } else {
          // No currentOrder found during PIX confirmation
        }
      }
      return { status, confirmed: status === 'paid' }
    } catch (err) {
      return { status: null, confirmed: false }
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
      country: 'BR',
      address: '',
      cep: '',
      postalCode: '',
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
    idempotencyKey,
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
