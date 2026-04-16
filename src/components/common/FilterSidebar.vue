<template>
  <aside class="filter-dock" :class="{ 'filter-dock--open': mobileOpen }">
    <!-- Dock Header -->
    <div class="filter-dock__header">
      <div class="filter-dock__title-row">
        <h2 class="filter-dock__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="20" y2="12"/>
            <line x1="12" y1="18" x2="20" y2="18"/>
            <circle cx="6" cy="6" r="2" fill="currentColor"/>
            <circle cx="10" cy="12" r="2" fill="currentColor"/>
            <circle cx="14" cy="18" r="2" fill="currentColor"/>
          </svg>
          {{ $t('products.filters') }}
        </h2>
        <button
          v-if="hasActiveFilters"
          class="filter-dock__clear"
          @click="clearAllFilters"
        >
          {{ $t('products.clearAll') }}
        </button>
      </div>
      <button
        class="filter-dock__close-mobile"
        @click="mobileOpen = false"
        aria-label="Close filters"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Dock Content -->
    <div class="filter-dock__content">
      <!-- Product Types (Categories) - Auto-detected, only show if >1 product -->
      <div v-if="categoriesWithProducts.length > 0" class="dock-section">
        <h3 class="dock-section__title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          {{ $t('products.productTypes') || 'Product Types' }}
        </h3>
        <div class="dock-section__list">
          <button
            :class="['dock-item', { 'dock-item--active': activeCategory === '' }]"
            @click="setCategory('')"
          >
            <span class="dock-item__label">{{ $t('products.all') || 'All' }}</span>
            <span class="dock-item__count">{{ productStore.activeProductCount }}</span>
          </button>
          <button
            v-for="cat in categoriesWithProducts"
            :key="cat.id"
            :class="['dock-item', { 'dock-item--active': activeCategory === cat.id }]"
            @click="setCategory(cat.id)"
          >
            <span v-if="cat.icon" class="dock-item__icon">{{ cat.icon }}</span>
            <span class="dock-item__label">{{ cat.name }}</span>
            <span class="dock-item__count">{{ cat.productCount }}</span>
          </button>
        </div>
      </div>

      <!-- Price Range Filter -->
      <div v-if="priceRange.max > 0" class="dock-section dock-section--price">
        <h3 class="dock-section__title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          {{ $t('products.priceRange') }}
        </h3>
        <div class="price-filter">
          <div class="price-filter__inputs">
            <div class="price-filter__group">
              <label class="price-filter__label">{{ $t('products.min') }}</label>
              <input
                type="number"
                :value="localMin"
                @input="updateMin($event.target.value)"
                :min="0"
                :max="priceRange.max"
                :step="priceStep"
                class="price-filter__input"
                :placeholder="formatPrice(0)"
              />
            </div>
            <span class="price-filter__separator">–</span>
            <div class="price-filter__group">
              <label class="price-filter__label">{{ $t('products.max') }}</label>
              <input
                type="number"
                :value="localMax"
                @input="updateMax($event.target.value)"
                :min="0"
                :max="priceRange.max"
                :step="priceStep"
                class="price-filter__input"
                :placeholder="formatPrice(priceRange.max)"
              />
            </div>
          </div>
          <div class="price-filter__sliders">
            <ElasticSlider
              :default-value="localMin ?? 0"
              :starting-value="0"
              :max-value="priceRange.max"
              :is-stepped="true"
              :step-size="priceStep"
              class-name="price-filter__slider-min"
              @change="onMinSliderChange"
            >
              <template #left-icon>
                <span class="slider-icon">R$</span>
              </template>
            </ElasticSlider>
            <ElasticSlider
              :default-value="localMax ?? priceRange.max"
              :starting-value="0"
              :max-value="priceRange.max"
              :is-stepped="true"
              :step-size="priceStep"
              class-name="price-filter__slider-max"
              @change="onMaxSliderChange"
            >
              <template #left-icon>
                <span class="slider-icon">R$</span>
              </template>
            </ElasticSlider>
          </div>
        </div>
      </div>

      <!-- Collections Filter -->
      <div v-if="collectionsWithProducts.length > 1" class="dock-section">
        <h3 class="dock-section__title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          {{ $t('products.collections') }}
        </h3>
        <div class="dock-section__list">
          <label
            v-for="collection in collectionsWithProducts"
            :key="collection.id"
            :class="['dock-collection', { 'dock-collection--active': isCollectionSelected(collection.id) }]"
          >
            <input
              type="checkbox"
              :checked="isCollectionSelected(collection.id)"
              @change="toggleCollection(collection.id)"
              class="dock-collection__checkbox"
            />
            <span class="dock-collection__name">{{ collection.name }}</span>
            <span class="dock-collection__count">{{ collection.productCount }}</span>
          </label>
        </div>
      </div>

      <!-- Active Filters Summary -->
      <div v-if="hasActiveFilters" class="dock-section dock-section--active">
        <h3 class="dock-section__title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ $t('products.activeFilters') }}
        </h3>
        <div class="active-tags">
          <span v-if="localMin !== null && localMin > 0" class="active-tag">
            {{ $t('products.min') }}: {{ formatPrice(localMin) }}
            <button @click="updateMin(null)" class="active-tag__remove">&times;</button>
          </span>
          <span v-if="localMax !== null && localMax < priceRange.max" class="active-tag">
            {{ $t('products.max') }}: {{ formatPrice(localMax) }}
            <button @click="updateMax(null)" class="active-tag__remove">&times;</button>
          </span>
          <span
            v-for="collectionId in productStore.activeCollections"
            :key="`coll-${collectionId}`"
            class="active-tag"
          >
            {{ getCollectionName(collectionId) }}
            <button @click="toggleCollection(collectionId)" class="active-tag__remove">&times;</button>
          </span>
          <span v-if="activeCategory !== ''" class="active-tag">
            {{ getCategoryName(activeCategory) }}
            <button @click="setCategory('')" class="active-tag__remove">&times;</button>
          </span>
        </div>
      </div>
    </div>

    <!-- Mobile overlay -->
    <div v-if="mobileOpen" class="filter-dock__overlay" @click="mobileOpen = false"></div>
  </aside>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useProductStore } from '../../stores/products'
import ElasticSlider from './ElasticSlider.vue'

const productStore = useProductStore()
const mobileOpen = ref(false)
const activeCategory = ref('')

// Local state for price inputs (debounced apply)
const localMin = ref(null)
const localMax = ref(null)
let applyTimeout = null

// Compute price range from products
const priceRange = computed(() => {
  const products = productStore.products.filter(p => p.is_active !== false && p.is_archived !== true && p.price)
  if (products.length === 0) return { min: 0, max: 0 }

  const prices = products.map(p => p.price)
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices))
  }
})

const priceStep = computed(() => {
  const range = priceRange.value.max - priceRange.value.min
  if (range <= 10) return 1
  if (range <= 100) return 5
  if (range <= 500) return 10
  return 50
})

// Only show categories with >1 product
const categoriesWithProducts = computed(() =>
  productStore.categoriesWithProducts.filter(c => c.productCount > 1)
)

const collectionsWithProducts = computed(() => productStore.collectionsWithProducts)

const hasActiveFilters = computed(() => {
  return (localMin.value !== null && localMin.value > 0) ||
    (localMax.value !== null && localMax.value < priceRange.value.max) ||
    productStore.activeCollections.length > 0 ||
    activeCategory.value !== ''
})

// Initialize local values from store
onMounted(() => {
  // Use next tick to ensure parent has mounted and store may have data
  localMin.value = productStore.minPrice ?? 0
  // Defer max initialization - priceRange may be 0 at mount time
  // We'll use a watch to set it correctly once products load
  localMax.value = productStore.maxPrice ?? null
  activeCategory.value = productStore.activeCategory || ''
})

// Sync from store changes
watch(() => productStore.minPrice, (val) => {
  localMin.value = val ?? 0
})

// Sync max price - only set from store when products are loaded
watch(() => priceRange.value.max, (newMax) => {
  // Only initialize localMax if it hasn't been explicitly set
  if (productStore.maxPrice === null || productStore.maxPrice === undefined) {
    localMax.value = newMax
  }
})

watch(() => productStore.maxPrice, (val) => {
  localMax.value = val ?? priceRange.value.max
})

watch(() => productStore.activeCategory, (val) => {
  activeCategory.value = val || ''
}, { immediate: true })

function formatPrice(value) {
  if (value === null || value === undefined) return ''
  return `R$ ${Number(value).toFixed(2)}`
}

function updateMin(value) {
  const num = value === '' || value === null ? null : parseFloat(value)
  localMin.value = num

  // Debounce the store update
  if (applyTimeout) clearTimeout(applyTimeout)
  applyTimeout = setTimeout(() => {
    productStore.setPriceRange(
      num !== null && num > 0 ? num : null,
      localMax.value !== null && localMax.value < priceRange.value.max ? localMax.value : null
    )
  }, 400)
}

function updateMax(value) {
  const num = value === '' || value === null ? null : parseFloat(value)
  localMax.value = num

  // Debounce the store update
  if (applyTimeout) clearTimeout(applyTimeout)
  applyTimeout = setTimeout(() => {
    productStore.setPriceRange(
      localMin.value !== null && localMin.value > 0 ? localMin.value : null,
      num !== null && num < priceRange.value.max ? num : null
    )
  }, 400)
}

function onMinSliderChange(value) {
  localMin.value = Math.round(value)
  productStore.setPriceRange(
    localMin.value > 0 ? localMin.value : null,
    localMax.value !== null && localMax.value < priceRange.value.max ? localMax.value : null
  )
}

function onMaxSliderChange(value) {
  localMax.value = Math.round(value)
  productStore.setPriceRange(
    localMin.value !== null && localMin.value > 0 ? localMin.value : null,
    localMax.value < priceRange.value.max ? localMax.value : null
  )
}

function setCategory(catId) {
  activeCategory.value = catId
  productStore.setActiveCategory(catId)
}

function getCategoryName(catId) {
  const cat = productStore.categoriesWithProducts.find(c => c.id === catId)
  return cat?.name || `Category ${catId}`
}

function isCollectionSelected(id) {
  return productStore.activeCollections.includes(id)
}

function toggleCollection(id) {
  productStore.toggleCollection(id)
}

function getCollectionName(id) {
  const coll = collectionsWithProducts.value.find(c => c.id === id)
  return coll?.name || `Collection ${id}`
}

function clearAllFilters() {
  localMin.value = 0
  localMax.value = priceRange.value.max
  activeCategory.value = ''
  productStore.clearFilters()
}

// Expose for mobile toggle
defineExpose({
  open: () => { mobileOpen.value = true }
})
</script>

<style scoped>
/* ===== Modern Filter Dock ===== */
.filter-dock {
  width: 280px;
  flex-shrink: 0;
  background: var(--surface-0);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  height: fit-content;
  position: sticky;
  top: clamp(1rem, 3vh, 1.5rem);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
}

/* Dock Header */
.filter-dock__header {
  padding: clamp(1rem, 2vw, 1.25rem);
  border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, var(--surface-0), var(--surface-2));
}

.filter-dock__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.filter-dock__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.01em;
}

.filter-dock__clear {
  font-size: 0.7rem;
  color: var(--accent);
  background: var(--accent-subtle);
  border: 1px solid var(--accent);
  cursor: pointer;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  font-weight: 600;
}

.filter-dock__clear:hover {
  background: var(--accent);
  color: white;
}

.filter-dock__close-mobile {
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.filter-dock__close-mobile:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

/* Dock Content */
.filter-dock__content {
  padding: clamp(0.875rem, 1.5vw, 1rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1.125rem, 2.5vh, 1.5rem);
  max-height: calc(100vh - clamp(12rem, 18vh, 18rem));
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
}

.filter-dock__content::-webkit-scrollbar {
  width: 4px;
}

.filter-dock__content::-webkit-scrollbar-track {
  background: transparent;
}

.filter-dock__content::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border-radius: var(--radius-full);
}

/* Dock Section */
.dock-section {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vw, 0.625rem);
}

.dock-section__title {
  font-size: clamp(0.65rem, 1vw, 0.725rem);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.6vw, 0.5rem);
}

.dock-section__list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Dock Items (Category buttons) */
.dock-item {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.625rem);
  padding: clamp(0.5rem, 0.8vw, 0.625rem) clamp(0.625rem, 1vw, 0.75rem);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
  background: none;
  width: 100%;
  text-align: left;
}

.dock-item:hover {
  background: var(--surface-2);
  border-color: var(--border);
}

.dock-item--active {
  background: var(--accent-subtle);
  border-color: var(--accent);
}

.dock-item--active:hover {
  background: var(--accent-subtle);
  border-color: var(--accent);
}

.dock-item__icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.dock-item__label {
  flex: 1;
  font-size: clamp(0.775rem, 1.2vw, 0.85rem);
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dock-item--active .dock-item__label {
  color: var(--accent);
  font-weight: 600;
}

.dock-item__count {
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  font-family: var(--font-mono);
  color: var(--text-muted);
  padding: clamp(0.125rem, 0.3vw, 0.1875rem) clamp(0.375rem, 0.7vw, 0.5rem);
  border-radius: var(--radius-full);
  background: var(--surface-2);
  flex-shrink: 0;
}

.dock-item--active .dock-item__count {
  background: var(--accent);
  color: white;
}

/* Price Filter */
.price-filter {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vw, 1rem);
}

.price-filter__inputs {
  display: flex;
  align-items: flex-end;
  gap: clamp(0.375rem, 0.6vw, 0.5rem);
}

.price-filter__group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(0.125rem, 0.3vw, 0.25rem);
}

.price-filter__label {
  font-size: clamp(0.6rem, 1vw, 0.675rem);
  color: var(--text-muted);
  font-weight: 500;
}

.price-filter__input {
  width: 100%;
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.625rem);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-1);
  color: var(--text-primary);
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
  font-family: var(--font-mono);
  transition: all var(--transition-fast);
}

.price-filter__input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

.price-filter__separator {
  font-size: clamp(0.875rem, 1.2vw, 1rem);
  color: var(--text-muted);
  padding-bottom: clamp(0.25rem, 0.5vw, 0.375rem);
}

.price-filter__sliders {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vw, 0.625rem);
}

.price-filter__slider-min,
.price-filter__slider-max {
  width: 100%;
}

/* Collections */
.dock-collection {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.625rem);
  padding: clamp(0.5rem, 0.8vw, 0.625rem) clamp(0.625rem, 1vw, 0.75rem);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.dock-collection:hover {
  background: var(--surface-2);
}

.dock-collection--active {
  background: var(--accent-subtle);
  border-color: var(--accent);
}

.dock-collection__checkbox {
  appearance: none;
  width: clamp(0.875rem, 1.5vw, 1rem);
  height: clamp(0.875rem, 1.5vw, 1rem);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-1);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  flex-shrink: 0;
}

.dock-collection__checkbox:checked {
  background: var(--accent);
  border-color: var(--accent);
}

.dock-collection__checkbox:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.5rem;
  height: 0.5rem;
  background: white;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
  mask-size: contain;
  mask-repeat: no-repeat;
}

.dock-collection__name {
  flex: 1;
  font-size: clamp(0.775rem, 1.2vw, 0.85rem);
  color: var(--text-primary);
  font-weight: 500;
}

.dock-collection__count {
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  font-family: var(--font-mono);
  color: var(--text-muted);
  padding: clamp(0.125rem, 0.3vw, 0.1875rem) clamp(0.375rem, 0.7vw, 0.5rem);
  border-radius: var(--radius-full);
  background: var(--surface-2);
}

.dock-collection--active .dock-collection__count {
  background: var(--accent);
  color: white;
}

/* Active Filters Section */
.dock-section--active {
  padding: clamp(0.625rem, 1vw, 0.75rem);
  background: var(--accent-subtle);
  border-radius: var(--radius-md);
  border: 1px solid var(--accent);
}

.active-tags {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.375rem, 0.6vw, 0.5rem);
}

.active-tag {
  display: inline-flex;
  align-items: center;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
  padding: clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 0.8vw, 0.625rem) clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.625rem, 1vw, 0.75rem);
  border-radius: var(--radius-full);
  background: var(--surface-0);
  border: 1px solid var(--accent);
  font-size: clamp(0.6rem, 1vw, 0.675rem);
  color: var(--text-primary);
  font-weight: 500;
}

.active-tag__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(0.875rem, 1.5vw, 1rem);
  height: clamp(0.875rem, 1.5vw, 1rem);
  border-radius: 50%;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
  line-height: 1;
  transition: all var(--transition-fast);
  padding: 0;
}

.active-tag__remove:hover {
  background: var(--surface-2);
  color: var(--danger, #ef4444);
}

/* ElasticSlider overrides */
:deep(.elastic-slider__bar) {
  height: clamp(0.375rem, 0.75vw, 0.5rem);
  background: var(--surface-3);
}

:deep(.elastic-slider__bar-fill) {
  background: var(--accent);
}

:deep(p.elastic-slider__value) {
  position: relative;
  transform: none;
  font-size: 0.7rem;
  margin-top: 0.25rem;
  text-align: center;
}

.slider-icon {
  font-size: clamp(0.6rem, 1vw, 0.675rem);
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* Mobile overlay */
.filter-dock__overlay {
  display: none;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .filter-dock {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: clamp(300px, 85vw, 340px);
    max-width: 85vw;
    z-index: 1000;
    border-radius: 0;
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    overflow-y: auto;
    box-shadow: none;
  }

  .filter-dock--open {
    transform: translateX(0);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  }

  .filter-dock__overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999;
    backdrop-filter: blur(4px);
  }

  .filter-dock__close-mobile {
    display: inline-flex;
  }

  .filter-dock__content {
    max-height: none;
    padding-bottom: clamp(2rem, 5vh, 3rem);
  }
}

@media (max-width: 480px) {
  .filter-dock {
    width: 100vw;
    max-width: 100vw;
  }

  .price-filter__inputs {
    flex-direction: column;
    gap: clamp(0.5rem, 1.5vw, 0.75rem);
  }

  .price-filter__separator {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .filter-dock {
    transition: none;
  }
}
</style>
