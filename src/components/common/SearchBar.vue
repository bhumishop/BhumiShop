<template>
  <div class="search-bar">
    <svg class="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input
      v-model="query"
      type="search"
      class="search-bar__input"
      :placeholder="$t('products.searchPlaceholder')"
      @input="onSearch"
      @keydown.enter="onSubmit"
    />
    <button v-if="query" class="search-bar__clear" @click="clear" :aria-label="$t('products.clearSearch')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../../stores/products'

const router = useRouter()
const productStore = useProductStore()
const query = ref(productStore.searchQuery || '')

let debounceTimer = null

function onSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    productStore.setSearchQuery(query.value)
  }, 300)
}

function onSubmit() {
  productStore.setSearchQuery(query.value)
  router.push('/produtos')
}

function clear() {
  query.value = ''
  productStore.setSearchQuery('')
}

watch(() => productStore.searchQuery, (val) => {
  if (val !== query.value) query.value = val
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
})
</script>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: clamp(10rem, 20vw, 14rem);
}

.search-bar__icon {
  position: absolute;
  left: 0.625rem;
  color: var(--text-muted);
  pointer-events: none;
  transition: color 0.2s ease;
}

.search-bar__input {
  width: 100%;
  padding: 0.4375rem 1.75rem 0.4375rem 2rem;
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 10px;
  font-size: 0.75rem;
  background: rgba(139, 92, 246, 0.04);
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-bar__input::placeholder {
  color: var(--text-muted);
}

.search-bar__input:focus {
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.08);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.08);
}

.search-bar__input:focus ~ .search-bar__icon {
  color: var(--accent);
}

.search-bar__clear {
  position: absolute;
  right: 0.375rem;
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.search-bar__clear:hover {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .search-bar {
    display: none;
  }
}
</style>
