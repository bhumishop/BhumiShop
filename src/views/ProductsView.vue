<template>
  <div class="products-page">
    <!-- Mobile Filter Toggle -->
    <button
      class="products-page__filter-toggle lg:hidden"
      @click="showMobileFilter = !showMobileFilter"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="4" y1="6" x2="20" y2="6"/>
        <line x1="8" y1="12" x2="20" y2="12"/>
        <line x1="12" y1="18" x2="20" y2="18"/>
        <circle cx="4" cy="6" r="2" fill="currentColor"/>
        <circle cx="8" cy="12" r="2" fill="currentColor"/>
        <circle cx="12" cy="18" r="2" fill="currentColor"/>
      </svg>
      <span>{{ $t('products.filters') }}</span>
      <span v-if="activeFilterCount > 0" class="products-page__filter-badge">{{ activeFilterCount }}</span>
    </button>

    <!-- Mobile Filter Overlay -->
    <Transition name="filter-overlay">
      <div v-if="showMobileFilter" class="products-page__mobile-filter" @click.self="showMobileFilter = false">
        <div ref="mobileFilterPanelRef" class="products-page__mobile-filter-panel">
          <div class="products-page__mobile-filter-header">
            <h3>{{ $t('products.filters') }}</h3>
            <button @click="showMobileFilter = false" aria-label="Close filters">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <FilterPanel
            :categories="categoriesWithCounts"
            :active-category="activeCategory"
            :sort-by="sortBy"
            :max-price="priceFilter"
            :price-range-max="priceRangeMax"
            :total-count="productStore.activeProductCount"
            @update:category="onCategoryChange"
            @update:sortBy="onSortChange"
            @update:max-price="onPriceChange"
            @clear="clearAllFilters"
          />
        </div>
      </div>
    </Transition>

    <!-- Page Header -->
    <div class="products-page__header">
      <div class="products-page__header-inner">
        <div class="products-page__header-content">
          <div>
            <h1 class="products-page__title">{{ $t('products.title') }}</h1>
            <p class="products-page__subtitle">{{ $t('products.subtitle') || 'Browse our collection' }}</p>
          </div>
          <div class="products-page__header-stats">
            <div class="products-page__stat">
              <span class="products-page__stat-value">{{ productStore.activeProductCount }}</span>
              <span class="products-page__stat-label">{{ $t('products.productCountLabel') }}</span>
            </div>
            <div class="products-page__stat">
              <span class="products-page__stat-value">{{ categoriesWithCounts.length }}</span>
              <span class="products-page__stat-label">{{ $t('products.categoryCountLabel') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="products-page__main">
      <!-- Desktop Layout: Sidebar + Grid -->
      <div class="products-page__layout">
        <!-- Desktop Sidebar -->
        <aside class="products-page__sidebar hidden lg:block">
          <FilterPanel
            :categories="categoriesWithCounts"
            :active-category="activeCategory"
            :sort-by="sortBy"
            :max-price="priceFilter"
            :price-range-max="priceRangeMax"
            :total-count="productStore.activeProductCount"
            @update:category="onCategoryChange"
            @update:sortBy="onSortChange"
            @update:max-price="onPriceChange"
            @clear="clearAllFilters"
          />
        </aside>

        <!-- Product Grid Area -->
        <div class="products-page__content">
          <!-- Toolbar -->
          <div class="products-page__toolbar">
            <p class="products-page__count">
              <span class="products-page__count-number">{{ filteredAndSorted.length }}</span>
              <span class="products-page__count-label">{{ $t('products.productCount', { count: filteredAndSorted.length }) }}</span>
            </p>

            <!-- Active Filters Display -->
            <div v-if="hasActiveFilters" class="products-page__active-filters">
              <button
                v-if="activeCategory"
                class="products-page__active-filter"
                @click="onCategoryChange('')"
              >
                <span>{{ getCategoryName(activeCategory) }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <button
                v-if="priceFilter !== null"
                class="products-page__active-filter"
                @click="onPriceChange(null)"
              >
                <span>{{ $t('products.maxPriceLabel') }} R$ {{ priceFilter }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Desktop Sort Dropdown -->
            <div class="products-page__sort hidden lg:block">
              <select v-model="localSort" @change="onSortChange(localSort)" class="products-page__sort-select">
                <option value="newest">{{ $t('products.sortNewest') }}</option>
                <option value="price-asc">{{ $t('products.sortPriceAsc') }}</option>
                <option value="price-desc">{{ $t('products.sortPriceDesc') }}</option>
                <option value="name-asc">{{ $t('products.sortNameAsc') }}</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="productStore.loading" class="products-page__skeleton">
            <div v-for="i in 20" :key="i" class="products-page__skeleton-card">
              <div class="products-page__skeleton-img"></div>
              <div class="products-page__skeleton-text" style="width: 80%;"></div>
              <div class="products-page__skeleton-text" style="width: 40%;"></div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredAndSorted.length === 0" class="products-page__empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <p>{{ $t('products.noProductsFound') }}</p>
            <button v-if="hasActiveFilters" class="products-page__empty-btn" @click="clearAllFilters">
              {{ $t('products.clearFilters') }}
            </button>
          </div>

          <!-- Product Grid with Lazy Loading -->
          <div v-else class="products-page__grid-wrapper">
            <div class="products-page__grid">
              <template v-for="product in visibleProducts" :key="product.id">
                <ProductPixelCard :product="product" />
              </template>
            </div>

            <!-- Load More Trigger -->
            <div
              v-if="displayedCount < filteredAndSorted.length"
              ref="loadMoreTrigger"
              class="products-page__load-more"
            >
              <div class="products-page__load-more-spinner">
                <svg class="products-page__spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                <span>{{ $t('products.loadingMore') }}</span>
              </div>
            </div>

            <!-- End of List -->
            <div v-else-if="filteredAndSorted.length > 20" class="products-page__end">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span>{{ $t('products.allLoaded') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../stores/products'
import ProductPixelCard from '../components/common/ProductPixelCard.vue'
import FilterPanel from '../components/common/FilterPanel.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

// Utility: sanitize URL query parameters to prevent XSS
function sanitizeQueryParam(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/[<>"'&]/g, '').trim()
}

// Valid sort options whitelist for URL persistence
const VALID_SORT_OPTIONS = ['newest', 'price-asc', 'price-desc', 'name-asc']

// State
const activeCategory = ref('')
const sortBy = ref('newest')
const localSort = ref('newest')
const priceFilter = ref(null)
const showMobileFilter = ref(false)
const mobileFilterPanelRef = ref(null)

// Computed
const priceRangeMax = computed(() => {
  const products = productStore.products.filter(p => p.is_active !== false && p.is_archived !== true)
  if (products.length === 0) return 1000
  return Math.ceil(Math.max(...products.map(p => p.price || 0)) / 10) * 10
})

const categoriesWithCounts = computed(() => {
  return productStore.categoriesWithProducts || []
})

const hasActiveFilters = computed(() => {
  return !!(activeCategory.value || priceFilter.value !== null || sortBy.value !== 'newest')
})

const activeFilterCount = computed(() => {
  let count = 0
  if (activeCategory.value) count++
  if (priceFilter.value !== null) count++
  if (sortBy.value !== 'newest') count++
  return count
})

// Filtered and sorted products
// Note: price filter is already applied by the store's filteredProducts via maxPrice
const filteredAndSorted = computed(() => {
  let result = [...productStore.filteredProducts]

  // Sort
  switch (sortBy.value) {
    case 'price-asc':
      result.sort((a, b) => (a.price || 0) - (b.price || 0))
      break
    case 'price-desc':
      result.sort((a, b) => (b.price || 0) - (a.price || 0))
      break
    case 'name-asc':
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      break
    case 'newest':
    default:
      // Safe comparison: handle both numeric and string IDs
      result.sort((a, b) => {
        const aId = typeof a.id === 'number' ? a.id : (a.created_at ? new Date(a.created_at).getTime() : 0)
        const bId = typeof b.id === 'number' ? b.id : (b.created_at ? new Date(b.created_at).getTime() : 0)
        return bId - aId
      })
  }

  return result
})

// Lazy loading
const INITIAL_LOAD = 20
const LOAD_INCREMENT = 20
const displayedCount = ref(INITIAL_LOAD)
const loadMoreTrigger = ref(null)
let intersectionObserver = null

const visibleProducts = computed(() => {
  return filteredAndSorted.value.slice(0, displayedCount.value)
})

function setupLoadMoreObserver() {
  cleanupLoadMoreObserver()

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && displayedCount.value < filteredAndSorted.value.length) {
          // Simulate lazy loading delay for smooth UX
          setTimeout(() => {
            displayedCount.value += LOAD_INCREMENT
          }, 300)
        }
      })
    },
    {
      rootMargin: '400px',
      threshold: 0.1
    }
  )

  // Observe after DOM updates
  nextTick(() => {
    if (loadMoreTrigger.value) {
      intersectionObserver.observe(loadMoreTrigger.value)
    }
  })
}

function cleanupLoadMoreObserver() {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }
}

// Reset displayed count when filters change (preserve scroll position)
watch([activeCategory, priceFilter, sortBy], () => {
  // Save current scroll position
  const scrollY = window.scrollY

  displayedCount.value = INITIAL_LOAD
  nextTick(() => {
    setupLoadMoreObserver()
    // Restore scroll position after DOM updates
    window.scrollTo(0, scrollY)
  })
})

// Event handlers
function updateURL() {
  const query = {}
  if (activeCategory.value) query.category = activeCategory.value
  if (sortBy.value !== 'newest') query.sort = sortBy.value
  if (priceFilter.value !== null) query.maxPrice = String(priceFilter.value)
  router.replace({ query })
}

function onCategoryChange(catId) {
  // Save scroll position before changing filters
  const scrollY = window.scrollY

  const sanitizedCatId = sanitizeQueryParam(catId)
  activeCategory.value = sanitizedCatId
  productStore.setActiveCategory(sanitizedCatId)
  updateURL()

  // Restore scroll position after Vue re-renders
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY)
  })
}

function onSortChange(sortValue) {
  if (!VALID_SORT_OPTIONS.includes(sortValue)) return

  const scrollY = window.scrollY
  sortBy.value = sortValue
  localSort.value = sortValue
  updateURL()

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY)
  })
}

function onPriceChange(value) {
  const scrollY = window.scrollY
  priceFilter.value = value
  productStore.setMaxPrice(value)
  updateURL()

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY)
  })
}

function onSliderChange(value) {
  // Don't update if value is 0 or invalid - prevents filtering out all products
  if (!value || value <= 0) return
  
  const scrollY = window.scrollY
  priceFilter.value = value
  productStore.setMaxPrice(value)
  updateURL()

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY)
  })
}

function clearAllFilters() {
  const scrollY = window.scrollY
  activeCategory.value = ''
  sortBy.value = 'newest'
  localSort.value = 'newest'
  priceFilter.value = null
  productStore.setActiveCategory('')
  productStore.setMaxPrice(null)
  router.replace({ query: {} })

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY)
  })
}

function getCategoryName(catId) {
  const cat = productStore.categories.find(c => c.id === catId)
  return cat ? cat.name : sanitizeQueryParam(catId)
}

// Focus trap for mobile filter panel
function trapFocus(e) {
  if (!showMobileFilter.value || !mobileFilterPanelRef.value) return
  const panel = mobileFilterPanelRef.value
  const focusableElements = panel.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }

  if (e.key === 'Escape') {
    showMobileFilter.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])

  // Restore from URL with sanitization
  const rawCategory = route.query.category
  if (rawCategory) {
    const sanitizedCategory = sanitizeQueryParam(rawCategory)
    activeCategory.value = sanitizedCategory
    productStore.setActiveCategory(sanitizedCategory)
  }

  const rawSort = route.query.sort
  if (rawSort && VALID_SORT_OPTIONS.includes(sanitizeQueryParam(rawSort))) {
    const sanitizedSort = sanitizeQueryParam(rawSort)
    sortBy.value = sanitizedSort
    localSort.value = sanitizedSort
  }

  const rawMaxPrice = route.query.maxPrice
  if (rawMaxPrice) {
    const parsedPrice = parseFloat(sanitizeQueryParam(rawMaxPrice))
    if (!isNaN(parsedPrice) && parsedPrice > 0) {
      priceFilter.value = parsedPrice
      productStore.setMaxPrice(parsedPrice)
    }
  }

  // Setup lazy loading observer
  setupLoadMoreObserver()

  // Add focus trap listener
  document.addEventListener('keydown', trapFocus)
})

onUnmounted(() => {
  cleanupLoadMoreObserver()
  document.removeEventListener('keydown', trapFocus)
})
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: var(--surface-1);
}

/* ===== Mobile Filter Toggle ===== */
.products-page__filter-toggle {
  position: fixed;
  bottom: clamp(1rem, 3vw, 1.5rem);
  right: clamp(1rem, 3vw, 1.5rem);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-full);
  background: var(--accent);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: var(--shadow-colored), var(--shadow-lg);
  transition: all var(--transition-base);
}

.products-page__filter-toggle:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.products-page__filter-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.35rem;
  border-radius: var(--radius-full);
  background: white;
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 700;
}

/* ===== Mobile Filter Overlay ===== */
.products-page__mobile-filter {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
}

.products-page__mobile-filter-panel {
  width: min(100%, 360px);
  height: 100%;
  background: var(--surface-0);
  overflow-y: auto;
  padding: 1rem;
}

.products-page__mobile-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0 1rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}

.products-page__mobile-filter-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.products-page__mobile-filter-header button {
  padding: 0.5rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.products-page__mobile-filter-header button:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

/* ===== Header ===== */
.products-page__header {
  padding: clamp(1.5rem, 4vh, 2.5rem) 0 clamp(1rem, 2vh, 1.5rem);
  border-bottom: 1px solid var(--border);
  background: var(--surface-1);
}

.products-page__header-inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 2rem);
}

.products-page__header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.products-page__title {
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  margin: 0 0 0.35rem;
  line-height: 1.1;
}

.products-page__subtitle {
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  color: var(--text-secondary);
  margin: 0;
}

.products-page__header-stats {
  display: flex;
  gap: 1.5rem;
  flex-shrink: 0;
}

.products-page__stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.products-page__stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  font-family: var(--font-mono);
}

.products-page__stat-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ===== Main Content ===== */
.products-page__main {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: clamp(1rem, 3vh, 2rem) clamp(1rem, 3vw, 2rem) clamp(2.5rem, 6vh, 4rem);
}

/* ===== Layout ===== */
.products-page__layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.products-page__sidebar {
  position: sticky;
  top: calc(var(--header-height-fixed) + 1rem);
}

.products-page__content {
  min-width: 0;
}

/* ===== Toolbar ===== */
.products-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
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

.products-page__active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.products-page__active-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-md);
  background: var(--accent-light);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.products-page__active-filter:hover {
  background: var(--accent-subtle);
}

.products-page__active-filter svg {
  stroke: currentColor;
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
  transition: border-color var(--transition-fast);
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
.products-page__grid-wrapper {
  position: relative;
}

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

.products-page__empty-btn {
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.products-page__empty-btn:hover {
  background: var(--accent-hover);
}

/* ===== Load More ===== */
.products-page__load-more {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.products-page__load-more-spinner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.products-page__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.products-page__end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.products-page__end svg {
  stroke: var(--success);
}

/* ===== Transitions ===== */
.product-fade-enter-active {
  transition: all var(--transition-smooth);
}

.product-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.filter-overlay-enter-active,
.filter-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.filter-overlay-enter-from,
.filter-overlay-leave-to {
  opacity: 0;
}

.filter-overlay-enter-active .products-page__mobile-filter-panel,
.filter-overlay-leave-active .products-page__mobile-filter-panel {
  transition: transform 0.3s ease;
}

.filter-overlay-enter-from .products-page__mobile-filter-panel {
  transform: translateX(100%);
}

.filter-overlay-leave-to .products-page__mobile-filter-panel {
  transform: translateX(100%);
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .products-page__layout {
    grid-template-columns: 1fr;
  }

  .products-page__sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .products-page__header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .products-page__header-stats {
    width: 100%;
    justify-content: space-between;
  }

  .products-page__toolbar {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .products-page__active-filters {
    order: 3;
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

  .products-page__filter-toggle span:not(.products-page__filter-badge) {
    display: none;
  }

  .products-page__filter-toggle {
    padding: 0.75rem;
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

  .products-page__spinner {
    animation: none;
  }
}
</style>
