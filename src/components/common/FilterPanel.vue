<template>
  <div class="filter-panel">
    <!-- Header -->
    <div class="filter-panel__header">
      <div class="filter-panel__title-group">
        <svg class="filter-panel__title-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="8" y1="12" x2="20" y2="12"/>
          <line x1="12" y1="18" x2="20" y2="18"/>
          <circle cx="4" cy="6" r="2" fill="currentColor"/>
          <circle cx="8" cy="12" r="2" fill="currentColor"/>
          <circle cx="12" cy="18" r="2" fill="currentColor"/>
        </svg>
        <h3 class="filter-panel__title">{{ $t('products.filters') || 'Filters' }}</h3>
      </div>
      <button
        v-if="hasActiveFilters"
        class="filter-panel__clear"
        @click="clearAllFilters"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        {{ $t('products.clearAll') || 'Clear all' }}
      </button>
    </div>

    <!-- Categories Filter -->
    <div class="filter-panel__section">
      <h4 class="filter-panel__section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
        </svg>
        {{ $t('products.categories') || 'Categories' }}
      </h4>
      <div class="filter-panel__categories">
        <button
          :class="['filter-panel__category', { 'filter-panel__category--active': !activeCategory }]"
          @click="onCategorySelect('')"
        >
          <span class="filter-panel__category-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12l2 2 4-4"/>
            </svg>
          </span>
          <span class="filter-panel__category-name">{{ $t('products.all') }}</span>
          <span class="filter-panel__category-count">{{ totalCount }}</span>
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['filter-panel__category', { 'filter-panel__category--active': activeCategory === cat.id }]"
          @click="onCategorySelect(cat.id)"
        >
          <span v-if="cat.icon" class="filter-panel__category-icon--emoji">{{ cat.icon }}</span>
          <span class="filter-panel__category-name">{{ cat.name }}</span>
          <span class="filter-panel__category-count">{{ cat.productCount }}</span>
        </button>
      </div>
    </div>

    <!-- Price Range Filter -->
    <div class="filter-panel__section">
      <h4 class="filter-panel__section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        {{ $t('products.price') || 'Price' }}
      </h4>
      <div class="filter-panel__price">
        <div class="filter-panel__price-display">
          <span class="filter-panel__price-label">{{ $t('products.maxPriceLabel') }}</span>
          <span class="filter-panel__price-value">R$ {{ displayMaxPrice }}</span>
        </div>
        <ElasticSlider
          :default-value="displayMaxPrice"
          :max-value="priceRangeMax"
          :starting-value="0"
          :is-stepped="true"
          :step-size="10"
          class-name="filter-panel__slider"
          @change="onSliderChange"
        >
          <template #left-icon>R$</template>
        </ElasticSlider>
        <div class="filter-panel__price-inputs">
          <div class="filter-panel__price-field">
            <label class="filter-panel__price-field-label">{{ $t('products.minPriceLabel') }}</label>
            <input
              type="number"
              :value="minPrice"
              @input="onMinPriceInput"
              class="filter-panel__price-field-input"
              placeholder="0"
              min="0"
              :max="maxPrice"
            />
          </div>
          <div class="filter-panel__price-field">
            <label class="filter-panel__price-field-label">{{ $t('products.maxPriceLabel') }}</label>
            <input
              type="number"
              :value="displayMaxPrice"
              @input="onMaxPriceInput"
              class="filter-panel__price-field-input"
              placeholder="1000"
              :min="minPrice"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Sort Options -->
    <div class="filter-panel__section">
      <h4 class="filter-panel__section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M3 12h12M3 18h6"/>
        </svg>
        {{ $t('products.sort') || 'Sort by' }}
      </h4>
      <div class="filter-panel__sort">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          :class="['filter-panel__sort-option', { 'filter-panel__sort-option--active': sortBy === option.value }]"
          @click="onSortSelect(option.value)"
        >
          <span class="filter-panel__sort-icon">
            <svg v-if="option.value === 'newest'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            <svg v-else-if="option.value === 'price-asc'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
            <svg v-else-if="option.value === 'price-desc'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </span>
          <span class="filter-panel__sort-label">{{ option.label }}</span>
          <svg v-if="sortBy === option.value" class="filter-panel__sort-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ElasticSlider from './ElasticSlider.vue'

const { t } = useI18n()

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  activeCategory: {
    type: String,
    default: ''
  },
  sortBy: {
    type: String,
    default: 'newest'
  },
  maxPrice: {
    type: Number,
    default: null
  },
  priceRangeMax: {
    type: Number,
    default: 1000
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:category', 'update:sortBy', 'update:maxPrice', 'clear'])

const displayMaxPrice = computed(() => props.maxPrice !== null ? props.maxPrice : props.priceRangeMax)
const minPrice = ref(0)

const sortOptions = computed(() => [
  { value: 'newest', label: t('products.sortNewestFirst') },
  { value: 'price-asc', label: t('products.sortPriceAsc') },
  { value: 'price-desc', label: t('products.sortPriceDesc') },
  { value: 'name-asc', label: t('products.sortNameAsc') }
])

const hasActiveFilters = computed(() => {
  return props.activeCategory || props.maxPrice !== null || props.sortBy !== 'newest'
})

function onCategorySelect(catId) {
  emit('update:category', catId)
}

function onSortSelect(sortValue) {
  emit('update:sortBy', sortValue)
}

function onSliderChange(value) {
  const roundedValue = Math.round(value)
  emit('update:maxPrice', roundedValue)
}

function onMinPriceInput(e) {
  const value = parseFloat(e.target.value) || 0
  minPrice.value = Math.max(0, value)
}

function onMaxPriceInput(e) {
  const value = parseFloat(e.target.value)
  if (!isNaN(value)) {
    emit('update:maxPrice', value)
  }
}

function clearAllFilters() {
  emit('clear')
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2.5vh, 1.75rem);
  padding: clamp(1.25rem, 2vw, 1.5rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  height: fit-content;
  position: sticky;
  top: calc(var(--header-height-fixed) + 1rem);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
}

/* ===== Header ===== */
.filter-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.filter-panel__title-group {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.filter-panel__title-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.filter-panel__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.filter-panel__clear {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent);
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-md);
  background: var(--accent-light);
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-panel__clear:hover {
  background: var(--accent-subtle);
  border-color: var(--accent-subtle);
  color: var(--accent-hover);
}

/* ===== Sections ===== */
.filter-panel__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-panel__section-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0;
}

.filter-panel__section-title svg {
  stroke: currentColor;
  opacity: 0.7;
}

/* ===== Categories ===== */
.filter-panel__categories {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-panel__category {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.filter-panel__category:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.filter-panel__category--active {
  background: var(--accent-light);
  color: var(--accent);
  border-color: var(--accent-subtle);
  font-weight: 500;
}

.filter-panel__category--active:hover {
  background: var(--accent-subtle);
}

.filter-panel__category-icon--emoji {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  flex-shrink: 0;
}

.filter-panel__category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  flex-shrink: 0;
}

.filter-panel__category-icon svg {
  stroke: currentColor;
}

.filter-panel__category--active .filter-panel__category-icon svg {
  stroke: var(--accent);
}

.filter-panel__category-name {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-panel__category-count {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  background: var(--surface-2);
  color: var(--text-muted);
  flex-shrink: 0;
  font-weight: 500;
}

.filter-panel__category--active .filter-panel__category-count {
  background: var(--accent);
  color: white;
}

/* ===== Price ===== */
.filter-panel__price {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-panel__price-display {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.65rem 0.75rem;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.filter-panel__price-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-panel__price-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  font-family: var(--font-mono);
}

.filter-panel__price-inputs {
  display: flex;
  gap: 0.65rem;
}

.filter-panel__price-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-panel__price-field-label {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.filter-panel__price-field-input {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: var(--font-mono);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.filter-panel__price-field-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-subtle);
  background: var(--surface-0);
}

.filter-panel__price-field-input::placeholder {
  color: var(--text-muted);
  opacity: 0.5;
}

.filter-panel__slider {
  width: 100%;
}

/* ===== Sort ===== */
.filter-panel__sort {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-panel__sort-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  position: relative;
}

.filter-panel__sort-option:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.filter-panel__sort-option--active {
  background: var(--accent-light);
  color: var(--accent);
  border-color: var(--accent-subtle);
  font-weight: 500;
}

.filter-panel__sort-option--active:hover {
  background: var(--accent-subtle);
}

.filter-panel__sort-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  flex-shrink: 0;
}

.filter-panel__sort-icon svg {
  stroke: currentColor;
}

.filter-panel__sort-label {
  flex: 1;
}

.filter-panel__sort-check {
  flex-shrink: 0;
  stroke: var(--accent);
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .filter-panel {
    position: static;
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 768px) {
  .filter-panel {
    padding: 1rem;
    gap: 1.25rem;
  }

  .filter-panel__price-inputs {
    gap: 0.5rem;
  }

  .filter-panel__category {
    padding: 0.6rem 0.65rem;
  }

  .filter-panel__sort-option {
    padding: 0.6rem 0.65rem;
  }
}

@media (max-width: 480px) {
  .filter-panel {
    padding: 0.875rem;
    gap: 1rem;
  }

  .filter-panel__title {
    font-size: 0.95rem;
  }

  .filter-panel__category,
  .filter-panel__sort-option {
    padding: 0.55rem 0.6rem;
    gap: 0.65rem;
    font-size: 0.8rem;
  }

  .filter-panel__price-value {
    font-size: 1rem;
  }
}
</style>
