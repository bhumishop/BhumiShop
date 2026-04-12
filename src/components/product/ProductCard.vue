<template>
  <div class="product-card" @click="$router.push(`/produtos/${product.id}`)">
    <div class="product-card__image-wrap">
      <img
        v-if="product.image && (product.image.startsWith('data:') || product.image.startsWith('http'))"
        :src="product.image"
        :alt="product.name"
        class="product-card__image"
        loading="lazy"
      />
      <div v-else class="product-card__placeholder">
        {{ product.name?.charAt(0) || '?' }}
      </div>
      <span v-if="isUmaPenca" class="product-card__badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        {{ t('productCard.umaPenca') }}
      </span>
      <span v-if="isDigital" class="product-card__badge product-card__badge--digital">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
        {{ t('productCard.digital') }}
      </span>
    </div>
    <div class="product-card__body">
      <p class="product-card__category">{{ categoryName }}</p>
      <h3 class="product-card__name">{{ product.name }}</h3>
      <p v-if="product.artist" class="product-card__artist">{{ product.artist }}</p>
      <p class="product-card__price">R$ {{ formatPrice(product.price) }}</p>
      <p v-if="isUmaPenca" class="product-card__fulfillment">
        {{ t('productCard.fulfilledByUmaPenca') }}
      </p>
    </div>
    <div class="product-card__actions">
      <BaseButton variant="primary" size="sm" full @click.stop="addToCart">
        {{ $t('productCard.add') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '../../stores/cart'
import { useProductStore } from '../../stores/products'
import { useToastStore } from '../../stores/toast'
import BaseButton from '../common/BaseButton.vue'

const { t } = useI18n()

const props = defineProps({
  product: { type: Object, required: true }
})

const cartStore = useCartStore()
const productStore = useProductStore()
const toast = useToastStore()

const categoryName = computed(() => {
  const cat = productStore.categories.find(c => c.id === props.product.category)
  return cat?.name || props.product.category || ''
})

const isUmaPenca = computed(() => {
  return props.product.fulfillment_type === 'uma_penca'
})

const isDigital = computed(() => {
  return props.product.fulfillment_type === 'digital'
})

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

function addToCart() {
  cartStore.addItem({
    id: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.image,
    category: props.product.category,
    size: null,
    quantity: 1,
    fulfillment_type: props.product.fulfillment_type || 'own',
    weight: props.product.weight || 0.3,
    dimensions: props.product.dimensions || null,
    shipping_zones: props.product.shipping_zones || null
  })
  toast.success(t('productCard.addedToCart', { name: props.product.name }))
}
</script>

<style scoped>
.product-card {
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-smooth);
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-light), var(--green-adorn-light));
  opacity: 0;
  transition: opacity var(--transition-smooth);
  z-index: 0;
  pointer-events: none;
}

.product-card:hover::before {
  opacity: 0.05;
}

.product-card:hover {
  transform: translateY(clamp(-0.25rem, -0.75vh, -0.5rem));
  box-shadow: var(--shadow-lg), var(--glow-accent);
  border-color: transparent;
}

.product-card:active {
  transform: translateY(0) scale(0.98);
}

.product-card__image-wrap {
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--surface-2);
  position: relative;
  z-index: 1;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-smooth);
}

.product-card:hover .product-card__image {
  transform: scale(1.08);
}

.product-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(2.5rem, 6vw, 3rem);
  font-weight: 700;
  color: var(--text-muted);
  background: var(--surface-2);
}

.product-card__badge {
  position: absolute;
  top: clamp(0.5rem, 1.2vw, 0.75rem);
  left: clamp(0.5rem, 1.2vw, 0.75rem);
  display: flex;
  align-items: center;
  gap: clamp(0.2rem, 0.4vw, 0.3rem);
  padding: clamp(0.2rem, 0.5vw, 0.35rem) clamp(0.4rem, 0.8vw, 0.6rem);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: clamp(0.55rem, 1vw, 0.65rem);
  font-weight: 600;
  border-radius: var(--radius-md);
  letter-spacing: 0.02em;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  animation: badge-pulse 2s ease-in-out infinite;
  z-index: 2;
}

.product-card__badge--digital {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

@keyframes badge-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.product-card__body {
  padding: clamp(0.75rem, 1.5vw, 1rem);
  flex: 1;
  position: relative;
  z-index: 1;
}

.product-card__category {
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  font-weight: 500;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: clamp(0.125rem, 0.3vw, 0.25rem);
}

.product-card__name {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: clamp(0.125rem, 0.3vw, 0.25rem);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__artist {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-secondary);
  margin-bottom: clamp(0.375rem, 0.75vw, 0.5rem);
}

.product-card__price {
  font-family: var(--font-mono);
  font-size: clamp(1rem, 2vw, 1.1rem);
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.product-card__price::before {
  content: '';
  display: inline-block;
  width: clamp(0.25rem, 0.5vw, 0.375rem);
  height: clamp(0.25rem, 0.5vw, 0.375rem);
  background: var(--green-adorn);
  border-radius: var(--radius-full);
  box-shadow: 0 0 clamp(0.25rem, 0.75vw, 0.5rem) var(--green-adorn-glow);
}

.product-card__fulfillment {
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  color: #8b5cf6;
  font-weight: 500;
  margin-top: clamp(0.25rem, 0.5vw, 0.375rem);
  display: flex;
  align-items: center;
  gap: clamp(0.2rem, 0.4vw, 0.25rem);
}

.product-card__fulfillment::before {
  content: '';
  display: inline-block;
  width: clamp(0.2rem, 0.4vw, 0.3rem);
  height: clamp(0.2rem, 0.4vw, 0.3rem);
  background: #8b5cf6;
  border-radius: var(--radius-full);
}

.product-card__actions {
  padding: 0 clamp(0.75rem, 1.5vw, 1rem) clamp(0.75rem, 1.5vw, 1rem);
  position: relative;
  z-index: 1;
}
</style>
