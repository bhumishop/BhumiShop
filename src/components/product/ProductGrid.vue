<template>
  <div class="product-grid">
    <div v-if="loading" class="product-grid__skeleton">
      <BaseSkeleton v-for="i in 8" :key="i" variant="card" />
    </div>

    <div v-else-if="products.length === 0" class="product-grid__empty">
      <p>{{ $t('products.notFound') }}</p>
    </div>

    <div v-else class="product-grid__grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

    <BasePagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:current-page="setPage"
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { staggerGrid, createAnimationContext } from '../../utils/animations'
import ProductCard from './ProductCard.vue'
import BaseSkeleton from '../common/BaseSkeleton.vue'
import BasePagination from '../common/BasePagination.vue'

const props = defineProps({
  products: { type: Array, required: true },
  loading: Boolean,
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 }
})

const emit = defineEmits(['update:currentPage'])
let ctx = null
let gridAnim = null

function setPage(page) {
  emit('update:currentPage', page)
}

function animateProducts() {
  // Kill previous animation
  if (gridAnim) {
    gridAnim.kill()
    gridAnim = null
  }

  if (props.loading || props.products.length === 0) return

  // Use nextTick for DOM update
  nextTick(() => {
    gridAnim = staggerGrid('.product-card', {
      fromY: 25,
      fromScale: 0.97,
      duration: 0.45,
      stagger: 0.06,
      ease: 'power3.out',
    })
  })
}

onMounted(() => {
  ctx = createAnimationContext()
  animateProducts()
})

watch(() => props.products, () => {
  animateProducts()
}, { deep: false })

watch(() => props.currentPage, () => {
  // Re-animate on page change
  animateProducts()
})

onUnmounted(() => {
  if (gridAnim) {
    gridAnim.kill()
    gridAnim = null
  }
  if (ctx) {
    ctx.revert()
    ctx = null
  }
})
</script>

<style scoped>
.product-grid__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(clamp(13rem, 25vw, 15rem), 100%), 1fr));
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

.product-grid__skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(clamp(13rem, 25vw, 15rem), 100%), 1fr));
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

.product-grid__empty {
  text-align: center;
  padding: clamp(2.5rem, 8vh, 4rem) clamp(1rem, 3vw, 1.5rem);
  color: var(--text-muted);
  font-size: clamp(0.9rem, 1.5vw, 1rem);
}
</style>
