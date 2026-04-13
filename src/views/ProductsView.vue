<template>
  <div class="products-page">
    <!-- Page Header -->
    <div class="products-page__header">
      <div class="products-page__header-inner container">
        <h1 class="products-page__title">{{ $t('products.title') }}</h1>
        <p class="products-page__subtitle">{{ $t('products.subtitle') || 'Browse our collection' }}</p>

        <!-- Category pills -->
        <div class="products-page__categories" ref="categoriesRef">
          <button
            :class="['products-page__pill', { 'products-page__pill--active': activeCategory === '' }]"
            @click="setCategory('')"
          >
            All
            <span class="products-page__pill-count">{{ productStore.activeProductCount }}</span>
          </button>
          <button
            v-for="cat in productStore.categoriesWithProducts"
            :key="cat.id"
            :class="['products-page__pill', { 'products-page__pill--active': activeCategory === cat.id }]"
            @click="setCategory(cat.id)"
          >
            <span v-if="cat.icon" class="products-page__pill-icon">{{ cat.icon }}</span>
            {{ cat.name }}
            <span class="products-page__pill-count">{{ cat.productCount }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="products-page__main container">
      <!-- Toolbar -->
      <div class="products-page__toolbar">
        <p class="products-page__count">
          <span class="products-page__count-number">{{ productStore.filteredProducts.length }}</span>
          <span class="products-page__count-label">{{ $t('products.productCount', { count: productStore.filteredProducts.length }) }}</span>
        </p>

        <!-- Sort dropdown -->
        <div class="products-page__sort">
          <select v-model="sortBy" class="products-page__sort-select">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name A-Z</option>
          </select>
        </div>
      </div>

      <!-- Product Grid -->
      <div v-if="productStore.loading" class="products-page__skeleton">
        <div v-for="i in 8" :key="i" class="products-page__skeleton-card">
          <div class="products-page__skeleton-img"></div>
          <div class="products-page__skeleton-text" style="width: 80%;"></div>
          <div class="products-page__skeleton-text" style="width: 40%;"></div>
        </div>
      </div>

      <div v-else-if="sortedProducts.length === 0" class="products-page__empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
        <p>No products found</p>
      </div>

      <div v-else class="products-page__grid">
        <TransitionGroup name="product-fade" tag="template">
          <ProductPixelCard
            v-for="product in paginatedSortedProducts"
            :key="product.id"
            :product="product"
          />
        </TransitionGroup>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:current-page="setPage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../stores/products'
import ProductPixelCard from '../components/common/ProductPixelCard.vue'
import BasePagination from '../components/common/BasePagination.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const activeCategory = ref('')
const sortBy = ref('newest')
const categoriesRef = ref(null)
const currentPage = ref(1)

// Sorted products
const sortedProducts = computed(() => {
  const products = [...productStore.filteredProducts]
  switch (sortBy.value) {
    case 'price-asc':
      return products.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price-desc':
      return products.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'name-asc':
      return products.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'newest':
    default:
      return products.sort((a, b) => b.id - a.id)
  }
})

// Paginated sorted products
const PAGE_SIZE = 20
const totalPages = computed(() => Math.ceil(sortedProducts.value.length / PAGE_SIZE))
const paginatedSortedProducts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return sortedProducts.value.slice(start, start + PAGE_SIZE)
})

function setPage(page) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}

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

function setCategory(catId) {
  activeCategory.value = catId
  productStore.setActiveCategory(catId)
  currentPage.value = 1
  // Update URL
  if (catId) {
    router.replace({ query: { ...route.query, category: catId } })
  } else {
    const newQuery = { ...route.query }
    delete newQuery.category
    router.replace({ query: newQuery })
  }
}

// Cleanup route watcher on unmount
let routeWatchCleanup = null
onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])

  if (route.query.category) {
    activeCategory.value = route.query.category
    productStore.setActiveCategory(route.query.category)
  }

  routeWatchCleanup = watch(() => route.query.category, (val) => {
    if (val) {
      activeCategory.value = val
      productStore.setActiveCategory(val)
    } else {
      activeCategory.value = ''
      productStore.setActiveCategory('')
    }
    currentPage.value = 1
  })
})

onUnmounted(() => {
  if (routeWatchCleanup) routeWatchCleanup()
})
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: var(--surface-1);
}

/* ===== Header ===== */
.products-page__header {
  padding: clamp(2rem, 5vh, 3rem) 0 clamp(1.5rem, 3vh, 2rem);
  border-bottom: 1px solid var(--border);
  background: var(--surface-1);
}

.products-page__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.1;
}

.products-page__subtitle {
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

/* ===== Category Pills ===== */
.products-page__categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.products-page__pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--surface-0);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.products-page__pill:hover {
  background: var(--surface-2);
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.products-page__pill--active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.products-page__pill--active:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  opacity: 0.9;
}

.products-page__pill-icon {
  font-size: 1rem;
}

.products-page__pill-count {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  padding: 0.1rem 0.45rem;
  border-radius: 100px;
  background: var(--surface-2);
  color: var(--text-muted);
}

.products-page__pill--active .products-page__pill-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* ===== Main Content ===== */
.products-page__main {
  padding: clamp(1rem, 2vh, 1.5rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vh, 4rem);
}

/* ===== Toolbar ===== */
.products-page__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--surface-0);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.products-page__count {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
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

.products-page__sort-select {
  padding: 0.5rem 1.5rem 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-1);
  color: var(--text-primary);
  font-size: 0.8rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  transition: border-color 0.2s ease;
}

.products-page__sort-select:hover {
  border-color: var(--text-muted);
}

.products-page__sort-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-subtle);
}

/* ===== Grid ===== */
.products-page__grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

/* ===== Skeleton ===== */
.products-page__skeleton {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

.products-page__skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface-0);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.products-page__skeleton-img {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--surface-1) 25%, var(--surface-2) 50%, var(--surface-1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.products-page__skeleton-text {
  height: 1rem;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--surface-1) 25%, var(--surface-2) 50%, var(--surface-1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== Empty ===== */
.products-page__empty {
  text-align: center;
  padding: clamp(3rem, 10vh, 5rem) clamp(1rem, 3vw, 1.5rem);
  color: var(--text-muted);
  font-size: clamp(0.8rem, 1.8vw, 1rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.875rem, 2vw, 1.25rem);
}

.products-page__empty svg {
  opacity: 0.3;
}

/* ===== Transitions ===== */
.product-fade-enter-active {
  transition: all 0.3s ease;
}

.product-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .products-page__categories {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }

  .products-page__pill {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .products-page__toolbar {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .products-page__sort-select {
    width: 100%;
  }

  .products-page__grid {
    grid-template-columns: repeat(auto-fill, minmax(min(160px, 100%), 1fr));
    gap: clamp(0.75rem, 2vw, 1rem);
  }

  .products-page__skeleton {
    grid-template-columns: repeat(auto-fill, minmax(min(160px, 100%), 1fr));
    gap: clamp(0.75rem, 2vw, 1rem);
  }
}

@media (max-width: 480px) {
  .products-page__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .products-page__skeleton {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .products-page__skeleton-img,
  .products-page__skeleton-text {
    animation: none;
  }

  .product-fade-enter-active {
    transition: none;
  }
}
</style>
