<template>
  <div class="checkout-page container">
    <h1 class="checkout-page__title">{{ $t('checkout.title') }}</h1>

    <CheckoutStepper
      :steps="[$t('checkout.stepperSteps[0]'), $t('checkout.stepperSteps[1]'), $t('checkout.stepperSteps[2]'), $t('checkout.stepperSteps[3]')]"
      :current="stepperIndex"
    />

    <!-- Step 1: Cart Review with fulfillment groups -->
    <div v-if="checkoutStore.step === 1" class="checkout-page__step">
      <h2 class="checkout-page__step-title">{{ $t('checkout.step1.title') }}</h2>

      <div v-if="cartStore.items.length === 0" class="checkout-page__empty">
        <p>{{ $t('checkout.step1.emptyCart') }}</p>
        <BaseButton variant="primary" @click="$router.push('/produtos')">{{ $t('checkout.step1.viewProducts') }}</BaseButton>
      </div>

      <div v-else>
        <!-- Own Items Group -->
        <div v-if="cartStore.fulfillmentGroups.own?.length" class="checkout-page__group">
          <div class="checkout-page__group-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
            <h3 class="checkout-page__group-title">{{ $t('checkout.step1.bhumiShopItems') }}</h3>
          </div>
          <div class="checkout-page__items">
            <div
              v-for="item in cartStore.fulfillmentGroups.own"
              :key="`own_${item.id}_${item.size || 'default'}`"
              class="checkout-item"
            >
              <div v-if="item.image" class="checkout-item__img-wrap">
                <img :src="item.image" :alt="item.name" class="checkout-item__img" />
              </div>
              <div class="checkout-item__details">
                <span class="checkout-item__name">{{ item.name }} <span v-if="item.size" class="checkout-item__size">({{ item.size }})</span></span>
              </div>
              <span class="checkout-item__qty">{{ item.quantity }}x</span>
              <span class="checkout-item__price">R$ {{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <!-- Uma Penca Items Group (only visible for Brazil users) -->
        <div v-if="showUmaPencaItems" class="checkout-page__group">
          <div class="checkout-page__group-header checkout-page__group-header--uma-penca">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <h3 class="checkout-page__group-title checkout-page__group-title--uma-penca">{{ $t('checkout.step1.umaPencaItems') }}</h3>
            <span class="checkout-page__group-badge">{{ $t('checkout.step1.sentByUmaPenca') }}</span>
          </div>
          <div class="checkout-page__items">
            <div
              v-for="item in umaPencaCartItems"
              :key="`up_${item.id}_${item.size || 'default'}`"
              class="checkout-item checkout-item--uma-penca"
            >
              <div v-if="item.image" class="checkout-item__img-wrap">
                <img :src="item.image" :alt="item.name" class="checkout-item__img" />
              </div>
              <div class="checkout-item__details">
                <span class="checkout-item__name">{{ item.name }} <span v-if="item.size" class="checkout-item__size">({{ item.size }})</span></span>
              </div>
              <span class="checkout-item__qty">{{ item.quantity }}x</span>
              <span class="checkout-item__price">R$ {{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <!-- Digital Items Group -->
        <div v-if="cartStore.fulfillmentGroups.digital?.length" class="checkout-page__group">
          <div class="checkout-page__group-header checkout-page__group-header--digital">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            <h3 class="checkout-page__group-title checkout-page__group-title--digital">{{ $t('checkout.step1.digitalItems') }}</h3>
          </div>
          <div class="checkout-page__items">
            <div
              v-for="item in cartStore.fulfillmentGroups.digital"
              :key="`digi_${item.id}_${item.size || 'default'}`"
              class="checkout-item checkout-item--digital"
            >
              <div v-if="item.image" class="checkout-item__img-wrap">
                <img :src="item.image" :alt="item.name" class="checkout-item__img" />
              </div>
              <div class="checkout-item__details">
                <span class="checkout-item__name">{{ item.name }}</span>
              </div>
              <span class="checkout-item__qty">{{ item.quantity }}x</span>
              <span class="checkout-item__price">R$ {{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="checkout-page__totals">
          <div class="checkout-page__total-line">
            <span>{{ $t('checkout.step1.subtotal') }}</span>
            <span class="checkout-page__total-value">R$ {{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          <div v-if="checkoutStore.shippingCosts?.own?.cost !== null && checkoutStore.shippingCosts?.own?.cost !== undefined" class="checkout-page__total-line">
            <span>{{ $t('checkout.step1.shippingBhumi') }}</span>
            <span class="checkout-page__total-value">
              <template v-if="checkoutStore.shippingCosts.own.cost === 0">{{ $t('checkout.step1.free') }}</template>
              <template v-else>R$ {{ formatPrice(checkoutStore.shippingCosts.own.cost) }}</template>
            </span>
          </div>
          <div class="checkout-page__total-line checkout-page__total-line--final">
            <span>{{ $t('checkout.step1.total') }}</span>
            <span class="checkout-page__total-price">R$ {{ formatPrice(checkoutStore.totalWithShipping) }}</span>
          </div>
        </div>

        <div class="checkout-page__nav">
          <BaseButton variant="primary" @click="goToInfoStep">{{ $t('checkout.step1.continue') }}</BaseButton>
        </div>
      </div>
    </div>

    <!-- Step 2: Customer Info + Address Guessing Game -->
    <div v-if="checkoutStore.step === 2" class="checkout-page__step">
      <h2 class="checkout-page__step-title">{{ $t('checkout.step2.title') }}</h2>
      <form class="checkout-page__form" @submit.prevent="goToShippingStep">
        <!-- Basic info -->
        <div class="checkout-page__form-grid">
          <BaseInput v-model="customerInfo.name" :label="$t('checkout.step2.fullName')" :placeholder="$t('checkout.step2.placeholders.name')" required :error="errors.name" />
          <BaseInput v-model="customerInfo.email" :label="$t('checkout.step2.email')" type="email" :placeholder="$t('checkout.step2.placeholders.email')" required :error="errors.email" />
          <BaseInput v-model="customerInfo.phone" :label="$t('checkout.step2.phone')" :placeholder="$t('checkout.step2.placeholders.phone')" required :error="errors.phone" />
          <BaseInput v-model="customerInfo.taxId" :label="$t('checkout.step2.cpf')" :placeholder="$t('checkout.step2.placeholders.cpf')" />
        </div>

        <!-- Address guessing game -->
        <div class="checkout-page__address-game">
          <div class="checkout-page__address-game-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <h3 class="checkout-page__address-game-title">{{ $t('checkout.addressGuessTitle') }}</h3>
          </div>
          <p class="checkout-page__address-game-desc">{{ $t('checkout.addressGuessDesc') }}</p>

          <AddressGuessInput
            ref="addressGuessRef"
            :country="customerInfo.country"
            :initial-postal-code="customerInfo.postalCode"
            :initial-address="{
              address: customerInfo.address,
              number: customerInfo.number,
              complement: customerInfo.complement,
              neighborhood: customerInfo.neighborhood,
              city: customerInfo.city,
              state: customerInfo.state
            }"
            @address-resolved="onAddressResolved"
            @address-updated="onAddressUpdated"
          />
        </div>

        <!-- Notes -->
        <BaseInput v-model="customerInfo.notes" :label="$t('checkout.step2.notes')" :placeholder="$t('checkout.step2.placeholders.notes')" />

        <div class="checkout-page__nav">
          <BaseButton variant="secondary" rainbow @click="checkoutStore.prevStep()">{{ $t('checkout.step2.back') }}</BaseButton>
          <BaseButton variant="primary" rainbow :disabled="!checkoutStore.isInfoValid" type="submit">{{ $t('checkout.step2.continue') }}</BaseButton>
        </div>
      </form>
    </div>

    <!-- Step 3: Shipping + Payment -->
    <div v-if="checkoutStore.step === 3" class="checkout-page__step">
      <h2 class="checkout-page__step-title">{{ $t('checkout.step3.title') }}</h2>

      <!-- Shipping Results -->
      <div class="checkout-page__section">
        <h3 class="checkout-page__section-label">{{ $t('checkout.step3.shipping') }}</h3>
        <ShippingCalculator ref="shippingCalcRef" />
      </div>

      <!-- Payment Provider Selection (if has Uma Penca items and user is in Brazil) -->
      <div v-if="showUmaPencaItems && !checkoutStore.paymentProvider" class="checkout-page__section">
        <p class="checkout-page__provider-prompt">
          {{ $t('checkout.step3.providerPrompt') }}
        </p>
        <BaseButton variant="secondary" @click="checkoutStore.showProviderPopup = true">
          {{ $t('checkout.step3.selectProvider') }}
        </BaseButton>
      </div>

      <!-- Payment Method Selection -->
      <div v-if="canShowPaymentMethods" class="checkout-page__section">
        <PaymentMethod
          v-model="checkoutStore.paymentMethod"
          :has-uma-penca-items="showUmaPencaItems"
          :payment-provider="checkoutStore.paymentProvider"
        />
      </div>

      <!-- Summary -->
      <div v-if="checkoutStore.shippingCosts" class="checkout-page__summary">
        <div class="checkout-page__summary-row">
          <span>{{ $t('checkout.step3.subtotal') }}</span>
          <span>R$ {{ formatPrice(cartStore.totalPrice) }}</span>
        </div>
        <div v-if="checkoutStore.shippingCosts.own?.cost !== null && checkoutStore.shippingCosts.own?.cost !== undefined" class="checkout-page__summary-row">
          <span>{{ $t('checkout.step3.shippingBhumi') }}</span>
          <span>
            <template v-if="checkoutStore.shippingCosts.own.cost === 0">{{ $t('checkout.step3.free') }}</template>
            <template v-else>R$ {{ formatPrice(checkoutStore.shippingCosts.own.cost) }}</template>
          </span>
        </div>
        <div v-if="checkoutStore.shippingCosts.uma_penca?.cost && checkoutStore.paymentProvider !== 'uma_penca'" class="checkout-page__summary-row">
          <span>{{ $t('checkout.step3.shippingUmaPenca') }}</span>
          <span>R$ {{ formatPrice(checkoutStore.shippingCosts.uma_penca.cost) }}</span>
        </div>
        <div class="checkout-page__summary-row checkout-page__summary-row--total">
          <span>{{ $t('checkout.step3.total') }}</span>
          <span>R$ {{ formatPrice(checkoutStore.totalWithShipping) }}</span>
        </div>
      </div>

      <div class="checkout-page__nav">
        <BaseButton variant="secondary" rainbow @click="checkoutStore.prevStep()">{{ $t('checkout.step3.back') }}</BaseButton>
        <BaseButton
          variant="primary"
          rainbow
          :loading="checkoutStore.loading"
          :disabled="!canProceedToPayment"
          @click="handlePayment"
        >
          {{ paymentButtonText }}
        </BaseButton>
      </div>

      <div v-if="checkoutStore.error" class="checkout-page__error">
        {{ checkoutStore.error }}
      </div>
    </div>

    <!-- Step 4: Payment Processing -->
    <div v-if="checkoutStore.step === 4" class="checkout-page__step">
      <h2 class="checkout-page__step-title">{{ $t('checkout.step4.title') }}</h2>

      <!-- PIX (AbacatePay) -->
      <template v-if="checkoutStore.paymentMethod === 'pix' && checkoutStore.pixData">
        <PixPayment
          :pix-data="checkoutStore.pixData"
          :loading="false"
          :checking="checkingPix"
          :paid="pixPaid"
          @check="checkPixPayment"
        />
      </template>

      <!-- Billing (AbacatePay) redirect -->
      <template v-else-if="checkoutStore.paymentMethod === 'billing' && checkoutStore.billingData">
        <div class="checkout-page__redirect-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <h3 class="checkout-page__redirect-title">{{ $t('checkout.step4.finalizePayment') }}</h3>
          <p class="checkout-page__redirect-desc">{{ $t('checkout.step4.redirectDesc') }}</p>
          <BaseButton variant="primary" @click="handleBillingRedirect">
            {{ $t('checkout.step4.goToPayment') }}
          </BaseButton>
        </div>
      </template>

      <!-- PIX Bricks (Mercado Pago) -->
      <template v-else-if="checkoutStore.paymentMethod === 'pix_bricks'">
        <div class="checkout-page__bricks-container">
          <div id="pix-bricks-container" class="checkout-page__bricks-wrap"></div>
          <div v-if="!pixBricksRendered" class="checkout-page__bricks-loading">
            <div class="checkout-page__spinner"></div>
            <p>{{ $t('checkout.step4.loadingMercadoPago') }}</p>
          </div>
        </div>
      </template>

      <!-- Uma Penca redirect - opens in NEW TABS, never overlays -->
      <template v-else-if="checkoutStore.paymentMethod === 'uma_penca'">
        <div class="checkout-page__redirect-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><line x1="15" y1="3" x2="21" y2="3"/><line x1="21" y1="3" x2="21" y2="9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          <h3 class="checkout-page__redirect-title">{{ $t('checkout.step4.redirectingUmaPenca', 'Opening third-party products') }}</h3>
          <p class="checkout-page__redirect-desc">{{ $t('checkout.step4.umaPencaDesc', 'Third-party products will open in new tabs. In-stock items will continue here.') }}</p>
          <BaseButton variant="primary" @click="handleUmaPencaRedirect">
            {{ $t('checkout.step4.goToExternalStores', 'Complete purchase at external stores') }}
          </BaseButton>
        </div>
      </template>

      <!-- Order Confirmation (shared) - only show if an order was actually created -->
      <OrderConfirmation
        v-if="orderStore.currentOrder?.order_number && checkoutStore.paymentMethod !== 'uma_penca'"
        :order-number="orderStore.currentOrder?.order_number"
        :payment-method="checkoutStore.paymentMethod"
        :billing-url="checkoutStore.billingData?.url"
      />

      <div class="checkout-page__nav">
        <BaseButton variant="secondary" @click="$router.push('/produtos')">{{ $t('checkout.step4.continueShopping') }}</BaseButton>
        <BaseButton variant="primary" @click="$router.push('/minhas-compras')">{{ $t('checkout.step4.viewOrders') }}</BaseButton>
      </div>
    </div>

    <!-- Step 5: Confirmation (fallback for completed orders) -->
    <div v-if="checkoutStore.step === 5" class="checkout-page__step">
      <OrderConfirmation
        :order-number="orderStore.currentOrder?.order_number"
        :payment-method="checkoutStore.paymentMethod"
        :billing-url="checkoutStore.billingData?.url"
      />

      <div class="checkout-page__nav">
        <BaseButton variant="secondary" @click="$router.push('/produtos')">{{ $t('checkout.step4.continueShopping') }}</BaseButton>
        <BaseButton variant="primary" @click="$router.push('/minhas-compras')">{{ $t('checkout.step4.viewOrders') }}</BaseButton>
      </div>
    </div>

    <!-- Payment Provider Popup -->
    <PaymentProviderPopup
      :show="checkoutStore.showProviderPopup"
      :has-uma-penca-items="showUmaPencaItems"
      @close="checkoutStore.showProviderPopup = false"
      @select="handleProviderSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useCheckoutStore } from '../stores/checkout'
import { useOrderStore } from '../stores/orders'
import { useProductStore } from '../stores/products'
import { useToastStore } from '../stores/toast'
import { useAuthStore } from '../stores/auth'
import { usePixBricks } from '../composables/usePixBricks'
import { getStateFromCEP } from '../stores/shipping'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import AddressGuessInput from '../components/common/AddressGuessInput.vue'
import CheckoutStepper from '../components/checkout/CheckoutStepper.vue'
import PaymentMethod from '../components/checkout/PaymentMethod.vue'
import PaymentProviderPopup from '../components/checkout/PaymentProviderPopup.vue'
import ShippingCalculator from '../components/checkout/ShippingCalculator.vue'
import PixPayment from '../components/checkout/PixPayment.vue'
import OrderConfirmation from '../components/checkout/OrderConfirmation.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const orderStore = useOrderStore()
const toast = useToastStore()
const authStore = useAuthStore()

// Check if user is in Brazil based on saved location
const isInBrazil = computed(() => {
  return authStore.userLocation?.countryCode === 'BR'
})

// Whether cart has visible UmaPenca items (only shown for Brazil users)
const showUmaPencaItems = computed(() => {
  return isInBrazil.value && cartStore.hasUmaPencaItems
})

// Uma Penca cart items - handles both 'uma_penca' and 'uma penca' fulfillment types
const umaPencaCartItems = computed(() => {
  const groups = cartStore.fulfillmentGroups
  return [...(groups['uma_penca'] || []), ...(groups['uma penca'] || [])]
})

const shippingCalcRef = ref(null)
const addressGuessRef = ref(null)
const checkingPix = ref(false)
const pixPaid = ref(false)
const pixBricksRendered = ref(false)
const isProcessingPayment = ref(false)
let pixPollingTimer = null
let pixPollAttempts = 0
let pixConsecutiveFailures = 0
const MAX_PIX_POLL_ATTEMPTS = 360 // 360 * 10s = 1 hour (matches expiresIn)
const MAX_CONSECUTIVE_POLL_FAILURES = 5

// Map checkout store step (1-5) to stepper index (0-3)
const stepperIndex = computed(() => {
  const s = checkoutStore.step
  if (s <= 1) return 0
  if (s === 2) return 1
  if (s === 3) return 2
  return 3
})

// Customer info reactive form
const customerInfo = reactive({
  name: checkoutStore.customerInfo.name || '',
  email: checkoutStore.customerInfo.email || '',
  phone: checkoutStore.customerInfo.phone || '',
  taxId: checkoutStore.customerInfo.taxId || '',
  country: checkoutStore.customerInfo.country || 'BR',
  address: checkoutStore.customerInfo.address || '',
  cep: checkoutStore.customerInfo.cep || '',
  postalCode: checkoutStore.customerInfo.postalCode || checkoutStore.customerInfo.cep || '',
  number: checkoutStore.customerInfo.number || '',
  complement: checkoutStore.customerInfo.complement || '',
  neighborhood: checkoutStore.customerInfo.neighborhood || '',
  city: checkoutStore.customerInfo.city || '',
  state: checkoutStore.customerInfo.state || '',
  notes: checkoutStore.customerInfo.notes || ''
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  cep: ''
})

// Sync customer info to store on change
watch(customerInfo, (info) => {
  checkoutStore.setCustomerInfo(info)
}, { deep: true })

// Address guessing game handlers
function onAddressResolved(data) {
  customerInfo.postalCode = data.postalCode || data.cep || ''
  customerInfo.cep = customerInfo.postalCode
  if (data.address) customerInfo.address = data.address
  if (data.number) customerInfo.number = data.number
  if (data.complement) customerInfo.complement = data.complement
  if (data.neighborhood) customerInfo.neighborhood = data.neighborhood
  if (data.city) customerInfo.city = data.city
  if (data.state) customerInfo.state = data.state

  // Trigger shipping calculation
  if (customerInfo.country === 'BR') {
    const digits = customerInfo.postalCode.replace(/\D/g, '')
    if (digits.length === 8) {
      checkoutStore.calculateShippingCost()
    }
  } else if (customerInfo.postalCode.trim().length > 0) {
    checkoutStore.calculateShippingCost()
  }
}

function onAddressUpdated(data) {
  customerInfo.postalCode = data.postalCode || ''
  customerInfo.cep = customerInfo.postalCode
  if (data.address !== undefined) customerInfo.address = data.address
  if (data.number !== undefined) customerInfo.number = data.number
  if (data.complement !== undefined) customerInfo.complement = data.complement
  if (data.neighborhood !== undefined) customerInfo.neighborhood = data.neighborhood
  if (data.city !== undefined) customerInfo.city = data.city
  if (data.state !== undefined) customerInfo.state = data.state

  // Trigger shipping calculation
  if (customerInfo.country === 'BR') {
    const digits = customerInfo.postalCode.replace(/\D/g, '')
    if (digits.length === 8) {
      checkoutStore.calculateShippingCost()
    }
  } else if (customerInfo.postalCode.trim().length > 0) {
    checkoutStore.calculateShippingCost()
  }
}

// Auto-calculate shipping when postal code changes (debounced)
let shippingDebounceTimer = null
watch(() => customerInfo.postalCode, (newCep) => {
  if (shippingDebounceTimer) clearTimeout(shippingDebounceTimer)
  shippingDebounceTimer = setTimeout(() => {
    if (customerInfo.country === 'BR') {
      const digits = (newCep || '').replace(/\D/g, '')
      if (digits.length === 8) {
        checkoutStore.calculateShippingCost()
      }
    } else if ((newCep || '').trim().length > 0) {
      checkoutStore.calculateShippingCost()
    }
  }, 500)
})



// Whether we can show payment methods
const canShowPaymentMethods = computed(() => {
  if (showUmaPencaItems.value) {
    return !!checkoutStore.paymentProvider
  }
  return true
})

// Whether user can proceed to pay
const canProceedToPayment = computed(() => {
  if (!canShowPaymentMethods.value) return false
  if (!checkoutStore.paymentMethod) return false
  return true
})

// Dynamic payment button text
const paymentButtonText = computed(() => {
  const method = checkoutStore.paymentMethod
  if (method === 'pix') return t('checkout.step3.generatePix')
  if (method === 'billing') return t('checkout.step3.goToPayment')
  if (method === 'pix_bricks') return t('checkout.step3.payWithMercadoPago')
  if (method === 'uma_penca') return t('checkout.step3.goToUmaPenca')
  return t('checkout.step3.confirmPayment')
})

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

function goToInfoStep() {
  checkoutStore.nextStep()
}

function goToShippingStep() {
  // Validate
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.cep = ''

  if (!customerInfo.name.trim()) errors.name = t('checkout.step2.validation.nameRequired')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email.trim())) errors.email = t('checkout.step2.validation.emailInvalid')
  if (customerInfo.phone.trim().length < 10) errors.phone = t('checkout.step2.validation.phoneInvalid')

  // Validate postal code from address guess component
  const postalCode = customerInfo.postalCode || customerInfo.cep
  if (!postalCode || postalCode.trim().length === 0) {
    errors.cep = t('checkout.step2.validation.cepInvalid')
  }

  if (errors.name || errors.email || errors.phone || errors.cep) return

  checkoutStore.setCustomerInfo(customerInfo)
  checkoutStore.calculateShippingCost()

  // If has Uma Penca items, show provider popup on step 3
  checkoutStore.nextStep()

  // After step transition, auto-show provider popup if needed
  nextTick(() => {
    if (showUmaPencaItems.value && !checkoutStore.paymentProvider) {
      checkoutStore.showProviderPopup = true
    }
  })
}

function handleProviderSelect(provider) {
  checkoutStore.selectPaymentProvider(provider)
}

async function handlePayment() {
  if (isProcessingPayment.value) return
  isProcessingPayment.value = true

  try {
    const order = await checkoutStore.processPayment()

    // If uma_penca, the store already redirected — do nothing more
    if (checkoutStore.paymentProvider === 'uma_penca') return

    // Don't clear cart yet — wait until payment is confirmed (PIX or billing redirect)

    // Start PIX polling if AbacatePay PIX
    if (checkoutStore.paymentMethod === 'pix' && checkoutStore.pixData) {
      // Clear any existing polling timer before starting new one
      if (pixPollingTimer) clearInterval(pixPollingTimer)
      startPixPolling()
    }

    // Render PIX Bricks if Mercado Pago
    if (checkoutStore.paymentMethod === 'pix_bricks' && checkoutStore.step === 4) {
      await nextTick()
      await renderPixBricks()
    }
  } catch (err) {
    toast.error(err.message || t('stores.checkout.paymentError'))
  } finally {
    isProcessingPayment.value = false
  }
}

async function renderPixBricks() {
  try {
    const pixBricks = usePixBricks()
    await pixBricks.loadSDK()
    await pixBricks.renderPaymentBrick('pix-bricks-container', {
      amount: checkoutStore.totalWithShipping,
      onReady: () => {
        pixBricksRendered.value = true
      },
      onSubmit: async (formData) => {
        // Payment submitted to MercadoPago
      },
      onError: (error) => {
        console.error('PIX Bricks error:', error)
        toast.error(t('checkout.step4.mercadoPagoError', 'Payment error occurred'))
      }
    })
  } catch (err) {
    console.error('Failed to render PIX Bricks:', err)
    toast.error(t('checkout.step4.loadingMercadoPago'))
  }
}

function handleUmaPencaRedirect() {
  const productStore = useProductStore()

  // Get uma_penca items
  const umaPencaItems = cartStore.items.filter(item => {
    const ft = item.fulfillment_type
    return ft === 'uma_penca' || ft === 'uma penca'
  })

  // Get uiclap items
  const uiclapItems = cartStore.items.filter(item => item.fulfillment_type === 'uiclap')

  const umaPencaStoreUrl = import.meta.env.VITE_UMAPENCA_STORE_URL || 'https://prataprint.bhumisparshaschool.org'
  const uiclapStoreUrl = import.meta.env.VITE_UICLAP_STORE_URL || 'https://loja.uiclap.com'

  // Handle Uma Penca items
  umaPencaItems.forEach(item => {
    const product = productStore.getProductById(item.id)
    const productUrl = product?.product_url || product?.third_party_product_url

    if (productUrl) {
      window.open(productUrl, '_blank')
    } else {
      const cartPayload = {
        id: parseInt(item.id, 10) || item.id,
        qty: Math.min(Math.max(item.quantity, 1), 99),
        size: item.size || null
      }
      const encodedCart = btoa(unescape(encodeURIComponent(JSON.stringify([cartPayload]))))
      const url = new URL(`${umaPencaStoreUrl}/checkout`)
      url.searchParams.set('cart', encodedCart)
      url.searchParams.set('ref', 'bhumi-shop')
      window.open(url.toString(), '_blank')
    }
  })

  // Handle UICLAP items
  uiclapItems.forEach(item => {
    const product = productStore.getProductById(item.id)
    const productUrl = product?.product_url || product?.third_party_product_url

    if (productUrl) {
      window.open(productUrl, '_blank')
    } else {
      // UICLAP uses a different URL pattern: https://loja.uiclap.com/titulo/{product_id}/
      // Or we can use their cart API if available
      const url = new URL(`${uiclapStoreUrl}/checkout`)
      const cartPayload = {
        id: parseInt(item.id, 10) || item.id,
        qty: Math.min(Math.max(item.quantity, 1), 99)
      }
      const encodedCart = btoa(unescape(encodeURIComponent(JSON.stringify([cartPayload]))))
      url.searchParams.set('cart', encodedCart)
      url.searchParams.set('ref', 'bhumi-shop')
      window.open(url.toString(), '_blank')
    }
  })

  // Remove third-party items from cart, keep only in-stock items
  cartStore.items = cartStore.items.filter(item => {
    const ft = item.fulfillment_type
    return ft !== 'uma_penca' && ft !== 'uma penca' && ft !== 'uiclap'
  })

  // If there are still in-stock items, continue with checkout
  if (cartStore.items.length > 0) {
    checkoutStore.paymentMethod = 'pix'
    checkoutStore.paymentProvider = ''
    toast.info(t('checkout.step1.thirdPartyOpened', 'Third-party products opened in new tabs. Continue checkout for in-stock items.'))
  } else {
    // All items were third-party
    cartStore.clearCart()
    // Open the appropriate store checkout based on what was in cart
    if (umaPencaItems.length > 0 && uiclapItems.length > 0) {
      // Mixed - open both checkouts
      const umaUrl = new URL(`${umaPencaStoreUrl}/checkout`)
      umaUrl.searchParams.set('ref', 'bhumi-shop')
      window.open(umaUrl.toString(), '_blank')

      const uicUrl = new URL(`${uiclapStoreUrl}/checkout`)
      uicUrl.searchParams.set('ref', 'bhumi-shop')
      window.open(uicUrl.toString(), '_blank')
    } else if (umaPencaItems.length > 0) {
      const url = new URL(`${umaPencaStoreUrl}/checkout`)
      url.searchParams.set('ref', 'bhumi-shop')
      window.open(url.toString(), '_blank')
    } else if (uiclapItems.length > 0) {
      const url = new URL(`${uiclapStoreUrl}/checkout`)
      url.searchParams.set('ref', 'bhumi-shop')
      window.open(url.toString(), '_blank')
    }
    toast.info(t('checkout.step1.allThirdParty', 'All products were third-party. Opened in new tabs.'))
    router.push('/produtos')
  }
}

function startPixPolling() {
  if (pixPollingTimer) clearInterval(pixPollingTimer)
  pixPollAttempts = 0
  pixConsecutiveFailures = 0
  pixPollingTimer = setInterval(async () => {
    pixPollAttempts++
    const result = await checkPixPayment()
    // Stop polling if payment confirmed or max attempts reached
    if (result?.confirmed) {
      clearInterval(pixPollingTimer)
      pixPollingTimer = null
    } else if (pixPollAttempts >= MAX_PIX_POLL_ATTEMPTS) {
      clearInterval(pixPollingTimer)
      pixPollingTimer = null
      toast.error(t('checkout.step4.pixExpired'))
    }
  }, 10000)
}

async function checkPixPayment() {
  checkingPix.value = true
  try {
    const { status, confirmed } = await checkoutStore.checkPixStatus()
    pixConsecutiveFailures = 0
    if (confirmed || status === 'paid') {
      pixPaid.value = true
      clearInterval(pixPollingTimer)
      pixPollingTimer = null
      toast.success(t('checkout.step4.pixConfirmed'))
      return { confirmed: true, status }
    }
    return { confirmed: false, status }
  } catch {
    pixConsecutiveFailures++
    if (pixConsecutiveFailures >= MAX_CONSECUTIVE_POLL_FAILURES) {
      clearInterval(pixPollingTimer)
      pixPollingTimer = null
      toast.warning(t('checkout.step4.pixCheckError', 'Payment status check is unavailable. Please check your order status later.'))
    }
    return { confirmed: false, status: null }
  } finally {
    checkingPix.value = false
  }
}

function handleBillingRedirect() {
  // Cart will be cleared after user returns and payment is confirmed
  // Don't clear now in case payment fails and user needs to retry
  checkoutStore.redirectToBillingCheckout()
}

onUnmounted(async () => {
  if (pixPollingTimer) clearInterval(pixPollingTimer)
  if (shippingDebounceTimer) clearTimeout(shippingDebounceTimer)
  // Clean up MercadoPago bricks
  try {
    const { usePixBricks } = await import('../composables/usePixBricks')
    const pixBricks = usePixBricks()
    await pixBricks.unmount()
  } catch {
    // Ignore cleanup errors
  }
})

// Stop pix polling when navigating away from checkout
watch(() => route.path, (newPath) => {
  if (!newPath.startsWith('/checkout') && pixPollingTimer) {
    clearInterval(pixPollingTimer)
    pixPollingTimer = null
  }
})

// Auto-fill checkout form from auth store's saved location on mount
onMounted(() => {
  const savedLocation = authStore.userLocation
  if (!savedLocation) return

  // Only fill fields that are currently empty
  if (!customerInfo.address && savedLocation.street) {
    customerInfo.address = savedLocation.street
  }
  if (!customerInfo.number && savedLocation.number) {
    customerInfo.number = savedLocation.number
  }
  if (!customerInfo.neighborhood && savedLocation.neighborhood) {
    customerInfo.neighborhood = savedLocation.neighborhood
  }
  if (!customerInfo.city && savedLocation.city) {
    customerInfo.city = savedLocation.city
  }
  if (!customerInfo.state && savedLocation.state) {
    customerInfo.state = savedLocation.state
  }
  if (!customerInfo.postalCode && savedLocation.postalCode) {
    customerInfo.postalCode = savedLocation.postalCode
    customerInfo.cep = savedLocation.postalCode
  }
  if (savedLocation.countryCode && !customerInfo.country) {
    customerInfo.country = savedLocation.countryCode
  }
})
</script>

<style scoped>
.checkout-page {
  padding: clamp(1.5rem, 4vh, 2rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vh, 4rem);
  max-width: min(48rem, 92vw);
  margin: 0 auto;
}

.checkout-page__title {
  font-size: clamp(1.375rem, 3.5vw, 1.75rem);
  font-weight: 700;
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
  text-align: center;
  color: var(--text-primary);
}

.checkout-page__step {
  margin-top: clamp(1.25rem, 3vh, 2rem);
  animation: step-fade 0.3s ease;
}

@keyframes step-fade {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.checkout-page__step-title {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 600;
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
  color: var(--text-primary);
}

.checkout-page__empty {
  text-align: center;
  padding: clamp(2rem, 6vh, 3rem) 0;
  color: var(--text-muted);
}

/* Fulfillment groups */
.checkout-page__group {
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.checkout-page__group-header {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  margin-bottom: clamp(0.5rem, 1.2vh, 0.75rem);
  padding-bottom: clamp(0.375rem, 0.75vh, 0.5rem);
  border-bottom: 2px solid var(--border);
}

.checkout-page__group-header--uma-penca {
  border-bottom-color: var(--accent);
}

.checkout-page__group-header--digital {
  border-bottom-color: var(--success);
}

.checkout-page__group-title {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-weight: 600;
  color: var(--text-primary);
}

.checkout-page__group-title--uma-penca {
  color: var(--accent);
}

.checkout-page__group-title--digital {
  color: var(--success);
}

.checkout-page__group-badge {
  margin-left: auto;
  padding: clamp(0.1rem, 0.3vw, 0.2rem) clamp(0.4rem, 0.8vw, 0.6rem);
  background: var(--accent-light);
  color: var(--accent);
  font-size: clamp(0.55rem, 1vw, 0.65rem);
  font-weight: 600;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Cart items */
.checkout-page__items {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vh, 0.5rem);
}

.checkout-item {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.625rem, 1.2vw, 1rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.checkout-item:hover {
  border-color: var(--accent-subtle);
  box-shadow: var(--shadow-sm);
}

.checkout-item--uma-penca {
  border-left: 3px solid #8b5cf6;
}

.checkout-item--digital {
  border-left: 3px solid #10b981;
}

.checkout-item__img-wrap {
  width: clamp(2.5rem, 5vw, 3rem);
  height: clamp(2.5rem, 5vw, 3rem);
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--surface-2);
}

.checkout-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.checkout-item__details {
  flex: 1;
  min-width: 0;
}

.checkout-item__name {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-primary);
}

.checkout-item__size {
  color: var(--text-secondary);
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
}

.checkout-item__qty {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-muted);
  white-space: nowrap;
}

.checkout-item__price {
  font-family: var(--font-mono);
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

/* Totals */
.checkout-page__totals {
  margin-top: clamp(0.75rem, 1.5vh, 1rem);
  padding-top: clamp(0.75rem, 1.5vh, 1rem);
  border-top: 2px solid var(--border);
}

.checkout-page__total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.25rem, 0.5vh, 0.375rem) 0;
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-secondary);
}

.checkout-page__total-line--final {
  padding-top: clamp(0.5rem, 1vh, 0.75rem);
  margin-top: clamp(0.25rem, 0.5vh, 0.375rem);
  border-top: 1px solid var(--border);
  font-weight: 600;
  color: var(--text-primary);
}

.checkout-page__total-value {
  font-family: var(--font-mono);
  font-weight: 500;
}

.checkout-page__total-price {
  font-family: var(--font-mono);
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: var(--accent);
}

/* Form */
.checkout-page__form {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vh, 1rem);
}

.checkout-page__form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(0.5rem, 1vw, 0.75rem);
}

.checkout-page__form-section {
  margin-top: clamp(0.5rem, 1.2vh, 0.75rem);
  padding-top: clamp(0.5rem, 1.2vh, 0.75rem);
  border-top: 1px solid var(--border);
}

.checkout-page__form-section-title {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: clamp(0.5rem, 1vw, 0.75rem);
}

@media (max-width: 560px) {
  .checkout-page__form-grid {
    grid-template-columns: 1fr;
  }
}

/* Address guessing game */
.checkout-page__address-game {
  padding: clamp(1rem, 2.5vw, 1.25rem);
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vh, 0.75rem);
}

.checkout-page__address-game-header {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.625rem);
}

.checkout-page__address-game-title {
  font-size: clamp(0.9rem, 1.6vw, 1rem);
  font-weight: 600;
  color: var(--text-primary);
}

.checkout-page__address-game-desc {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
  margin: 0;
}

/* Country selector */
.checkout-page__select {
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(0.625rem, 1.2vw, 1rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-0);
  color: var(--text-primary);
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
}

.checkout-page__select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

.checkout-page__select:hover {
  border-color: var(--accent-subtle);
}

/* Sections in step 3 */
.checkout-page__section {
  margin-bottom: clamp(1.25rem, 3vh, 1.75rem);
}

.checkout-page__section-label {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: clamp(0.5rem, 1.2vh, 0.75rem);
}

.checkout-page__provider-prompt {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-secondary);
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
}

/* Summary */
.checkout-page__summary {
  margin-top: clamp(0.75rem, 1.5vh, 1rem);
  padding: clamp(0.75rem, 1.5vw, 1rem);
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.checkout-page__summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.25rem, 0.5vh, 0.375rem) 0;
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-secondary);
}

.checkout-page__summary-row--total {
  padding-top: clamp(0.5rem, 1vh, 0.75rem);
  margin-top: clamp(0.25rem, 0.5vh, 0.375rem);
  border-top: 1px solid var(--border);
  font-weight: 600;
  font-size: clamp(0.9rem, 1.6vw, 1rem);
  color: var(--text-primary);
}

/* Navigation */
.checkout-page__nav {
  display: flex;
  justify-content: flex-end;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
  margin-top: clamp(1.25rem, 3vh, 2rem);
}

/* Error */
.checkout-page__error {
  margin-top: clamp(0.625rem, 1.5vh, 1rem);
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.625rem, 1.2vw, 1rem);
  background: var(--danger-light);
  color: var(--danger);
  border-radius: var(--radius-md);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
}

/* Redirect card */
.checkout-page__redirect-card {
  max-width: min(30rem, 90vw);
  margin: 0 auto clamp(1.5rem, 3vh, 2rem);
  padding: clamp(1.5rem, 3.5vw, 2rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.625rem, 1.5vh, 1rem);
  animation: scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.checkout-page__redirect-title {
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 600;
  color: var(--text-primary);
}

.checkout-page__redirect-desc {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-secondary);
}

/* PIX Bricks container */
.checkout-page__bricks-container {
  max-width: min(30rem, 90vw);
  margin: 0 auto;
}

.checkout-page__bricks-wrap {
  min-height: clamp(12rem, 30vh, 18rem);
}

.checkout-page__bricks-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.5rem, 1.2vh, 0.75rem);
  padding: clamp(2rem, 5vh, 3rem) 0;
  color: var(--text-secondary);
}

.checkout-page__spinner {
  width: clamp(2rem, 4.5vw, 2.25rem);
  height: clamp(2rem, 4.5vw, 2.25rem);
  border: 3px solid var(--surface-2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
