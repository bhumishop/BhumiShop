<template>
  <div class="order-confirmation">
    <div class="order-confirmation__icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="62" stroke-dashoffset="0" style="animation: checkmark-circle 0.5s ease forwards;"/>
        <path d="M8 12l3 3 5-5" stroke-dasharray="20" stroke-dashoffset="0" style="animation: checkmark-check 0.3s ease 0.3s forwards;"/>
      </svg>
    </div>

    <h2 class="order-confirmation__title">{{ $t('orderConfirmation.title') }}</h2>

    <p class="order-confirmation__message">
      <template v-if="orderNumber">{{ $t('orderConfirmation.message', { orderNumber: orderNumber }) }}</template>
      <template v-else>{{ $t('orderConfirmation.message', { orderNumber: '' }) }}</template>
    </p>

    <div v-if="paymentMethod === 'billing' && billingUrl" class="order-confirmation__action">
      <p class="order-confirmation__instruction">{{ $t('orderConfirmation.instructions') }}</p>
      <BaseButton variant="primary" @click="goToBilling">
        {{ $t('orderConfirmation.goToPayment') }}
      </BaseButton>
    </div>

    <div v-else-if="paymentMethod === 'pix'" class="order-confirmation__action">
      <p class="order-confirmation__instruction">
        {{ $t('orderConfirmation.pixInstruction') }}
      </p>
    </div>

    <div class="order-confirmation__links">
      <router-link to="/minhas-compras" class="order-confirmation__link">
        {{ $t('orderConfirmation.viewOrders') }}
      </router-link>
      <router-link to="/produtos" class="order-confirmation__link">
        {{ $t('orderConfirmation.continueShopping') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  orderNumber: String,
  paymentMethod: String,
  billingUrl: String
})

function goToBilling() {
  if (props.billingUrl) {
    window.location.href = props.billingUrl
  }
}
</script>

<style scoped>
.order-confirmation {
  text-align: center;
  padding: clamp(2rem, 5vh, 3rem) clamp(0.75rem, 2vw, 1rem);
  max-width: min(30rem, 90vw);
  margin: 0 auto;
}

.order-confirmation__icon {
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
  animation: bounce-in 0.5s ease;
}

.order-confirmation__title {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--success);
  margin-bottom: clamp(0.375rem, 0.75vh, 0.5rem);
}

.order-confirmation__message {
  color: var(--text-secondary);
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.order-confirmation__action {
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.order-confirmation__instruction {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-secondary);
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
}

.order-confirmation__links {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vh, 0.5rem);
}

.order-confirmation__link {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--accent);
  font-weight: 500;
}

.order-confirmation__link:hover {
  text-decoration: underline;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes checkmark-circle {
  0% { stroke-dashoffset: 62; }
  100% { stroke-dashoffset: 0; }
}

@keyframes checkmark-check {
  0% { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 0; }
}
</style>
