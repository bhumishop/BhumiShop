<template>
  <div class="product-grid">
    <div v-if="loading" class="product-grid__skeleton">
      <BaseSkeleton v-for="i in 8" :key="i" variant="card" />
    </div>

    <div v-else-if="products.length === 0" class="product-grid__empty">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="product-grid__empty-icon">
        <circle cx="12" cy="12" r="10"/>
        <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
      <p>{{ $t('products.notFound') }}</p>
    </div>

    <div v-else class="product-grid__layout" ref="gridRef">
      <TransitionGroup
        name="product-grid"
        tag="div"
        class="product-grid__masonry"
      >
        <div
          class="product-grid__card-wrapper"
          v-for="product in products"
          :key="product.id"
        >
          <ProductPixelCard :product="product" />
        </div>
      </TransitionGroup>
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
import { onMounted, onUnmounted, watch, nextTick, ref } from 'vue'
import { gsap } from 'gsap'
import ProductPixelCard from '../common/ProductPixelCard.vue'
import BaseSkeleton from '../common/BaseSkeleton.vue'
import BasePagination from '../common/BasePagination.vue'

const props = defineProps({
  products: { type: Array, required: true },
  loading: Boolean,
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 }
})

const emit = defineEmits(['update:currentPage'])
const gridRef = ref(null)

function setPage(page) {
  emit('update:currentPage', page)
}

function animateProducts() {
  if (props.loading || props.products.length === 0) return

  nextTick(() => {
    const wrappers = document.querySelectorAll('.product-grid__card-wrapper')
    if (!wrappers.length) return

    // FLIP-style: measure old positions
    const oldPositions = new Map()
    wrappers.forEach(el => {
      const id = el.querySelector('[data-product-id]')?.dataset.productId
        || el.querySelector('.product-pixel-card')?.__vueParentComponent?.props?.product?.id
      if (id) {
        const rect = el.getBoundingClientRect()
        oldPositions.set(id, { top: rect.top, left: rect.left })
      }
    })

    // Stagger entrance for new items - only if elements exist
    if (wrappers.length > 0) {
      gsap.fromTo(wrappers,
        {
          opacity: 0,
          y: 24,
          scale: 0.97
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.04,
          ease: 'power3.out',
          force3D: true
        }
      )
    }
  })
}

onMounted(() => {
  animateProducts()
})

watch(() => props.products, () => {
  animateProducts()
}, { deep: false })

watch(() => props.currentPage, () => {
  animateProducts()
})

onUnmounted(() => {
  // Cleanup handled by GSAP auto-kill
})
</script>

<style scoped>
.product-grid__layout {
  /* Container for TransitionGroup */
  position: relative;
}

.product-grid__masonry {
  columns: 4;
  column-gap: clamp(0.75rem, 2vw, 1.25rem);
}

.product-grid__card-wrapper {
  break-inside: avoid;
  margin-bottom: clamp(0.75rem, 2vw, 1.25rem);
  /* Ensure each card is its own stacking context */
  isolation: isolate;
}

.product-grid__skeleton {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(0.75rem, 2.5vw, 1.25rem);
}

.product-grid__empty {
  text-align: center;
  padding: clamp(3rem, 10vh, 5rem) clamp(1rem, 3vw, 1.5rem);
  color: var(--text-muted);
  font-size: clamp(0.8rem, 1.8vw, 1rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.875rem, 2vw, 1.25rem);
}

.product-grid__empty-icon {
  width: clamp(3rem, 10vw, 4rem);
  height: clamp(3rem, 10vw, 4rem);
  opacity: 0.3;
}

/* ===== TransitionGroup animations ===== */
.product-grid-move {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-grid-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-grid-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-grid-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}

.product-grid-leave-to {
  opacity: 0;
  transform: scale(0.95);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}

/* ===== Responsive ===== */
@media (max-width: 1200px) {
  .product-grid__masonry {
    columns: 3;
  }
  .product-grid__skeleton {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .product-grid__masonry {
    columns: 2;
  }
  .product-grid__skeleton {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .product-grid__masonry {
    columns: 2;
    column-gap: clamp(0.5rem, 2vw, 0.75rem);
  }

  .product-grid__card-wrapper {
    margin-bottom: clamp(0.5rem, 2vw, 0.75rem);
  }

  .product-grid__skeleton {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(0.5rem, 2vw, 0.75rem);
  }

  .product-grid__empty {
    padding: clamp(2.5rem, 8vh, 4rem) clamp(0.75rem, 3vw, 1rem);
  }

  .product-grid__empty-icon {
    width: clamp(2.5rem, 12vw, 3.5rem);
    height: clamp(2.5rem, 12vw, 3.5rem);
  }
}

@media (max-width: 480px) {
  .product-grid__masonry {
    columns: 2;
  }

  .product-grid__card-wrapper {
    margin-bottom: clamp(0.625rem, 2.5vw, 1rem);
  }

  .product-grid__skeleton {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(0.625rem, 2.5vw, 1rem);
  }

  .product-grid__empty {
    padding: clamp(2rem, 8vh, 3rem) clamp(0.5rem, 2vw, 0.875rem);
  }
}

@media (max-width: 360px) {
  .product-grid__masonry {
    column-gap: clamp(0.375rem, 1.5vw, 0.5rem);
  }

  .product-grid__card-wrapper {
    margin-bottom: clamp(0.375rem, 1.5vw, 0.5rem);
  }

  .product-grid__skeleton {
    gap: clamp(0.375rem, 1.5vw, 0.5rem);
  }
}
</style>
