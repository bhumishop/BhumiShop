<template>
  <div class="home">
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__content">
          <h1 class="hero__title">
            {{ $t('home.heroTitle1') }}<br /><span class="hero__accent">{{ $t('home.heroTitle2') }}</span>
          </h1>
          <p class="hero__subtitle">
            {{ $t('home.heroSubtitle') }}
          </p>
          <div class="hero__actions">
            <BaseButton variant="primary" size="lg" @click="$router.push('/produtos')">
              {{ $t('home.viewProducts') }}
            </BaseButton>
          </div>
        </div>
        <div class="hero__visual">
          <div class="hero__circle"></div>
        </div>
      </div>
    </section>

    <section class="categories container">
      <h2 class="section-title">{{ $t('home.categories') }}</h2>
      <div v-if="productStore.categories.length" class="categories__grid">
        <button
          v-for="cat in productStore.categories"
          :key="cat.id"
          class="categories__card"
          @click="goToCategory(cat.id)"
        >
          <span class="categories__icon">{{ cat.icon || '📦' }}</span>
          <span class="categories__name">{{ cat.name }}</span>
        </button>
      </div>
      <div v-else-if="productStore.loading" class="categories__skeleton">
        <BaseSkeleton v-for="i in 4" :key="i" variant="card" />
      </div>
    </section>

    <section class="featured container">
      <h2 class="section-title">{{ $t('home.highlights') }}</h2>
      <ProductGrid
        :products="featuredProducts"
        :loading="productStore.loading"
        :current-page="1"
        :total-pages="1"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../stores/products'
import { scrollReveal, scrollBatch, staggerGrid, createAnimationContext, refreshScrollTriggers } from '../utils/animations'
import BaseButton from '../components/common/BaseButton.vue'
import BaseSkeleton from '../components/common/BaseSkeleton.vue'
import ProductGrid from '../components/product/ProductGrid.vue'

const router = useRouter()
const productStore = useProductStore()
let ctx = null
let productAnim = null

onMounted(async () => {
  if (productStore.products.length === 0) {
    await Promise.all([
      productStore.fetchProducts(),
      productStore.fetchCategories()
    ])
  } else if (productStore.categories.length === 0) {
    await productStore.fetchCategories()
  }

  // Wait for DOM to render
  await new Promise(r => requestAnimationFrame(r))

  // Create scoped animation context
  ctx = createAnimationContext()

  ctx.add(() => {
    // Hero content - reveal with slight delay for visual impact
    scrollReveal('.hero__content', {
      fromY: 50,
      fromOpacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      start: 'top 80%',
      once: true,
    })

    // Hero visual - scale + fade
    scrollReveal('.hero__visual', {
      fromY: 30,
      fromScale: 0.9,
      duration: 1,
      ease: 'power3.out',
      start: 'top 80%',
      once: true,
    })

    // Section titles - subtle reveal
    scrollBatch('.section-title', {
      fromY: 25,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power3.out',
      start: 'top 88%',
      once: true,
    })

    // Categories grid - staggered batch reveal
    scrollBatch('.categories__card', {
      fromY: 35,
      fromScale: 0.95,
      duration: 0.5,
      stagger: 0.08,
      ease: 'back.out(1.2)',
      start: 'top 88%',
      once: true,
    })
  })

  // Animate featured products after they render
  requestAnimationFrame(() => {
    productAnim = staggerGrid('.product-card', {
      fromY: 25,
      fromScale: 0.97,
      duration: 0.45,
      stagger: 0.06,
      ease: 'power3.out',
    })
  })

  // Refresh after images load to fix scroll positions
  window.addEventListener('load', () => refreshScrollTriggers(), { once: true })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
  if (productAnim) productAnim.kill()
  ctx = null
  productAnim = null
})

function initAnimations() {
  // Kept for backward compatibility - now handled in onMounted
}

const featuredProducts = computed(() => productStore.products.slice(0, 8))

function goToCategory(catId) {
  router.push({ path: '/produtos', query: { category: catId } })
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--accent-light) 0%, var(--surface-0) 50%, var(--green-adorn-light) 100%);
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
  padding: var(--section-padding) 0;
  overflow: hidden;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: clamp(20rem, 50vw, 40rem);
  height: clamp(20rem, 50vw, 40rem);
  background: radial-gradient(circle, var(--accent-subtle) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.4;
  animation: float-gentle 8s ease-in-out infinite;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: clamp(15rem, 40vw, 30rem);
  height: clamp(15rem, 40vw, 30rem);
  background: radial-gradient(circle, var(--green-adorn-light) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.3;
  animation: float-gentle 10s ease-in-out infinite reverse;
}

.hero__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-xl);
  position: relative;
  z-index: 1;
}

.hero__content {
  animation: fade-in-right 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.hero__title {
  font-size: clamp(2.25rem, 7vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.hero__accent {
  color: var(--accent);
  text-shadow: 0 0 clamp(1rem, 3vw, 2rem) var(--accent-light);
  position: relative;
}

.hero__subtitle {
  font-size: clamp(0.95rem, 2vw, 1.125rem);
  color: var(--text-secondary);
  margin: clamp(0.75rem, 2vh, 1rem) 0 clamp(1.25rem, 3vh, 2rem);
  max-width: min(27.5rem, 90%);
  line-height: 1.6;
  animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

.hero__actions {
  animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
}

.hero__visual {
  position: relative;
  width: clamp(12rem, 30vw, 18.75rem);
  height: clamp(12rem, 30vw, 18.75rem);
  flex-shrink: 0;
  animation: fade-in-left 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

.hero__circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-subtle) 0%, var(--accent-light) 60%, transparent 70%);
  opacity: 0.6;
  animation: float-gentle 6s ease-in-out infinite;
  box-shadow: var(--glow-accent);
}

.categories {
  padding: var(--section-padding) 0;
}

.section-title {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  margin-bottom: var(--gap-lg);
  color: var(--text-primary);
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: clamp(2.5rem, 8vw, 4rem);
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--green-adorn));
  border-radius: var(--radius-full);
}

.categories__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(8rem, 15vw, 10rem), 1fr));
  gap: var(--gap-md);
}

.categories__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  padding: clamp(1.25rem, 3vh, 1.75rem) clamp(0.75rem, 1.5vw, 1rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-smooth);
  position: relative;
  overflow: hidden;
}

.categories__card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-light), var(--green-adorn-light));
  opacity: 0;
  transition: opacity var(--transition-smooth);
}

.categories__card:hover::before {
  opacity: 0.1;
}

.categories__card:hover {
  transform: translateY(clamp(-0.25rem, -0.75vh, -0.5rem));
  box-shadow: var(--shadow-md), var(--glow-accent);
  border-color: var(--accent-subtle);
}

.categories__card:active {
  transform: translateY(0) scale(0.98);
}

.categories__icon {
  font-size: clamp(1.5rem, 4vw, 2rem);
  position: relative;
  z-index: 1;
  transition: transform var(--transition-smooth);
}

.categories__card:hover .categories__icon {
  transform: scale(1.15) rotate(5deg);
}

.categories__name {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  font-weight: 500;
  color: var(--text-primary);
  position: relative;
  z-index: 1;
}

.categories__skeleton {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-md);
}

.featured {
  padding: clamp(1.5rem, 4vh, 2.5rem) 0 var(--section-padding);
}

@media (max-width: 768px) {
  .hero__inner {
    flex-direction: column;
    text-align: center;
  }

  .hero__subtitle {
    max-width: 100%;
  }

  .hero__visual {
    width: clamp(10rem, 40vw, 12.5rem);
    height: clamp(10rem, 40vw, 12.5rem);
  }

  .hero__actions {
    display: flex;
    justify-content: center;
  }

  .categories__skeleton {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
