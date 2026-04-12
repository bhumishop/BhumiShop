<template>
  <div class="cart-page container">
    <h1 class="cart-page__title">{{ $t('cart.title') }}</h1>
    <p class="cart-page__subtitle">{{ $t('cart.subtitle') }}</p>
    <div class="cart-page__actions">
      <BaseButton variant="secondary" @click="cartStore.openDrawer()">
        {{ $t('cart.openCart') }}
      </BaseButton>
      <BaseButton variant="primary" @click="$router.push('/checkout')" :disabled="cartStore.items.length === 0">
        {{ $t('cart.checkout') }}
      </BaseButton>
    </div>

    <div v-if="cartStore.items.length > 0" class="cart-page__list">
      <div v-for="item in cartStore.items" :key="`${item.id}_${item.size || 'default'}`" class="cart-page__item">
        <div class="cart-page__item-img">
          <img v-if="item.image && (item.image.startsWith('data:') || item.image.startsWith('http'))" :src="item.image" :alt="item.name" loading="lazy" />
          <div v-else class="cart-page__item-placeholder">{{ item.name?.charAt(0) || '?' }}</div>
        </div>
        <div class="cart-page__item-info">
          <h3>{{ item.name }}</h3>
          <p v-if="item.size" class="cart-page__item-size">{{ $t('cart.size') }} {{ item.size }}</p>
          <p class="cart-page__item-price">R$ {{ formatPrice(item.price * item.quantity) }}</p>
          <div class="cart-page__item-qty">
            <button @click="cartStore.updateQuantity(item.id, item.quantity - 1, item.size)">−</button>
            <span>{{ item.quantity }}</span>
            <button @click="cartStore.updateQuantity(item.id, item.quantity + 1, item.size)">+</button>
          </div>
        </div>
        <button class="cart-page__item-remove" @click="cartStore.removeItem(item.id, item.size)" :aria-label="$t('cart.remove')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-else class="cart-page__empty">
      <p>{{ $t('cart.empty') }}</p>
      <BaseButton variant="primary" @click="$router.push('/produtos')">{{ $t('cart.viewProducts') }}</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart'
import BaseButton from '../components/common/BaseButton.vue'

const cartStore = useCartStore()

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}
</script>

<style scoped>
.cart-page {
  padding: clamp(1.5rem, 4vh, 2rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vh, 4rem);
}

.cart-page__title {
  font-size: clamp(1.375rem, 3.5vw, 1.75rem);
  font-weight: 700;
  margin-bottom: clamp(0.375rem, 1vh, 0.5rem);
}

.cart-page__subtitle {
  color: var(--text-secondary);
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.cart-page__actions {
  display: flex;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.cart-page__list {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vh, 1rem);
}

.cart-page__item {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  padding: clamp(0.75rem, 1.5vw, 1rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  position: relative;
  transition: all var(--transition-fast);
}

.cart-page__item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--accent-subtle);
}

.cart-page__item-img {
  width: clamp(3.5rem, 8vw, 4rem);
  height: clamp(3.5rem, 8vw, 4rem);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface-2);
  flex-shrink: 0;
}

.cart-page__item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-page__item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-muted);
}

.cart-page__item-info {
  flex: 1;
}

.cart-page__item-info h3 {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-weight: 500;
  margin-bottom: clamp(0.0625rem, 0.2vh, 0.125rem);
}

.cart-page__item-size {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-muted);
}

.cart-page__item-price {
  font-family: var(--font-mono);
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-weight: 600;
  margin-top: clamp(0.125rem, 0.3vh, 0.25rem);
}

.cart-page__item-qty {
  display: inline-flex;
  align-items: center;
  margin-top: clamp(0.375rem, 0.75vh, 0.5rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.cart-page__item-qty button {
  width: clamp(1.625rem, 3vw, 1.875rem);
  height: clamp(1.625rem, 3vw, 1.875rem);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
}

.cart-page__item-qty button:hover {
  background: var(--surface-2);
}

.cart-page__item-qty span {
  width: clamp(1.75rem, 3.5vw, 2rem);
  text-align: center;
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 600;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  line-height: clamp(1.625rem, 3vw, 1.875rem);
}

.cart-page__item-remove {
  color: var(--text-muted);
  transition: color var(--transition-fast);
  padding: clamp(0.375rem, 0.75vw, 0.5rem);
}

.cart-page__item-remove:hover {
  color: var(--danger);
}

.cart-page__empty {
  text-align: center;
  padding: clamp(2.5rem, 8vh, 4rem) clamp(1rem, 3vw, 1.5rem);
  color: var(--text-muted);
}

.cart-page__empty p {
  margin-bottom: clamp(0.75rem, 2vh, 1rem);
}
</style>
