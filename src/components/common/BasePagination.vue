<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="pagination__btn"
      :disabled="currentPage === 1"
      @click="$emit('update:currentPage', currentPage - 1)"
      :aria-label="$t('products.previous')"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>

    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="pagination__dots">...</span>
      <button
        v-else
        :class="['pagination__btn', { 'pagination__btn--active': page === currentPage }]"
        @click="$emit('update:currentPage', page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      class="pagination__btn"
      :disabled="currentPage === totalPages"
      @click="$emit('update:currentPage', currentPage + 1)"
      :aria-label="$t('products.next')"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  maxVisible: { type: Number, default: 5 }
})

defineEmits(['update:currentPage'])

const visiblePages = computed(() => {
  const pages = []
  const { currentPage, totalPages, maxVisible } = props

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  let start = Math.max(2, currentPage - 1)
  let end = Math.min(totalPages - 1, currentPage + 1)

  if (currentPage <= 3) {
    end = Math.min(maxVisible - 1, totalPages - 1)
  } else if (currentPage >= totalPages - 2) {
    start = Math.max(2, totalPages - maxVisible + 2)
  }

  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('...')

  pages.push(totalPages)
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.125rem, 0.4vw, 0.25rem);
  padding: clamp(1rem, 2.5vh, 1.5rem) 0;
}

.pagination__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(2rem, 4vw, 2.25rem);
  height: clamp(2rem, 4vw, 2.25rem);
  border-radius: var(--radius-md);
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.pagination__btn:hover:not(:disabled):not(.pagination__btn--active) {
  background: var(--surface-2);
  color: var(--text-primary);
  transform: translateY(clamp(-0.0625rem, -0.15vw, -0.125rem));
}

.pagination__btn--active {
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  color: white;
  box-shadow: 0 clamp(0.125rem, 0.4vw, 0.25rem) clamp(0.5rem, 1vw, 0.75rem) rgba(139, 92, 246, 0.3);
}

.pagination__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination__dots {
  display: flex;
  align-items: center;
  padding: 0 clamp(0.125rem, 0.4vw, 0.25rem);
  color: var(--text-muted);
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
}
</style>
