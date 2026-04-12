<template>
  <div class="payment-method">
    <h3 class="payment-method__title">{{ $t('payment.title') }}</h3>

    <div class="payment-method__options">
      <!-- PIX (AbacatePay) -->
      <button
        v-if="showPix"
        :class="['payment-method__option', { 'payment-method__option--active': modelValue === 'pix' }]"
        @click="select('pix')"
      >
        <div class="payment-method__icon payment-method__icon--pix">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div class="payment-method__info">
          <span class="payment-method__name">{{ $t('payment.pix') }}</span>
          <span class="payment-method__desc">{{ $t('payment.pixDescription') }}</span>
        </div>
        <div class="payment-method__check">
          <svg v-if="modelValue === 'pix'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </button>

      <!-- Cartão de Crédito (AbacatePay) -->
      <button
        v-if="showBilling"
        :class="['payment-method__option', { 'payment-method__option--active': modelValue === 'billing' }]"
        @click="select('billing')"
      >
        <div class="payment-method__icon payment-method__icon--card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div class="payment-method__info">
          <span class="payment-method__name">{{ $t('payment.creditCard') }}</span>
          <span class="payment-method__desc">{{ $t('payment.creditCardDescription') }}</span>
        </div>
        <div class="payment-method__check">
          <svg v-if="modelValue === 'billing'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </button>

      <!-- PIX Bricks Internacional (Mercado Pago) -->
      <button
        v-if="showPixBricks"
        :class="['payment-method__option', { 'payment-method__option--active': modelValue === 'pix_bricks' }]"
        @click="select('pix_bricks')"
      >
        <div class="payment-method__icon payment-method__icon--pix-bricks">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
          </svg>
        </div>
        <div class="payment-method__info">
          <span class="payment-method__name">{{ $t('payment.pixBricks') }}</span>
          <span class="payment-method__desc">{{ $t('payment.pixBricksDescription') }}</span>
          <div class="payment-method__flags">🇧🇷 🇮🇳 🇨🇳</div>
        </div>
        <div class="payment-method__check">
          <svg v-if="modelValue === 'pix_bricks'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </button>

      <!-- Uma Penca -->
      <button
        v-if="showUmaPenca"
        :class="['payment-method__option', { 'payment-method__option--active': modelValue === 'uma_penca' }]"
        @click="select('uma_penca')"
      >
        <div class="payment-method__icon payment-method__icon--uma-penca">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <div class="payment-method__info">
          <span class="payment-method__name">{{ $t('payment.umaPenca') }}</span>
          <span class="payment-method__desc">{{ $t('payment.umaPencaDescription') }}</span>
        </div>
        <div class="payment-method__check">
          <svg v-if="modelValue === 'uma_penca'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'pix' },
  hasUmaPencaItems: { type: Boolean, default: false },
  paymentProvider: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

// Show options based on payment provider selection
const showPix = computed(() => {
  return props.paymentProvider === 'abacatepay' || !props.paymentProvider
})

const showBilling = computed(() => {
  return props.paymentProvider === 'abacatepay' || !props.paymentProvider
})

const showPixBricks = computed(() => {
  return props.paymentProvider === 'pix_bricks'
})

const showUmaPenca = computed(() => {
  return props.hasUmaPencaItems || props.paymentProvider === 'uma_penca'
})

function select(method) {
  emit('update:modelValue', method)
}
</script>

<style scoped>
.payment-method__title {
  font-size: clamp(0.9rem, 1.6vw, 1rem);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
}

.payment-method__options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
}

.payment-method__option {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.625rem, 1.5vw, 0.875rem);
  padding: clamp(0.75rem, 1.8vw, 1rem);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-0);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  position: relative;
}

.payment-method__option:hover {
  border-color: var(--accent-subtle);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.payment-method__option--active {
  border-color: var(--accent);
  background: var(--accent-light);
  box-shadow: var(--glow-accent);
}

.payment-method__icon {
  flex-shrink: 0;
  width: clamp(2.5rem, 5.5vw, 2.75rem);
  height: clamp(2.5rem, 5.5vw, 2.75rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.payment-method__option--active .payment-method__icon {
  color: white;
}

.payment-method__icon--pix {
  background: var(--surface-2);
}

.payment-method__option--active .payment-method__icon--pix {
  background: linear-gradient(135deg, #32cd32, #22c55e);
}

.payment-method__icon--card {
  background: var(--surface-2);
}

.payment-method__option--active .payment-method__icon--card {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.payment-method__icon--pix-bricks {
  background: var(--surface-2);
}

.payment-method__option--active .payment-method__icon--pix-bricks {
  background: linear-gradient(135deg, #009ee3, #0077b6);
}

.payment-method__icon--uma-penca {
  background: var(--surface-2);
}

.payment-method__option--active .payment-method__icon--uma-penca {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.payment-method__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.125rem, 0.3vw, 0.2rem);
}

.payment-method__name {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 600;
  color: var(--text-primary);
}

.payment-method__desc {
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  color: var(--text-secondary);
}

.payment-method__flags {
  margin-top: clamp(0.125rem, 0.3vw, 0.2rem);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  letter-spacing: 0.15em;
}

.payment-method__check {
  flex-shrink: 0;
  width: clamp(1.25rem, 2.5vw, 1.5rem);
  height: clamp(1.25rem, 2.5vw, 1.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border);
  border-radius: 50%;
  color: transparent;
  transition: all var(--transition-fast);
}

.payment-method__option--active .payment-method__check {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

@media (max-width: 560px) {
  .payment-method__options {
    grid-template-columns: 1fr;
  }
}
</style>
