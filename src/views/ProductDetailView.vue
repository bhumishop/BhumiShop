<template>
  <div v-if="product" class="product-detail container">
    <nav class="product-detail__breadcrumb">
      <router-link to="/">{{ $t('productDetail.breadcrumbHome') }}</router-link>
      <span class="product-detail__sep">/</span>
      <router-link to="/produtos">{{ $t('productDetail.breadcrumbProducts') }}</router-link>
      <span class="product-detail__sep">/</span>
      <span>{{ product.name }}</span>
    </nav>

    <div class="product-detail__layout">
      <div class="product-detail__gallery">
        <ProductGallery :images="productImages" :product-name="product.name" />
      </div>

      <div class="product-detail__info">
        <BaseBadge :variant="'accent'" size="sm">{{ categoryName }}</BaseBadge>
        <h1 class="product-detail__name">{{ product.name }}</h1>
        <p v-if="product.artist" class="product-detail__artist">{{ $t('productDetail.by') }} {{ product.artist }}</p>
        <p class="product-detail__price">R$ {{ formatPrice(product.price) }}</p>

        <p v-if="product.description" class="product-detail__desc">{{ product.description }}</p>

        <p v-if="product.info" class="product-detail__extra">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          {{ product.info }}
        </p>

        <div v-if="product.sizes && product.sizes.length" class="product-detail__variants">
          <ProductVariants v-model="selectedSize" :sizes="product.sizes" />
        </div>

        <div class="product-detail__qty">
          <span class="product-detail__qty-label">{{ $t('productDetail.quantity') }}</span>
          <div class="product-detail__qty-controls">
            <button @click="decrementQty" :disabled="quantity <= 1" :aria-label="$t('productDetail.decrease')">−</button>
            <span class="product-detail__qty-value">{{ quantity }}</span>
            <button @click="incrementQty" :disabled="quantity >= 99" :aria-label="$t('productDetail.increase')">+</button>
          </div>
        </div>

        <div class="product-detail__stock">
          <BaseBadge :variant="product.stock === 'print-on-demand' ? 'default' : 'success'" size="xs">
            {{ product.stock === 'print-on-demand' ? $t('productDetail.onDemand') : $t('productDetail.inStock') }}
          </BaseBadge>
        </div>

        <div class="product-detail__actions">
          <BaseButton variant="primary" size="lg" full :loading="addingToCart" @click="addToCart">
            {{ $t('productDetail.addToCart') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <ProductMandala
      v-if="product && relatedProducts.length > 0"
      :current-product="product"
      :related-products="relatedProducts"
    />
  </div>

  <div v-else-if="isLoading" class="product-detail container">
    <div class="product-detail__layout">
      <BaseSkeleton variant="image" class="product-detail__skeleton-gallery" />
      <div class="product-detail__skeleton-info">
        <BaseSkeleton variant="title" />
        <BaseSkeleton variant="text" width="50%" />
        <BaseSkeleton variant="text" width="30%" />
        <BaseSkeleton variant="button" />
      </div>
    </div>
  </div>

  <div v-else class="product-detail container">
    <div class="product-detail__notfound">
      <h2>{{ $t('productDetail.notFound') }}</h2>
      <BaseButton variant="secondary" @click="$router.push('/produtos')">{{ $t('productDetail.viewProducts') }}</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import ProductGallery from '../components/product/ProductGallery.vue'
import ProductMandala from '../components/product/ProductMandala.vue'
import ProductVariants from '../components/product/ProductVariants.vue'
import BaseBadge from '../components/common/BaseBadge.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseSkeleton from '../components/common/BaseSkeleton.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const toast = useToastStore()
const { t } = useI18n()

const selectedSize = ref(null)
const quantity = ref(1)
const addingToCart = ref(false)

const product = computed(() => productStore.getProductById(route.params.id))
const isLoading = computed(() => productStore.products.length === 0 && productStore.categories.length === 0)

const productImages = computed(() => {
  if (!product.value) return []
  const images = []

  // Prefer the images array if available
  if (Array.isArray(product.value.images) && product.value.images.length > 0) {
    product.value.images.forEach(img => {
      if (img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/'))) {
        images.push(img)
      }
    })
  }

  // Fallback to single image
  if (images.length === 0) {
    const img = product.value.image
    if (img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/'))) {
      images.push(img)
    }
  }

  return images
})

const categoryName = computed(() => {
  if (!product.value) return ''
  const cat = productStore.categories.find(c => c.id === product.value.category)
  return cat?.name || product.value.category || ''
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return productStore.getRelatedProducts(route.params.id, 8)
})

onMounted(async () => {
  if (productStore.products.length === 0) {
    await productStore.fetchProducts()
  }
  if (productStore.categories.length === 0) {
    await productStore.fetchCategories()
  }
})

watch(() => route.params.id, () => {
  selectedSize.value = null
  quantity.value = 1
})

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

function incrementQty() {
  if (quantity.value < 99) quantity.value++
}

function decrementQty() {
  if (quantity.value > 1) quantity.value--
}

async function addToCart() {
  if (product.value?.sizes?.length && !selectedSize.value) {
    toast.warning(t('productDetail.selectSize'))
    return
  }

  addingToCart.value = true
  try {
    cartStore.addItem({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      category: product.value.category,
      size: selectedSize.value,
      quantity: quantity.value,
      fulfillment_type: product.value.fulfillment_type || 'own',
      weight: product.value.weight || 0.3,
      dimensions: product.value.dimensions,
      shipping_zones: product.value.shipping_zones
    })
    toast.success(t('productDetail.addedToCart', { name: product.value.name }))
    cartStore.openDrawer()
  } finally {
    addingToCart.value = false
  }
}
</script>

<style scoped>
.product-detail {
  padding: clamp(1rem, 2.5vh, 1.5rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vh, 4rem);
}

.product-detail__breadcrumb {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-muted);
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.product-detail__breadcrumb a {
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.product-detail__breadcrumb a:hover {
  color: var(--accent);
}

.product-detail__sep {
  color: var(--text-muted);
}

.product-detail__layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: start;
}

.product-detail__gallery {
  position: sticky;
  top: calc(var(--header-height) + clamp(1rem, 2.5vh, 2rem));
}

.product-detail__skeleton-gallery {
  flex: 1;
}

.product-detail__skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(0.625rem, 1.5vh, 1rem);
}

.product-detail__name {
  font-size: clamp(1.375rem, 3.5vw, 1.75rem);
  font-weight: 700;
  margin: clamp(0.5rem, 1.2vh, 0.75rem) 0 clamp(0.125rem, 0.3vh, 0.25rem);
  letter-spacing: -0.02em;
}

.product-detail__artist {
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  color: var(--text-secondary);
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
}

.product-detail__price {
  font-family: var(--font-mono);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
}

.product-detail__price::after {
  content: '';
  display: inline-block;
  width: clamp(0.375rem, 0.75vw, 0.5rem);
  height: clamp(0.375rem, 0.75vw, 0.5rem);
  background: var(--green-adorn);
  border-radius: var(--radius-full);
  box-shadow: 0 0 clamp(0.375rem, 1vw, 0.625rem) var(--green-adorn-glow);
  animation: pulse-glow 2s ease-in-out infinite;
}

.product-detail__desc {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
}

.product-detail__extra {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.75rem, 1.5vw, 1rem);
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent);
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
  line-height: 1.5;
}

.product-detail__extra svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--accent);
}

.product-detail__variants {
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.product-detail__qty {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.product-detail__qty-label {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 500;
  color: var(--text-secondary);
}

.product-detail__qty-controls {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.product-detail__qty-controls button {
  width: clamp(2rem, 4vw, 2.25rem);
  height: clamp(2rem, 4vw, 2.25rem);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.product-detail__qty-controls button:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text-primary);
}

.product-detail__qty-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.product-detail__qty-value {
  width: clamp(2.25rem, 4vw, 2.5rem);
  text-align: center;
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 600;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  line-height: clamp(2rem, 4vw, 2.25rem);
}

.product-detail__stock {
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.product-detail__actions {
  margin-top: clamp(0.375rem, 1vh, 0.5rem);
}

.product-detail__notfound {
  text-align: center;
  padding: clamp(2.5rem, 8vh, 4rem) 0;
}

.product-detail__notfound h2 {
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .product-detail__layout {
    grid-template-columns: 1fr;
  }

  .product-detail__gallery {
    position: static;
  }

  .product-detail__price {
    font-size: clamp(1.25rem, 4vw, 1.5rem);
  }
}
</style>
