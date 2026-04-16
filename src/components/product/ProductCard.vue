<template>
  <Magnet
    :padding="5"
    :disabled="false"
    :magnet-strength="150"
    active-transition="transform 0.1s ease-out"
    inactive-transition="transform 0.3s ease-in-out"
    wrapper-class-name="product-card-magnet-wrapper"
    inner-class-name="product-card-magnet-inner"
  >
    <BorderGlow
      :edgeSensitivity="30"
      glowColor="40 80 80"
      backgroundColor="#060010"
      :borderRadius="28"
      :glowRadius="40"
      :glowIntensity="1"
      :coneSpread="25"
      :animated="false"
      :colors="['#c084fc', '#f472b6', '#38bdf8']"
    >
      <div
        class="product-card"
        ref="cardRef"
        :class="{ 'product-card--large': isLarge, 'product-card--tall': isTall }"
        @click="$router.push(`/produtos/${product.id}`)"
      >
        <div class="product-card__image-wrap">
          <img
            v-if="displayImage && (displayImage.startsWith('data:') || displayImage.startsWith('http'))"
            :src="displayImage"
            :alt="product.name"
            class="product-card__image"
            loading="lazy"
          />
          <div v-else class="product-card__placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>

          <div class="product-card__badges">
            <span v-if="isUmaPenca" class="product-card__badge product-card__badge--uma">
              Uma Penca
            </span>
            <span v-if="isDigital" class="product-card__badge product-card__badge--digital">
              Digital
            </span>
            <span v-if="isOnDemand" class="product-card__badge product-card__badge--ondemand">
              Print-on-Demand
            </span>
          </div>

          <div class="product-card__overlay">
            <button class="product-card__quick-cart" @click.stop="addToCart" aria-label="Add to cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </button>
            <button class="product-card__quick-add" @click.stop="$router.push(`/produtos/${product.id}`)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              See product
            </button>
          </div>
        </div>

        <div class="product-card__body">
          <div class="product-card__meta">
            <p class="product-card__category">{{ categoryName }}</p>
            <p v-if="product.artist" class="product-card__artist">{{ product.artist }}</p>
          </div>
          <h3 class="product-card__name">{{ product.name }}</h3>
          <p class="product-card__price">R$ {{ formatPrice(product.price) }}</p>
        </div>
      </div>
    </BorderGlow>
  </Magnet>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '../../stores/cart'
import { useProductStore } from '../../stores/products'
import { useToastStore } from '../../stores/toast'
import Magnet from '../common/Magnet.vue'
import BorderGlow from '../common/BorderGlow.vue'

const { t } = useI18n()

const props = defineProps({
  product: { type: Object, required: true },
  size: { type: String, default: 'normal' } // 'normal', 'large', 'tall'
})

const cardRef = ref(null)

const isLarge = computed(() => props.size === 'large')
const isTall = computed(() => props.size === 'tall')

/**
 * Get the correct display image. For t-shirts, product.image points to
 * a 000 FULLCOLOR swatch. Replace 000_image with 001_image.
 */
const displayImage = computed(() => {
  let img = props.product.image || ''
  if (img && img.includes('000_image')) {
    img = img.replace('000_image', '001_image')
  }
  return img
})

const cartStore = useCartStore()
const productStore = useProductStore()
const toast = useToastStore()

const categoryName = computed(() => {
  const cat = productStore.categories.find(c => c.id === props.product.category)
  return cat?.name || props.product.category || ''
})

const isUmaPenca = computed(() => {
  const ft = props.product.fulfillment_type
  return ft === 'uma_penca' || ft === 'uma penca'
})
const isDigital = computed(() => props.product.fulfillment_type === 'digital')
const isOnDemand = computed(() => props.product.stock_type === 'print-on-demand')

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
.product-card-magnet-wrapper {
  display: block !important;
  width: 100%;
}

.product-card-magnet-inner {
  display: block;
  width: 100%;
}

.product-card {
  background: var(--surface-0);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border: 0.0625rem solid rgba(255, 255, 255, 0.06);
}

/* Variable sizing for masonry */
.product-card--large {
  grid-column: span 2;
}

.product-card--tall {
  grid-row: span 2;
}

.product-card__image-wrap {
  position: relative;
  overflow: hidden;
  background: var(--surface-2);
  aspect-ratio: 1 / 1;
}

.product-card--tall .product-card__image-wrap {
  aspect-ratio: 4 / 5;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-card__image {
  transform: scale(1.04);
}

.product-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: var(--surface-2);
}

.product-card__badges {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 3;
}

.product-card__badge {
  padding: 0.125rem 0.4375rem;
  font-size: 0.55rem;
  font-weight: 600;
  border-radius: 0.25rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.product-card__badge--uma {
  background: rgba(139, 92, 246, 0.9);
  color: white;
}

.product-card__badge--digital {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.product-card__badge--ondemand {
  background: rgba(82, 82, 91, 0.9);
  color: var(--text-primary);
  border: 0.0625rem solid rgba(255, 255, 255, 0.08);
}

.product-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
}

.product-card:hover .product-card__overlay {
  opacity: 1;
}

.product-card__quick-cart {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  color: #111;
  border: none;
  border-radius: 0.375rem;
  transition: transform 0.15s ease, background 0.15s ease;
  cursor: pointer;
}

.product-card__quick-cart:hover {
  transform: scale(1.04);
  background: #ffffff;
}

.product-card__quick-cart svg {
  flex-shrink: 0;
}

.product-card__quick-add {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4375rem 0.875rem;
  background: white;
  color: #111;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  border-radius: 0.375rem;
  transition: transform 0.15s ease;
}

.product-card__quick-add:hover {
  transform: scale(1.04);
}

.product-card__quick-add svg {
  flex-shrink: 0;
}

.product-card__body {
  padding: 0.75rem 0.875rem 0.875rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  min-height: 1rem;
}

.product-card__category {
  font-size: 0.6rem;
  font-weight: 500;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.product-card__artist {
  font-size: 0.6rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-card__name {
  font-size: 0.825rem;
  font-weight: 400;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__price {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-top: auto;
}

@media (max-width: 768px) {
  .product-card--large {
    grid-column: span 1;
  }

  .product-card__body {
    padding: 0.625rem 0.75rem 0.75rem;
  }

  .product-card__name {
    font-size: 0.775rem;
  }

  .product-card__price {
    font-size: 0.85rem;
  }
}
</style>
