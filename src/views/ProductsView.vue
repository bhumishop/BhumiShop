<template>
  <div class="products-page">
    <!-- Particles background -->
    <div class="products-page__particles">
      <Particles
        :particle-count="150"
        :particle-spread="10"
        :speed="0.1"
        :particle-colors="['#ffffff']"
        :move-particles-on-hover="false"
        :particle-hover-factor="1"
        :alpha-particles="false"
        :particle-base-size="100"
        :size-randomness="1"
        :camera-distance="20"
        :disable-rotation="false"
        class="w-full h-full"
      />
    </div>

    <!-- Page Header -->
    <div class="products-page__header container">
      <h1 class="products-page__title">{{ $t('products.title') }}</h1>
      <p class="products-page__subtitle">Discover our curated collection of handcrafted goods</p>
    </div>

    <div class="products-page__layout container">
      <!-- Sidebar Filters -->
      <aside class="products-page__sidebar">
        <div class="filter-group">
          <div class="filter-group__header">
            <h3 class="filter-group__title">{{ $t('products.categories') }}</h3>
            <button
              v-if="activeCategory"
              class="filter-group__clear"
              @click="setCategory('')"
            >
              Clear
            </button>
          </div>

          <button
            :class="['filter-group__item', { 'filter-group__item--active': activeCategory === '' }]"
            @click="setCategory('')"
          >
            <span class="filter-group__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            {{ $t('products.all') }}
            <span class="filter-group__count">{{ productStore.products.length }}</span>
          </button>

          <button
            v-for="cat in productStore.categories"
            :key="cat.id"
            :class="['filter-group__item', { 'filter-group__item--active': activeCategory === cat.id }]"
            @click="setCategory(cat.id)"
          >
            <span class="filter-group__icon">{{ getCategoryIcon(cat.name) }}</span>
            {{ cat.name }}
            <span class="filter-group__count">{{ getCategoryCount(cat.id) }}</span>
          </button>
        </div>

        <!-- Price Range Filter -->
        <div class="filter-group filter-group--price">
          <div class="filter-group__header">
            <h3 class="filter-group__title">Price Range</h3>
            <span class="filter-group__price-value">R$ {{ maxPrice }}</span>
          </div>
          <div class="price-slider-wrapper">
            <ElasticSlider
              :default-value="maxPriceLimit"
              :starting-value="0"
              :max-value="maxPriceLimit"
              :is-stepped="true"
              :step-size="5"
              class-name="price-elastic-slider"
              @change="onPriceChange"
            />
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="products-page__main">
        <div class="products-page__toolbar">
          <p class="products-page__count">
            <span class="products-page__count-number">{{ productStore.filteredProducts.length }}</span>
            <span class="products-page__count-label">{{ $t('products.productCount', { count: productStore.filteredProducts.length }) }}</span>
          </p>
        </div>

        <ProductGrid
          :products="productStore.paginatedProducts"
          :loading="productStore.loading"
          :current-page="productStore.currentPage"
          :total-pages="productStore.totalPages"
          @update:current-page="productStore.setPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '../stores/products'
import ProductGrid from '../components/product/ProductGrid.vue'
import ElasticSlider from '../components/common/ElasticSlider.vue'
import Particles from '../components/common/Particles.vue'

const route = useRoute()
const productStore = useProductStore()
const activeCategory = ref('')

// Price filter - compute max from actual products
const maxPriceLimit = computed(() => {
  const prices = productStore.products.map(p => p.price || 0)
  if (!prices.length) return 500
  const max = Math.max(...prices)
  return Math.ceil(max / 50) * 50
})

const maxPriceValue = ref(500)
const maxPrice = computed(() => maxPriceValue.value.toFixed(2).replace('.', ','))

function onPriceChange(value) {
  maxPriceValue.value = Math.round(value)
  productStore.setMaxPrice(maxPriceValue.value)
}

// Precompute category counts to avoid O(n*m) in template loops
const categoryCounts = computed(() => {
  const counts = {}
  productStore.categories.forEach(cat => {
    counts[cat.id] = productStore.products.filter(p => p.category === cat.id).length
  })
  return counts
})

function getCategoryIcon(name) {
  const icons = {
    'Camisetas': '👕',
    'Acessórios': '🎒',
    'Arte': '🎨',
    'Canecas': '☕',
    'Bags': '👜'
  }
  return icons[name] || '📦'
}

function getCategoryCount(catId) {
  return categoryCounts.value[catId] || 0
}

function setCategory(catId) {
  activeCategory.value = catId
  productStore.setActiveCategory(catId)
}

// Cleanup route watcher on unmount
let routeWatchCleanup = null
onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])

  // Set initial max price from products
  if (productStore.products.length) {
    const prices = productStore.products.map(p => p.price || 0)
    const maxP = Math.ceil(Math.max(...prices) / 50) * 50
    maxPriceValue.value = maxP
    productStore.setMaxPrice(maxP)
  }

  if (route.query.category) {
    activeCategory.value = route.query.category
    productStore.setActiveCategory(route.query.category)
  }

  routeWatchCleanup = watch(() => route.query.category, (val) => {
    if (val) {
      activeCategory.value = val
      productStore.setActiveCategory(val)
    }
  })

  // Watch maxPriceLimit for reactive updates
  watch(maxPriceLimit, (newLimit) => {
    if (maxPriceValue.value > newLimit) {
      maxPriceValue.value = newLimit
      productStore.setMaxPrice(newLimit)
    }
  })
})

onUnmounted(() => {
  if (routeWatchCleanup) routeWatchCleanup()
})
</script>

<style scoped>
.products-page {
  padding: clamp(2rem, 4vh, 3rem) 0 clamp(3rem, 6vh, 5rem);
  background: var(--surface-1);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.products-page__particles {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.3;
  pointer-events: none;
}

.w-full { width: 100%; }
.h-full { height: 100%; }

.products-page__header {
  margin-bottom: clamp(2rem, 4vh, 3rem);
  position: relative;
  z-index: 1;
}

.products-page__title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.products-page__subtitle {
  font-size: clamp(0.95rem, 1.5vw, 1.05rem);
  color: var(--text-secondary);
}

.products-page__layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  position: relative;
  z-index: 1;
}

/* Sidebar */
.products-page__sidebar {
  position: sticky;
  top: calc(var(--header-height) + 24px);
  height: fit-content;
  background: var(--surface-0);
  border-radius: var(--radius-xl);
  padding: 24px;
  border: 1px solid rgba(63, 63, 70, 0.5);
}

.filter-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-group__title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.filter-group__clear {
  font-size: 0.75rem;
  color: var(--accent);
  transition: opacity 0.2s ease;
}

.filter-group__clear:hover {
  opacity: 0.8;
}

.filter-group--price {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.filter-group__price-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  font-family: var(--font-mono);
  transition: color 0.2s ease;
}

/* ===== Price Elastic Slider ===== */
.price-slider-wrapper {
  padding-top: 4px;
}

.price-slider-wrapper :deep(.elastic-slider__bar) {
  background: var(--surface-3);
}

.price-slider-wrapper :deep(.elastic-slider__bar-fill) {
  background: var(--accent);
}

.price-slider-wrapper :deep(.elastic-slider__value) {
  color: var(--accent);
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.7rem;
}

.filter-group__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
}

.filter-group__icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.filter-group__count {
  margin-left: auto;
  font-size: 0.7rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background: var(--surface-2);
  padding: 2px 8px;
  border-radius: 12px;
}

.filter-group__item:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.filter-group__item--active {
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 600;
}

.filter-group__item--active .filter-group__count {
  background: rgba(139, 92, 246, 0.2);
  color: var(--accent);
}

/* Main Content */
.products-page__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--surface-0);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(63, 63, 70, 0.5);
}

.products-page__count {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.products-page__count-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.products-page__count-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .products-page__layout {
    grid-template-columns: 240px 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .products-page__layout {
    grid-template-columns: 1fr;
  }

  .products-page__sidebar {
    position: static;
    padding: 16px;
  }

  .filter-group {
    display: flex;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 8px;
  }

  .filter-group__header {
    display: none;
  }

  .filter-group__title {
    display: none;
  }

  .filter-group__item {
    white-space: nowrap;
    border: 1px solid var(--border);
    border-radius: 30px;
    padding: 8px 16px;
    font-size: 0.8rem;
  }

  .filter-group__count {
    display: none;
  }
}
</style>
