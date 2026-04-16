<template>
  <aside class="filter-sidebar" :class="{ 'filter-sidebar--open': mobileOpen }">
    <div class="filter-sidebar__header">
      <h2 class="filter-sidebar__title">{{ $t('products.filters') || 'Filters' }}</h2>
      <button
        v-if="hasActiveFilters"
        class="filter-sidebar__clear"
        @click="clearAllFilters"
      >
        {{ $t('products.clearAll') || 'Clear all' }}
      </button>
      <button
        class="filter-sidebar__close-mobile"
        @click="mobileOpen = false"
        aria-label="Close filters"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="filter-sidebar__content">
      <!-- Price Range Filter -->
      <div v-if="priceRange.max > 0" class="filter-section">
        <h3 class="filter-section__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          {{ $t('products.priceRange') || 'Price Range' }}
        </h3>
        <div class="filter-section__content">
          <div class="price-range">
            <div class="price-range__inputs">
              <div class="price-range__input-group">
                <label class="price-range__label">{{ $t('products.min') || 'Min' }}</label>
                <input
                  type="number"
                  :value="localMin"
                  @input="updateMin($event.target.value)"
                  :min="0"
                  :max="priceRange.max"
                  :step="priceStep"
                  class="price-range__input"
                  :placeholder="formatPrice(0)"
                />
              </div>
              <span class="price-range__separator">-</span>
              <div class="price-range__input-group">
                <label class="price-range__label">{{ $t('products.max') || 'Max' }}</label>
                <input
                  type="number"
                  :value="localMax"
                  @input="updateMax($event.target.value)"
                  :min="0"
                  :max="priceRange.max"
                  :step="priceStep"
                  class="price-range__input"
                  :placeholder="formatPrice(priceRange.max)"
                />
              </div>
            </div>
            <div class="price-range__sliders">
              <ElasticSlider
                :default-value="localMin ?? 0"
                :starting-value="0"
                :max-value="priceRange.max"
                :is-stepped="true"
                :step-size="priceStep"
                class-name="price-range__slider-min"
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
                class-name="price-range__slider-max"
                @change="onMaxSliderChange"
              >
                <template #left-icon>
                  <span class="slider-icon">R$</span>
                </template>
              </ElasticSlider>
            </div>
          </div>
        </div>
      </div>

      <!-- Collections Filter -->
      <div v-if="collectionsWithProducts.length > 1" class="filter-section">
        <h3 class="filter-section__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          {{ $t('products.collections') || 'Collections' }}
        </h3>
        <div class="filter-section__content">
          <div class="collection-list">
            <label
              v-for="collection in collectionsWithProducts"
              :key="collection.id"
              class="collection-item"
              :class="{ 'collection-item--active': isCollectionSelected(collection.id) }"
            >
              <input
                type="checkbox"
                :checked="isCollectionSelected(collection.id)"
                @change="toggleCollection(collection.id)"
                class="collection-item__checkbox"
              />
              <span class="collection-item__name">{{ collection.name }}</span>
              <span class="collection-item__count">{{ collection.productCount }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Active Filters Summary -->
      <div v-if="hasActiveFilters" class="filter-section filter-section--active">
        <h3 class="filter-section__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ $t('products.activeFilters') || 'Active Filters' }}
        </h3>
        <div class="filter-section__content">
          <div class="active-filters">
            <span v-if="localMin !== null && localMin > 0" class="active-filter-tag">
              {{ $t('products.min') || 'Min' }}: {{ formatPrice(localMin) }}
              <button @click="updateMin(null)" class="active-filter-tag__remove">&times;</button>
            </span>
            <span v-if="localMax !== null && localMax < priceRange.max" class="active-filter-tag">
              {{ $t('products.max') || 'Max' }}: {{ formatPrice(localMax) }}
              <button @click="updateMax(null)" class="active-filter-tag__remove">&times;</button>
            </span>
            <span
              v-for="collectionId in productStore.activeCollections"
              :key="`coll-${collectionId}`"
              class="active-filter-tag"
            >
              {{ getCollectionName(collectionId) }}
              <button @click="toggleCollection(collectionId)" class="active-filter-tag__remove">&times;</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Mobile overlay -->
  <div v-if="mobileOpen" class="filter-sidebar__overlay" @click="mobileOpen = false"></div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useProductStore } from '../../stores/products'
import ElasticSlider from './ElasticSlider.vue'

const productStore = useProductStore()
const mobileOpen = ref(false)

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

const collectionsWithProducts = computed(() => productStore.collectionsWithProducts)

const hasActiveFilters = computed(() => {
  return (localMin.value !== null && localMin.value > 0) ||
    (localMax.value !== null && localMax.value < priceRange.value.max) ||
    productStore.activeCollections.length > 0
})

// Initialize local values from store
onMounted(() => {
  localMin.value = productStore.minPrice ?? 0
  localMax.value = productStore.maxPrice ?? priceRange.value.max
})

// Sync from store changes
watch(() => productStore.minPrice, (val) => {
  localMin.value = val ?? 0
})

watch(() => productStore.maxPrice, (val) => {
  localMax.value = val ?? priceRange.value.max
})

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
  productStore.clearFilters()
}

// Expose for mobile toggle
defineExpose({
  open: () => { mobileOpen.value = true }
})
</script>

<style scoped>
.filter-sidebar {
  width: clamp(240px, 18vw, 300px);
  flex-shrink: 0;
  background: var(--surface-0);
  border-radius: var(--radius-lg);
  border: 0.0625rem solid var(--border);
  height: fit-content;
  position: sticky;
  top: clamp(1rem, 3vh, 1.5rem);
  overflow: hidden;
}

.filter-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(0.75rem, 1.5vw, 1rem) clamp(1rem, 2vw, 1.25rem);
  border-bottom: 0.0625rem solid var(--border);
}

.filter-sidebar__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-sidebar__clear {
  font-size: 0.75rem;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.filter-sidebar__clear:hover {
  background: var(--accent-subtle);
}

.filter-sidebar__close-mobile {
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.filter-sidebar__close-mobile:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.filter-sidebar__content {
  padding: clamp(0.75rem, 1.5vw, 1rem) clamp(1rem, 2vw, 1.25rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vh, 1.5rem);
  max-height: calc(100vh - clamp(10rem, 15vh, 15rem));
  overflow-y: auto;
}

.filter-sidebar__overlay {
  display: none;
}

/* Filter Section */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vw, 0.75rem);
}

.filter-section--active {
  padding: clamp(0.5rem, 1vw, 0.75rem);
  background: var(--accent-subtle);
  border-radius: var(--radius-md);
  border: 0.0625rem solid var(--accent);
}

.filter-section__title {
  font-size: clamp(0.7rem, 1.1vw, 0.8rem);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.filter-section__content {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

/* Price Range */
.price-range {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vw, 1rem);
}

.price-range__inputs {
  display: flex;
  align-items: flex-end;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.price-range__input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(0.125rem, 0.3vw, 0.25rem);
}

.price-range__label {
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  color: var(--text-muted);
  font-weight: 500;
}

.price-range__input {
  width: 100%;
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.625rem);
  border-radius: var(--radius-md);
  border: 0.0625rem solid var(--border);
  background: var(--surface-1);
  color: var(--text-primary);
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
  font-family: var(--font-mono);
  transition: all var(--transition-fast);
}

.price-range__input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 clamp(0.125rem, 0.3vw, 0.25rem) var(--accent-subtle);
}

.price-range__input::-webkit-inner-spin-button {
  opacity: 1;
}

.price-range__separator {
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
  color: var(--text-muted);
  padding-bottom: clamp(0.375rem, 0.75vw, 0.5rem);
}

.price-range__sliders {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.price-range__slider-min,
.price-range__slider-max {
  width: 100%;
}

.slider-icon {
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* Collection List */
.collection-list {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.collection-item {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 1vw, 0.625rem);
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.625rem);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 0.0625rem solid transparent;
}

.collection-item:hover {
  background: var(--surface-2);
}

.collection-item--active {
  background: var(--accent-subtle);
  border-color: var(--accent);
}

.collection-item__checkbox {
  appearance: none;
  width: clamp(0.875rem, 1.5vw, 1rem);
  height: clamp(0.875rem, 1.5vw, 1rem);
  border-radius: var(--radius-sm);
  border: 0.0625rem solid var(--border);
  background: var(--surface-1);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  flex-shrink: 0;
}

.collection-item__checkbox:checked {
  background: var(--accent);
  border-color: var(--accent);
}

.collection-item__checkbox:checked::after {
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

.collection-item__name {
  flex: 1;
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 500;
}

.collection-item__count {
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  font-family: var(--font-mono);
  color: var(--text-muted);
  padding: clamp(0.0625rem, 0.2vw, 0.1rem) clamp(0.3rem, 0.6vw, 0.45rem);
  border-radius: var(--radius-full);
  background: var(--surface-2);
}

.collection-item--active .collection-item__count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Active Filters */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.active-filter-tag {
  display: inline-flex;
  align-items: center;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
  padding: clamp(0.125rem, 0.3vw, 0.25rem) clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.125rem, 0.3vw, 0.25rem) clamp(0.5rem, 1vw, 0.625rem);
  border-radius: var(--radius-full);
  background: var(--surface-0);
  border: 0.0625rem solid var(--accent);
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  color: var(--text-primary);
  font-weight: 500;
}

.active-filter-tag__remove {
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

.active-filter-tag__remove:hover {
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

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .filter-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: clamp(280px, 85vw, 320px);
    max-width: 85vw;
    z-index: 1000;
    border-radius: 0;
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    overflow-y: auto;
  }

  .filter-sidebar--open {
    transform: translateX(0);
  }

  .filter-sidebar__overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    backdrop-filter: blur(clamp(0.125rem, 0.5vw, 0.25rem));
  }

  .filter-sidebar__close-mobile {
    display: inline-flex;
  }

  .filter-sidebar__content {
    max-height: none;
  }
}

@media (max-width: 480px) {
  .filter-sidebar {
    width: 100vw;
    max-width: 100vw;
  }

  .price-range__inputs {
    flex-direction: column;
    gap: clamp(0.5rem, 1.5vw, 0.75rem);
  }

  .price-range__separator {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .filter-sidebar {
    transition: none;
  }
}
</style>
