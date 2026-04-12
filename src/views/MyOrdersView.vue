<template>
  <div class="orders-page container">
    <h1 class="orders-page__title">{{ $t('myOrders.title') }}</h1>

    <div v-if="orderStore.loading" class="orders-page__loading">
      <BaseSkeleton v-for="i in 3" :key="i" variant="card" />
    </div>

    <div v-else-if="orderStore.orders.length === 0" class="orders-page__empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      <p>{{ $t('myOrders.empty') }}</p>
      <BaseButton variant="primary" @click="$router.push('/produtos')">{{ $t('myOrders.viewProducts') }}</BaseButton>
    </div>

    <div v-else class="orders-page__list">
      <div v-for="order in orderStore.orders" :key="order.id" class="order-card">
        <div class="order-card__header">
          <div>
            <h3 class="order-card__number">{{ order.order_number }}</h3>
            <p class="order-card__date">{{ formatDate(order.created_at) }}</p>
          </div>
          <div class="order-card__badges">
            <BaseBadge :variant="statusVariant(order.status)" size="sm">
              {{ statusLabel(order.status) }}
            </BaseBadge>
            <BaseBadge :variant="paymentVariant(order.payment_status)" size="sm">
              {{ paymentLabel(order.payment_status) }}
            </BaseBadge>
          </div>
        </div>
        <div class="order-card__body">
          <p class="order-card__total">{{ $t('myOrders.labels.total') }} <strong>R$ {{ formatPrice(order.total) }}</strong></p>
          <p class="order-card__method">{{ order.payment_method === 'pix' ? $t('myOrders.labels.pixPayment') : $t('myOrders.labels.cardPayment') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useOrderStore } from '../stores/orders'
import BaseBadge from '../components/common/BaseBadge.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseSkeleton from '../components/common/BaseSkeleton.vue'

const authStore = useAuthStore()
const orderStore = useOrderStore()
const { t } = useI18n()

onMounted(async () => {
  if (authStore.user?.id) {
    await orderStore.fetchOrders(authStore.user.id)
  }
})

function formatPrice(val) {
  return Number(val).toFixed(2).replace('.', ',')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function statusLabel(status) {
  return t(`myOrders.status.${status}`)
}

function statusVariant(status) {
  const map = {
    pending: 'warning',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'default'
}

function paymentLabel(status) {
  return t(`myOrders.payment.${status}`)
}

function paymentVariant(status) {
  const map = {
    pending: 'warning',
    paid: 'success',
    failed: 'danger',
    refunded: 'default'
  }
  return map[status] || 'default'
}
</script>

<style scoped>
.orders-page {
  padding: clamp(1.5rem, 4vh, 2rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vh, 4rem);
  max-width: min(45rem, 90vw);
  margin: 0 auto;
}

.orders-page__title {
  font-size: clamp(1.375rem, 3.5vw, 1.75rem);
  font-weight: 700;
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.orders-page__loading {
  display: flex;
  flex-direction: column;
  gap: clamp(0.625rem, 1.5vh, 1rem);
}

.orders-page__empty {
  text-align: center;
  padding: clamp(2.5rem, 8vh, 4rem) 0;
  color: var(--text-muted);
}

.orders-page__empty svg {
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
}

.orders-page__empty p {
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.orders-page__list {
  display: flex;
  flex-direction: column;
  gap: clamp(0.625rem, 1.5vh, 1rem);
}

.order-card {
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: fade-in-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
  transition: all var(--transition-fast);
}

.order-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--accent-subtle);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: clamp(0.875rem, 2vw, 1.25rem) clamp(1rem, 2.5vw, 1.5rem);
  border-bottom: 1px solid var(--surface-2);
}

.order-card__number {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-weight: 600;
  font-family: var(--font-mono);
}

.order-card__date {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-muted);
  margin-top: clamp(0.0625rem, 0.2vh, 0.125rem);
}

.order-card__badges {
  display: flex;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.order-card__body {
  padding: clamp(0.625rem, 1.5vw, 1rem) clamp(1rem, 2.5vw, 1.5rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-card__total {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-primary);
}

.order-card__total strong {
  font-family: var(--font-mono);
}

.order-card__method {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .order-card__header {
    flex-direction: column;
    gap: clamp(0.5rem, 1.2vh, 0.75rem);
  }

  .order-card__body {
    flex-direction: column;
    gap: clamp(0.375rem, 0.75vh, 0.5rem);
    align-items: flex-start;
  }
}
</style>
