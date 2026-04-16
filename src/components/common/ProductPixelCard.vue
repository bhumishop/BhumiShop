<template>
  <div class="product-pixel-card" :class="pixelCardClassName">
    <!-- Rainbow gradient border (hover only, animated circling) -->
    <div class="product-pixel-card__border" aria-hidden="true"></div>

    <!-- Inner card content (clipped) -->
    <div class="product-pixel-card__inner">

    <!-- Image + Pixel Animation Section -->
    <div
      ref="pixelContainerRef"
      class="product-pixel-card__visual"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <canvas class="product-pixel-card__pixel-canvas" ref="canvasRef" />

      <!-- Content overlaid on the pixel canvas (inside image area only) -->
      <div class="product-pixel-card__image-layer" @click="$router.push(`/produtos/${product.id}`)">
        <img
          v-if="shouldShowImage"
          :src="displayImage"
          :alt="product.name"
          class="product-pixel-card__image"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-else class="product-pixel-card__placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>

        <!-- Gradient overlay at bottom of image for smooth transition -->
        <div class="product-pixel-card__image-gradient"></div>

        <!-- Badges -->
        <div class="product-pixel-card__badges">
          <span v-if="isUmaPenca" class="product-pixel-card__badge product-pixel-card__badge--bundle">
            <svg class="product-pixel-card__badge-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Bundle
          </span>
          <span v-if="isDigital" class="product-pixel-card__badge product-pixel-card__badge--digital">
            <svg class="product-pixel-card__badge-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Digital
          </span>
          <span v-if="isOnDemand" class="product-pixel-card__badge product-pixel-card__badge--ondemand">
            <svg class="product-pixel-card__badge-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            Made to order
          </span>
        </div>
      </div>
    </div>

    <!-- Info Section (outside pixel animation area) -->
    <div class="product-pixel-card__info">
      <div class="product-pixel-card__header">
        <span class="product-pixel-card__category">{{ categoryName }}</span>
        <template v-if="product.artist">
          <span class="product-pixel-card__dot" aria-hidden="true"></span>
          <span class="product-pixel-card__artist">{{ product.artist }}</span>
        </template>
      </div>

      <h3 class="product-pixel-card__name">{{ product.name }}</h3>

      <div class="product-pixel-card__divider"></div>

      <div class="product-pixel-card__footer">
        <div class="product-pixel-card__price-block">
          <span class="product-pixel-card__currency">R$</span>
          <span class="product-pixel-card__price">{{ formatPrice(product.price) }}</span>
        </div>
        <button class="product-pixel-card__add" @click.stop="handleSeeProduct" aria-label="See product">
          <span class="product-pixel-card__add-bg" aria-hidden="true"></span>
          <span class="product-pixel-card__add-shine" aria-hidden="true"></span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span>See product</span>
        </button>
      </div>
    </div>
    </div><!-- /product-pixel-card__inner -->
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '../../stores/cart'
import { useProductStore } from '../../stores/products'
import { useToastStore } from '../../stores/toast'
import { isLikelyBrokenCdnUrl, markImageUrlAsBroken } from '../../utils/brokenImages'

const { t } = useI18n()
const router = useRouter()

const props = defineProps({
  product: { type: Object, required: true },
  pixelCardClassName: { type: String, default: '' }
})

const cartStore = useCartStore()
const productStore = useProductStore()
const toast = useToastStore()

// Pixel animation refs
const pixelContainerRef = ref(null)
const canvasRef = ref(null)
const pixelsRef = ref([])
const animationRef = ref(null)
const timePreviousRef = ref(performance.now())
const reducedMotion = ref(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

// Pixel animation config - warm spectrum (matches rainbow border energy)
const PIXEL_CONFIG = {
  gap: 6,
  speed: 30,
  colors: '#8b5cf6,#a78bfa,#c4b5fd,#7c3aed,#6d28d9,#c084fc,#e879f9'
}

const categoryName = computed(() => {
  const cat = productStore.categories.find(c => c.id === props.product.category)
  return cat?.name || props.product.category || ''
})

const isUmaPenca = computed(() => props.product.fulfillment_type === 'uma_penca')
const isUiclap = computed(() => props.product.fulfillment_type === 'uiclap')
const isThirdParty = computed(() => isUmaPenca.value || isUiclap.value)
const isDigital = computed(() => props.product.fulfillment_type === 'digital')
const isOnDemand = computed(() => props.product.stock_type === 'print-on-demand')

/**
 * Get the external product URL for third-party products.
 */
const productUrl = computed(() => {
  return props.product.product_url || props.product.third_party_product_url || ''
})

/**
 * Get the correct display image for the product.
 * For t-shirts (Uma Penca), `product.image` points to a 000 FULLCOLOR swatch.
 * Replace 000_image with 001_image to show the actual tshirt photo.
 */
const displayImage = computed(() => {
  const p = props.product
  let img = p.image || ''
  if (!img) return ''
  // For t-shirts: replace 000_image with 001_image in the URL
  // This swaps the FULLCOLOR swatch for the actual tshirt photo
  if (img.includes('000_image')) {
    img = img.replace('000_image', '001_image')
  }
  return img
})

const imageError = ref(false)

/**
 * Determine if we should try to show the image.
 * Returns false if: no image, data URL check fails, or URL is known to be broken.
 */
const shouldShowImage = computed(() => {
  if (imageError.value) return false
  if (!displayImage.value) return false
  // Allow data URLs
  if (displayImage.value.startsWith('data:')) return true
  // For HTTP URLs, check if they're likely broken
  if (displayImage.value.startsWith('http')) {
    return !isLikelyBrokenCdnUrl(displayImage.value)
  }
  return false
})

function handleImageError(event) {
  imageError.value = true
  const src = event.target?.src
  if (src) {
    markImageUrlAsBroken(src)
  }
}

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

function handleSeeProduct() {
  if (isThirdParty.value && productUrl.value) {
    // Open third-party product in new tab
    window.open(productUrl.value, '_blank', 'noopener,noreferrer')
  } else {
    // Navigate to own product detail page in-app
    router.push(`/produtos/${props.product.id}`)
  }
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

// ===== Pixel Animation Logic (self-contained, only for image area) =====

class Pixel {
  constructor(canvas, ctx, x, y, color, speed, delay) {
    this.width = canvas.width
    this.height = canvas.height
    this.ctx = ctx
    this.x = x
    this.y = y
    this.color = color
    this.speed = this.getRandomValue(0.1, 0.9) * speed
    this.size = 0
    this.sizeStep = Math.random() * 0.4
    this.minSize = 0.5
    this.maxSizeInteger = 2
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger)
    this.delay = delay
    this.counter = 0
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01
    this.isIdle = false
    this.isReverse = false
    this.isShimmer = false
  }

  getRandomValue(min, max) {
    return Math.random() * (max - min) + min
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5
    this.ctx.fillStyle = this.color
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size)
  }

  appear() {
    this.isIdle = false
    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true
    }
    if (this.isShimmer) {
      this.shimmer()
    } else {
      this.size += this.sizeStep
    }
    this.draw()
  }

  disappear() {
    this.isShimmer = false
    this.counter = 0
    if (this.size <= 0) {
      this.isIdle = true
      return
    } else {
      this.size -= 0.1
    }
    this.draw()
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true
    } else if (this.size <= this.minSize) {
      this.isReverse = false
    }
    if (this.isReverse) {
      this.size -= this.speed
    } else {
      this.size += this.speed
    }
  }
}

function getEffectiveSpeed(value, reduced) {
  const min = 0
  const max = 100
  const throttle = 0.001
  if (value <= min || reduced) return min
  if (value >= max) return max * throttle
  return value * throttle
}

const initPixels = () => {
  if (!pixelContainerRef.value || !canvasRef.value) return

  const rect = pixelContainerRef.value.getBoundingClientRect()
  const width = Math.floor(rect.width)
  const height = Math.floor(rect.height)
  const ctx = canvasRef.value.getContext('2d')

  canvasRef.value.width = width
  canvasRef.value.height = height
  canvasRef.value.style.width = `${width}px`
  canvasRef.value.style.height = `${height}px`

  const colorsArray = PIXEL_CONFIG.colors.split(',')
  const gap = PIXEL_CONFIG.gap
  const pxs = []

  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {
      const color = colorsArray[Math.floor(Math.random() * colorsArray.length)]
      const dx = x - width / 2
      const dy = y - height / 2
      const distance = reducedMotion.value ? 0 : Math.sqrt(dx * dx + dy * dy)
      const delay = distance
      if (!ctx) return
      pxs.push(new Pixel(canvasRef.value, ctx, x, y, color, getEffectiveSpeed(PIXEL_CONFIG.speed, reducedMotion.value), delay))
    }
  }
  pixelsRef.value = pxs
}

const doAnimate = (fnName) => {
  animationRef.value = requestAnimationFrame(() => doAnimate(fnName))
  const timeNow = performance.now()
  const timePassed = timeNow - timePreviousRef.value
  const timeInterval = 1000 / 60

  if (timePassed < timeInterval) return
  timePreviousRef.value = timeNow - (timePassed % timeInterval)

  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx || !canvasRef.value) return

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  let allIdle = true
  for (let i = 0; i < pixelsRef.value.length; i++) {
    const pixel = pixelsRef.value[i]
    pixel[fnName]()
    if (!pixel.isIdle) {
      allIdle = false
    }
  }
  if (allIdle && animationRef.value) {
    cancelAnimationFrame(animationRef.value)
  }
}

const handleAnimation = (name) => {
  if (animationRef.value !== null) {
    cancelAnimationFrame(animationRef.value)
  }
  animationRef.value = requestAnimationFrame(() => doAnimate(name))
}

const onMouseEnter = () => handleAnimation('appear')
const onMouseLeave = () => handleAnimation('disappear')

let resizeObserver = null
let resizeDebounceTimer = null

watch(() => props.product, () => {
  initPixels()
}, { flush: 'post' })

onMounted(() => {
  initPixels()
  resizeObserver = new ResizeObserver(() => {
    if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer)
    resizeDebounceTimer = setTimeout(() => {
      initPixels()
      resizeDebounceTimer = null
    }, 150)
  })
  if (pixelContainerRef.value) {
    resizeObserver.observe(pixelContainerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (resizeDebounceTimer) {
    clearTimeout(resizeDebounceTimer)
  }
  if (animationRef.value !== null) {
    cancelAnimationFrame(animationRef.value)
  }
})
</script>

<style scoped>
/* ===== Card Container ===== */
.product-pixel-card {
  --card-radius: 20px;
  --border-width: 2px;

  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--card-radius);
  background: var(--surface-2);
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
  will-change: transform;
  transform: translateZ(0);
  z-index: 0;
}

.product-pixel-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(139, 92, 246, 0.06);
}

.product-pixel-card:active {
  transform: translateY(-1px);
  transition-duration: 0.1s;
}

/* ===== Animated Rainbow Gradient Border (hover only) ===== */
.product-pixel-card__border {
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  padding: var(--border-width);
  background: conic-gradient(
    from var(--border-angle, 0deg),
    #8b5cf6,
    #ec4899,
    #f59e0b,
    #22c55e,
    #06b6d4,
    #3b82f6,
    #8b5cf6
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  z-index: 10;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.product-pixel-card:hover .product-pixel-card__border {
  opacity: 0.6;
  animation: pcard-border-rotate 4s linear infinite;
}

@keyframes pcard-border-rotate {
  to { --border-angle: 360deg; }
}

@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* Inner card content */
.product-pixel-card__inner {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--card-radius);
  overflow: hidden;
  z-index: 2;
  background: var(--surface-2);
}

/* ===== Visual Section (image + pixel animation) ===== */
.product-pixel-card__visual {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--surface-1);
  z-index: 2;
}

.product-pixel-card__pixel-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
}

/* Image layer - sits on top of pixel canvas */
.product-pixel-card__image-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: pointer;
}

.product-pixel-card__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Semi-transparent so pixels glow through as a subtle highlight */
  opacity: 0.85;
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s ease;
  transform: translateZ(0) scale(1);
  filter: saturate(0.95);
}

.product-pixel-card:hover .product-pixel-card__image {
  opacity: 0.78;
  transform: translateZ(0) scale(1.035);
  filter: saturate(1.05);
}

/* Gradient fade at bottom for seamless blend into info area */
.product-pixel-card__image-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to top, var(--surface-2) 0%, rgba(20, 20, 22, 0.6) 30%, transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.product-pixel-card__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  opacity: 0.35;
  background: var(--surface-3);
}

/* ===== Badges ===== */
.product-pixel-card__badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  z-index: 3;
}

.product-pixel-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 100px;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.product-pixel-card__badge:hover {
  transform: translateY(-1px) scale(1.02);
}

.product-pixel-card__badge-icon {
  flex-shrink: 0;
  opacity: 0.9;
}

/* Bundle badge - purple */
.product-pixel-card__badge--bundle {
  background: rgba(139, 92, 246, 0.7);
  color: #ffffff;
  border: 1px solid rgba(196, 181, 253, 0.25);
  box-shadow:
    0 1px 4px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.product-pixel-card__badge--bundle:hover {
  background: rgba(139, 92, 246, 0.85);
  box-shadow:
    0 2px 16px rgba(139, 92, 246, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Digital badge - green */
.product-pixel-card__badge--digital {
  background: rgba(34, 197, 94, 0.65);
  color: #ffffff;
  border: 1px solid rgba(74, 222, 128, 0.2);
  box-shadow:
    0 1px 4px rgba(34, 197, 94, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.product-pixel-card__badge--digital:hover {
  background: rgba(34, 197, 94, 0.8);
  box-shadow:
    0 2px 16px rgba(34, 197, 94, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* On-demand badge - frosted glass */
.product-pixel-card__badge--ondemand {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.product-pixel-card__badge--ondemand:hover {
  background: rgba(255, 255, 255, 0.13);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 2px 10px rgba(255, 255, 255, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* ===== Info Section ===== */
.product-pixel-card__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px 18px;
  flex: 1;
  position: relative;
  z-index: 2;
}

/* Header: category + artist */
.product-pixel-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 20px;
}

/* Category tag - clean modern monochrome pill */
.product-pixel-card__category {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  font-size: 0.575rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.product-pixel-card:hover .product-pixel-card__category {
  color: var(--text-primary);
  border-color: var(--text-muted);
  background: var(--surface-2);
}

.product-pixel-card__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--text-muted);
  opacity: 0.3;
  flex-shrink: 0;
}

.product-pixel-card__artist {
  font-size: 0.65rem;
  font-weight: 400;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Product name */
.product-pixel-card__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.product-pixel-card:hover .product-pixel-card__name {
  color: #ffffff;
}

/* Thin separator before footer */
.product-pixel-card__divider {
  height: 1px;
  background: linear-gradient(to right, var(--border), transparent 60%);
  margin-top: 4px;
}

/* Footer: Price + Add Button */
.product-pixel-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 4px;
  gap: 10px;
}

.product-pixel-card__price-block {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
}

.product-pixel-card__currency {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.product-pixel-card__price {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  line-height: 1;
  transition: color 0.3s ease;
}

.product-pixel-card:hover .product-pixel-card__price {
  color: #ffffff;
}

/* ===== Add to Cart Button - Clean Modern ===== */
.product-pixel-card__add {
  --add-radius: 10px;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 38px;
  padding: 0 16px;
  color: #ffffff;
  border: none;
  border-radius: var(--add-radius);
  font-size: 0.675rem;
  font-weight: 500;
  font-family: var(--font-sans);
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  background: #1a1a1a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* Subtle shine overlay */
.product-pixel-card__add-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(255, 255, 255, 0.08) 45%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.08) 55%,
    transparent 65%
  );
  background-size: 200% 100%;
  background-position: 100% 0;
  opacity: 0;
  transition: opacity 0.2s ease, background-position 0.5s ease;
  z-index: 1;
  pointer-events: none;
}

.product-pixel-card__add:hover .product-pixel-card__add-shine {
  opacity: 1;
  background-position: 0 0;
}

.product-pixel-card__add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.product-pixel-card__add:active {
  transform: translateY(0);
  transition-duration: 0.1s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.product-pixel-card__add svg {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.product-pixel-card__add span:last-child {
  position: relative;
  z-index: 1;
}

/* Hidden bg element (no longer needed but kept for template compat) */
.product-pixel-card__add-bg {
  display: none;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .product-pixel-card {
    --card-radius: 16px;
  }

  .product-pixel-card__info {
    padding: 14px 16px 16px;
    gap: 7px;
  }

  .product-pixel-card__name {
    font-size: 0.825rem;
  }

  .product-pixel-card__price {
    font-size: 1rem;
  }

  .product-pixel-card__add {
    height: 36px;
    padding: 0 14px;
    font-size: 0.65rem;
    --add-radius: 9px;
  }

  .product-pixel-card__badges {
    top: 10px;
    left: 10px;
  }

  .product-pixel-card__badge {
    padding: 4px 9px;
    font-size: 0.6rem;
  }
}

@media (max-width: 640px) {
  .product-pixel-card__info {
    padding: 12px 14px 14px;
    gap: 6px;
  }

  .product-pixel-card__header {
    gap: 6px;
    min-height: 16px;
  }

  .product-pixel-card__category {
    font-size: 0.55rem;
    padding: 2px 6px;
  }

  .product-pixel-card__artist {
    font-size: 0.6rem;
  }

  .product-pixel-card__name {
    font-size: 0.775rem;
    -webkit-line-clamp: 1;
  }

  .product-pixel-card__price {
    font-size: 0.95rem;
  }

  .product-pixel-card__currency {
    font-size: 0.6rem;
  }

  .product-pixel-card__add {
    height: 34px;
    padding: 0 12px;
    font-size: 0.625rem;
    --add-radius: 8px;
    gap: 6px;
  }

  .product-pixel-card__add svg {
    width: 14px;
    height: 14px;
  }

  .product-pixel-card__badges {
    top: 8px;
    left: 8px;
    gap: 4px;
  }

  .product-pixel-card__badge {
    padding: 3px 7px;
    font-size: 0.55rem;
  }

  .product-pixel-card__badge-icon {
    width: 8px;
    height: 8px;
  }
}

@media (max-width: 480px) {
  .product-pixel-card {
    --card-radius: 14px;
  }

  .product-pixel-card__info {
    padding: 10px 12px 12px;
    gap: 5px;
  }

  .product-pixel-card__header {
    min-height: 14px;
  }

  .product-pixel-card__category {
    font-size: 0.525rem;
    padding: 2px 5px;
  }

  .product-pixel-card__artist {
    font-size: 0.55rem;
  }

  .product-pixel-card__name {
    font-size: 0.725rem;
    line-height: 1.3;
  }

  .product-pixel-card__price {
    font-size: 0.9rem;
  }

  /* Icon-only button on mobile */
  .product-pixel-card__add span:last-child {
    display: none;
  }

  .product-pixel-card__add {
    width: 36px;
    height: 36px;
    --add-radius: 8px;
  }

  .product-pixel-card__add svg {
    width: 16px;
    height: 16px;
  }

  .product-pixel-card__footer {
    gap: 8px;
  }

  .product-pixel-card__badges {
    top: 6px;
    left: 6px;
  }

  .product-pixel-card__badge {
    padding: 2px 6px;
    font-size: 0.5rem;
    gap: 3px;
  }
}

@media (max-width: 360px) {
  .product-pixel-card {
    --card-radius: 12px;
  }

  .product-pixel-card__info {
    padding: 8px 10px 10px;
    gap: 4px;
  }

  .product-pixel-card__name {
    font-size: 0.675rem;
  }

  .product-pixel-card__price {
    font-size: 0.85rem;
  }

  .product-pixel-card__add {
    width: 32px;
    height: 32px;
    --add-radius: 7px;
  }

  .product-pixel-card__add svg {
    width: 14px;
    height: 14px;
  }
}
</style>
