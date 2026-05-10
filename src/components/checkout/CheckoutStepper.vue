<template>
  <div class="checkout-stepper">
    <div
      v-for="(step, index) in steps"
      :key="index"
      :class="[
        'checkout-stepper__step',
        { 'checkout-stepper__step--active': index === current, 'checkout-stepper__step--done': index < current }
      ]"
    >
      <div class="checkout-stepper__circle">
        <svg v-if="index < current" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <span class="checkout-stepper__label">{{ step }}</span>
      <div v-if="index < steps.length - 1" class="checkout-stepper__line" :class="{ 'checkout-stepper__line--done': index < current }"></div>
    </div>

    <!-- External provider indicator -->
    <div v-if="hasExternalProviders" class="checkout-stepper__provider-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      <span>{{ providerLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '../../stores/cart'

defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, default: 0 }
})

const cartStore = useCartStore()

const hasExternalProviders = computed(() => {
  return cartStore.hasUmaPencaItems
})

const providerLabel = computed(() => {
  const providers = []
  if (cartStore.hasUmaPencaItems) providers.push('UmaPenca')
  return providers.join(' + ')
})
</script>

<style scoped>
.checkout-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: clamp(1rem, 2.5vh, 1.5rem) 0;
  position: relative;
  flex-wrap: wrap;
}

.checkout-stepper__step {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  position: relative;
}

.checkout-stepper__circle {
  width: clamp(2rem, 4.5vw, 2.25rem);
  height: clamp(2rem, 4.5vw, 2.25rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 600;
  border: 2px solid var(--border);
  color: var(--text-muted);
  background: var(--surface-0);
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.checkout-stepper__step--active .checkout-stepper__circle {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
  box-shadow: var(--glow-accent);
}

.checkout-stepper__step--done .checkout-stepper__circle {
  border-color: var(--success);
  background: var(--success);
  color: white;
  box-shadow: 0 0 clamp(0.5rem, 1.5vw, 0.75rem) var(--success-light);
}

.checkout-stepper__label {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

.checkout-stepper__step--active .checkout-stepper__label {
  color: var(--accent);
  font-weight: 600;
}

.checkout-stepper__step--done .checkout-stepper__label {
  color: var(--success);
}

.checkout-stepper__line {
  width: clamp(1.5rem, 4vw, 2.5rem);
  height: 2px;
  background: var(--border);
  margin: 0 clamp(0.375rem, 0.75vw, 0.5rem);
  transition: background var(--transition-base);
  border-radius: var(--radius-full);
}

.checkout-stepper__line--done {
  background: var(--success);
}

/* External provider badge */
.checkout-stepper__provider-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  background: var(--accent-light);
  border: 1px solid var(--accent-subtle);
  border-radius: var(--radius-sm, 0.25rem);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--accent);
  margin-top: 0.5rem;
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .checkout-stepper__label {
    display: none;
  }

  .checkout-stepper__line {
    width: clamp(1rem, 3vw, 1.5rem);
  }

  .checkout-stepper__provider-badge {
    font-size: 0.6rem;
    padding: 0.15rem 0.4rem;
  }
}
</style>
