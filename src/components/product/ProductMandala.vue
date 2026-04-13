<template>
  <div class="mandala" v-if="relatedProducts.length > 0">
    <h3 class="mandala__title">{{ $t('productDetail.relatedItems') }}</h3>
    <p class="mandala__subtitle">{{ $t('productDetail.relatedSubtitle') }}</p>

    <div class="mandala__flower" ref="flowerRef">
      <!-- Center: current product -->
      <div class="mandala__center">
        <div class="mandala__center-inner">
          <img
            v-if="currentProductImage"
            :src="currentProductImage"
            :alt="productName"
            class="mandala__center-img"
          />
          <span v-else class="mandala__center-placeholder">{{ productName?.charAt(0) || '?' }}</span>
        </div>
        <div class="mandala__center-label">{{ productName }}</div>
      </div>

      <!-- Petals: related products -->
      <div
        v-for="(product, index) in displayedProducts"
        :key="product.id"
        class="mandala__petal-wrapper"
        :style="getPetalPosition(index, displayedProducts.length)"
      >
        <router-link
          :to="`/produtos/${product.id}`"
          class="mandala__petal"
          :title="product.name"
        >
          <img
            v-if="product.image && (product.image.startsWith('data:') || product.image.startsWith('http') || product.image.startsWith('/'))"
            :src="product.image"
            :alt="product.name"
            class="mandala__petal-img"
          />
          <span v-else class="mandala__petal-placeholder">{{ product.name?.charAt(0) || '?' }}</span>
          <div class="mandala__petal-overlay">
            <span class="mandala__petal-name">{{ product.name }}</span>
            <span class="mandala__petal-price">R$ {{ formatPrice(product.price) }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  currentProduct: { type: Object, required: true },
  relatedProducts: { type: Array, default: () => [] }
})

const { t } = useI18n()
const flowerRef = ref(null)

const displayedProducts = computed(() => props.relatedProducts.slice(0, 8))

const currentProductImage = computed(() => {
  const img = props.currentProduct?.image
  if (img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/'))) {
    return img
  }
  return null
})

const productName = computed(() => props.currentProduct?.name || '')

function getPetalPosition(index, total) {
  const angle = (360 / total) * index - 90
  const radius = window.innerWidth < 768 ? 120 : 150
  const radian = (angle * Math.PI) / 180
  const x = Math.cos(radian) * radius
  const y = Math.sin(radian) * radius

  return {
    transform: `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
    '--petal-angle': `${angle}deg`
  }
}

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

onMounted(() => {
  // Recalculate positions on resize
  window.addEventListener('resize', () => {
    if (flowerRef.value) {
      flowerRef.value.querySelectorAll('.mandala__petal-wrapper').forEach((el, index) => {
        Object.assign(el.style, getPetalPosition(index, displayedProducts.value.length))
      })
    }
  })
})
</script>

<style scoped>
.mandala {
  margin-top: clamp(2rem, 5vh, 3rem);
  padding: clamp(1.5rem, 3vw, 2.5rem);
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  text-align: center;
}

.mandala__title {
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 700;
  margin-bottom: clamp(0.25rem, 0.5vh, 0.5rem);
  letter-spacing: -0.01em;
}

.mandala__subtitle {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-muted);
  margin-bottom: clamp(1.5rem, 3vh, 2rem);
}

.mandala__flower {
  position: relative;
  width: clamp(280px, 50vw, 380px);
  height: clamp(280px, 50vw, 380px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Decorative ring */
.mandala__flower::before {
  content: '';
  position: absolute;
  width: 85%;
  height: 85%;
  border-radius: 50%;
  border: 2px dashed var(--border);
  opacity: 0.5;
  animation: mandala-spin 30s linear infinite;
}

@keyframes mandala-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Center product */
.mandala__center {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mandala__center-inner {
  width: clamp(72px, 12vw, 96px);
  height: clamp(72px, 12vw, 96px);
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-2);
  border: 3px solid var(--accent);
  box-shadow: 0 0 20px var(--accent-subtle), 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform var(--transition-smooth), box-shadow var(--transition-smooth);
}

.mandala__center-inner:hover {
  transform: scale(1.05);
  box-shadow: 0 0 28px var(--accent-subtle), 0 6px 16px rgba(0, 0, 0, 0.4);
}

.mandala__center-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mandala__center-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--text-muted);
}

.mandala__center-label {
  margin-top: clamp(0.375rem, 0.75vh, 0.5rem);
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  color: var(--text-secondary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Petals */
.mandala__petal-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -32px;
  margin-top: -32px;
  transition: transform var(--transition-smooth);
  z-index: 1;
}

.mandala__petal {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  position: relative;
}

.mandala__petal:hover {
  transform: scale(1.15);
  z-index: 10;
}

.mandala__petal-img,
.mandala__petal-placeholder {
  width: clamp(52px, 9vw, 64px);
  height: clamp(52px, 9vw, 64px);
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-2);
  border: 2px solid var(--border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.mandala__petal:hover .mandala__petal-img,
.mandala__petal:hover .mandala__petal-placeholder {
  border-color: var(--accent);
  box-shadow: 0 4px 16px var(--accent-subtle), 0 2px 8px rgba(0, 0, 0, 0.3);
}

.mandala__petal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mandala__petal-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.875rem, 1.5vw, 1.125rem);
  font-weight: 700;
  color: var(--text-muted);
}

/* Hover overlay with product info */
.mandala__petal-overlay {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.75rem);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  box-shadow: var(--shadow-md);
  z-index: 20;
}

.mandala__petal:hover .mandala__petal-overlay {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.mandala__petal-name {
  display: block;
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  font-weight: 600;
  color: var(--text-primary);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mandala__petal-price {
  display: block;
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  color: var(--green-adorn);
  font-family: var(--font-mono);
  margin-top: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .mandala__flower::before {
    animation: none;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .mandala__flower {
    width: clamp(260px, 85vw, 320px);
    height: clamp(260px, 85vw, 320px);
  }
}

@media (max-width: 480px) {
  .mandala__flower {
    width: clamp(240px, 90vw, 280px);
    height: clamp(240px, 90vw, 280px);
  }
}
</style>
