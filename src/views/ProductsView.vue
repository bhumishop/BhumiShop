<template>
  <div class="products-page container">
    <div class="products-page__header">
      <h1 class="products-page__title">{{ $t('products.title') }}</h1>
    </div>

    <div class="products-page__layout">
      <aside class="products-page__sidebar">
        <div class="filter-group">
          <h3 class="filter-group__title">{{ $t('products.categories') }}</h3>
          <button
            :class="['filter-group__item', { 'filter-group__item--active': activeCategory === '' }]"
            @click="setCategory('')"
          >
            {{ $t('products.all') }}
          </button>
          <button
            v-for="cat in productStore.categories"
            :key="cat.id"
            :class="['filter-group__item', { 'filter-group__item--active': activeCategory === cat.id }]"
            @click="setCategory(cat.id)"
          >
            {{ cat.icon }} {{ cat.name }}
          </button>
        </div>
      </aside>

      <div class="products-page__main">
        <div class="products-page__toolbar">
          <p class="products-page__count">
            {{ $t('products.productCount', { count: productStore.filteredProducts.length }) }}
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '../stores/products'
import ProductGrid from '../components/product/ProductGrid.vue'

const route = useRoute()
const productStore = useProductStore()
const activeCategory = ref('')

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])
  if (route.query.category) {
    activeCategory.value = route.query.category
    productStore.setActiveCategory(route.query.category)
  }
})

watch(() => route.query.category, (val) => {
  if (val) {
    activeCategory.value = val
    productStore.setActiveCategory(val)
  }
})

function setCategory(catId) {
  activeCategory.value = catId
  productStore.setActiveCategory(catId)
}
</script>

<style scoped>
.products-page {
  padding: clamp(1.5rem, 4vh, 2rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vh, 4rem);
}

.products-page__title {
  font-size: clamp(1.375rem, 3.5vw, 1.75rem);
  font-weight: 700;
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.products-page__layout {
  display: grid;
  grid-template-columns: clamp(10rem, 20vw, 12.5rem) 1fr;
  gap: var(--gap-lg);
}

.filter-group__title {
  font-size: clamp(0.7rem, 1.1vw, 0.8rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: clamp(0.5rem, 1.2vh, 0.75rem);
}

.filter-group__item {
  display: block;
  width: 100%;
  text-align: left;
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.75rem);
  border-radius: var(--radius-md);
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  margin-bottom: clamp(0.0625rem, 0.2vh, 0.125rem);
}

.filter-group__item:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.filter-group__item--active {
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
}

.products-page__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.products-page__count {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .products-page__layout {
    grid-template-columns: 1fr;
  }

  .products-page__sidebar {
    display: flex;
    overflow-x: auto;
    gap: clamp(0.375rem, 0.75vw, 0.5rem);
    padding-bottom: clamp(0.375rem, 0.75vh, 0.5rem);
  }

  .filter-group {
    display: flex;
    gap: clamp(0.375rem, 0.75vw, 0.5rem);
  }

  .filter-group__title {
    display: none;
  }

  .filter-group__item {
    white-space: nowrap;
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: clamp(0.3rem, 0.6vw, 0.4rem) clamp(0.75rem, 1.5vw, 1rem);
    font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  }
}
</style>
