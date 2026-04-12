<template>
  <div class="shipping-calculator">
    <div class="shipping-calculator__header">
      <h3 class="shipping-calculator__title">{{ $t('shipping.calculateShipping') }}</h3>
      <span v-if="selectedState" class="shipping-calculator__state-badge">{{ selectedState }}</span>
    </div>

    <div class="shipping-calculator__input-row">
      <div class="shipping-calculator__cep-wrap">
        <input
          :value="cep"
          type="text"
          class="shipping-calculator__cep-input"
          :placeholder="$t('checkout.step2.placeholders.cep')"
          maxlength="9"
          inputmode="numeric"
          @input="handleCepInput"
          @blur="calculate"
        />
        <button
          class="shipping-calculator__calc-btn"
          :disabled="cepDigits.length !== 8 || calculating"
          @click="calculate"
        >
          <svg v-if="calculating" class="shipping-calculator__spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>
    </div>

    <!-- Free shipping progress bar -->
    <div v-if="ownSubtotal > 0" class="shipping-calculator__progress">
      <div class="shipping-calculator__progress-bar">
        <div
          class="shipping-calculator__progress-fill"
          :style="{ width: `${freeShippingProgress}%` }"
          :class="{ 'shipping-calculator__progress-fill--complete': isFreeShipping }"
        ></div>
      </div>
      <p class="shipping-calculator__progress-text">
        <template v-if="isFreeShipping">
          {{ $t('shipping.freeShippingProgress') }}
        </template>
        <template v-else>
          {{ $t('shipping.freeShippingRemaining', { amount: formatPrice(freeShippingRemaining) }) }}
        </template>
      </p>
    </div>

    <!-- Results -->
    <div v-if="results" class="shipping-calculator__results">
      <div v-if="results.own && results.own.cost !== null" class="shipping-calculator__result shipping-calculator__result--own">
        <div class="shipping-calculator__result-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <span class="shipping-calculator__result-label">{{ $t('shipping.bhumiShopItems') }}</span>
        </div>
        <div class="shipping-calculator__result-details">
          <span class="shipping-calculator__result-cost">
            <template v-if="results.own.cost === 0">{{ $t('checkout.step1.free') }}</template>
            <template v-else>R$ {{ formatPrice(results.own.cost) }}</template>
          </span>
          <span v-if="results.own.days" class="shipping-calculator__result-days">
            {{ $t('shipping.businessDays', { days: results.own.days }) }}
          </span>
        </div>
      </div>

      <div v-if="results.uma_penca && results.uma_penca.cost !== null" class="shipping-calculator__result shipping-calculator__result--uma-penca">
        <div class="shipping-calculator__result-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <span class="shipping-calculator__result-label">{{ $t('shipping.umaPencaItems') }}</span>
        </div>
        <div class="shipping-calculator__result-details">
          <span class="shipping-calculator__result-cost">R$ {{ formatPrice(results.uma_penca.cost) }}</span>
          <span v-if="results.uma_penca.days" class="shipping-calculator__result-days">
            {{ $t('shipping.businessDays', { days: results.uma_penca.days }) }}
          </span>
        </div>
        <p v-if="results.uma_penca.note" class="shipping-calculator__result-note">
          {{ $t('shipping.calculatedByUmaPenca') }}
        </p>
      </div>

      <div v-if="results.digital && results.digital.cost === 0" class="shipping-calculator__result shipping-calculator__result--digital">
        <div class="shipping-calculator__result-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
          <span class="shipping-calculator__result-label">{{ $t('shipping.digitalItems') }}</span>
        </div>
        <div class="shipping-calculator__result-details">
          <span class="shipping-calculator__result-cost shipping-calculator__result-cost--free">{{ $t('shipping.immediateDelivery') }}</span>
        </div>
      </div>

      <div v-if="results.own?.error" class="shipping-calculator__error">
        {{ results.own.error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '../../stores/cart'
import { calculateShipping, getStateFromCEP, getFreeShippingProgress, FREE_SHIPPING_ABOVE } from '../../stores/shipping'

const { t } = useI18n()
const cartStore = useCartStore()

const cep = ref('')
const calculating = ref(false)
const results = ref(null)
const selectedState = ref('')

const cepDigits = computed(() => cep.value.replace(/\D/g, ''))

const ownSubtotal = computed(() => cartStore.ownItemsTotal)

const freeShippingProgress = computed(() => {
  return Math.min((ownSubtotal.value / FREE_SHIPPING_ABOVE) * 100, 100)
})

const freeShippingRemaining = computed(() => {
  return Math.max(FREE_SHIPPING_ABOVE - ownSubtotal.value, 0)
})

const isFreeShipping = computed(() => {
  return ownSubtotal.value >= FREE_SHIPPING_ABOVE
})

function handleCepInput(event) {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 5) {
    value = value.slice(0, 5) + '-' + value.slice(5, 8)
  }
  cep.value = value

  if (value.replace(/\D/g, '').length === 8) {
    const state = getStateFromCEP(value)
    selectedState.value = state || ''
  }
}

function calculate() {
  if (cepDigits.value.length !== 8) return
  calculating.value = true
  results.value = null

  // Simulate brief delay for UX
  setTimeout(() => {
    results.value = calculateShipping(cartStore.items, cep.value)
    calculating.value = false
  }, 300)
}

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

// Expose cep for parent
defineExpose({ cep, results, selectedState })
</script>

<style scoped>
.shipping-calculator {
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: clamp(1rem, 2.5vw, 1.5rem);
}

.shipping-calculator__header {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
}

.shipping-calculator__title {
  font-size: clamp(0.9rem, 1.6vw, 1rem);
  font-weight: 600;
  color: var(--text-primary);
}

.shipping-calculator__state-badge {
  padding: clamp(0.15rem, 0.3vw, 0.25rem) clamp(0.4rem, 0.8vw, 0.6rem);
  background: var(--accent-light);
  color: var(--accent);
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  font-weight: 600;
  border-radius: var(--radius-md);
  letter-spacing: 0.05em;
}

.shipping-calculator__input-row {
  margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
}

.shipping-calculator__cep-wrap {
  display: flex;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.shipping-calculator__cep-input {
  flex: 1;
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 1.5vw, 1rem);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-family: var(--font-mono);
  background: var(--surface-1);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.shipping-calculator__cep-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.shipping-calculator__calc-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(2.5rem, 5vw, 2.75rem);
  height: clamp(2.5rem, 5vw, 2.75rem);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-0);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.shipping-calculator__calc-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.shipping-calculator__calc-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shipping-calculator__spinner {
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.shipping-calculator__progress {
  margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
}

.shipping-calculator__progress-bar {
  width: 100%;
  height: clamp(0.375rem, 0.75vw, 0.5rem);
  background: var(--surface-2);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: clamp(0.375rem, 0.75vw, 0.5rem);
}

.shipping-calculator__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #8b5cf6);
  border-radius: var(--radius-full);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.shipping-calculator__progress-fill--complete {
  background: linear-gradient(90deg, #10b981, #059669);
}

.shipping-calculator__progress-text {
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  color: var(--text-secondary);
  text-align: center;
}

.shipping-calculator__results {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.shipping-calculator__result {
  padding: clamp(0.625rem, 1.2vw, 0.875rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.shipping-calculator__result:hover {
  border-color: var(--accent-subtle);
  box-shadow: var(--shadow-sm);
}

.shipping-calculator__result--uma-penca {
  border-left: 3px solid #8b5cf6;
}

.shipping-calculator__result--digital {
  border-left: 3px solid #10b981;
}

.shipping-calculator__result--own {
  border-left: 3px solid var(--accent);
}

.shipping-calculator__result-header {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  margin-bottom: clamp(0.25rem, 0.5vw, 0.375rem);
}

.shipping-calculator__result-label {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  font-weight: 600;
  color: var(--text-primary);
}

.shipping-calculator__result-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shipping-calculator__result-cost {
  font-family: var(--font-mono);
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-weight: 600;
  color: var(--text-primary);
}

.shipping-calculator__result-cost--free {
  color: #10b981;
  font-family: var(--font-body);
}

.shipping-calculator__result-days {
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  color: var(--text-secondary);
}

.shipping-calculator__result-note {
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  color: var(--text-muted);
  margin-top: clamp(0.25rem, 0.5vw, 0.375rem);
  font-style: italic;
}

.shipping-calculator__error {
  padding: clamp(0.5rem, 1vw, 0.75rem);
  background: var(--danger-light);
  color: var(--danger);
  border-radius: var(--radius-md);
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
}
</style>
