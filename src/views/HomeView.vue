<template>
  <div class="home">
    <!-- Hero Section - Full viewport height -->
    <section class="hero" @mousemove="handleHeroMouseMove">
      <div class="hero__background">
        <!-- GridScan background -->
        <GridScan
          class-name="gridscan-container"
          :line-thickness="1"
          :grid-scale="0.1"
          :line-jitter="0.08"
          lines-color="#22c55e"
          lines-color-secondary="#8b5cf6"
          scan-color="#22c55e"
          scan-color-secondary="#8b5cf6"
          :enable-post="true"
          :chromatic-aberration="0.004"
          :noise-intensity="0.015"
          :scan-glow="0.6"
          :scan-softness="1.5"
          :scan-opacity="0.5"
          :rgb-glitch-intensity="0.003"
          :vintage-noise-intensity="0.08"
          :vintage-resolution-scale="0.25"
        />
      <div class="hero__cursor-glow"></div>
        <div class="hero__grid-overlay"></div>
      </div>

      <div class="hero__content container">
        <div class="hero__inner">
          <div class="hero__text">
            <div class="hero__eyebrow">
              <span class="hero__eyebrow-line"></span>
              <span class="hero__eyebrow-text">{{ $t('home.heroEyebrow') || 'VIRTUAL STORE' }}</span>
              <span class="hero__eyebrow-line"></span>
            </div>

            <h1 class="hero__title">
              <span class="hero__title-line hero__title-main">
                <span class="hero__title-glitch" data-text="Bhumisparsha">Bhumisparsha</span>
              </span>
              <span class="hero__title-line hero__title-line--accent hero__title-main">
                <span class="hero__title-glitch" data-text="School">School</span>
              </span>
            </h1>

            <p class="hero__subtitle">
              {{ $t('home.heroSubtitle') }}
            </p>

            <div class="hero__vhs-indicator">
              <span class="hero__vhs-rec">REC</span>
              <span class="hero__vhs-timestamp">{{ $t('home.heroTimestamp') || '2026' }}</span>
            </div>

            <div class="hero__actions">
              <button class="hero__btn-primary" @click="$router.push('/produtos')">
                <span>{{ $t('home.viewProducts') }}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button class="hero__btn-secondary" @click="scrollToProducts">
                {{ $t('home.explore') || 'Explore' }}
              </button>
            </div>

            <div class="hero__stats">
              <div class="hero__stat">
                <span class="hero__stat-value">{{ productStore.products.length }}</span>
                <span class="hero__stat-label">{{ $t('home.statProducts') || 'Products' }}</span>
              </div>
              <div class="hero__stat">
                <span class="hero__stat-value">{{ productStore.categories.length }}</span>
                <span class="hero__stat-label">{{ $t('home.statCategories') || 'Categories' }}</span>
              </div>
              <div class="hero__stat">
                <span class="hero__stat-value">100%</span>
                <span class="hero__stat-label">{{ $t('home.statHandcrafted') || 'Handcrafted' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hero__scroll-indicator">
        <svg width="24" height="40" viewBox="0 0 24 40" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="2" width="20" height="36" rx="10" ry="10"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      </div>
    </section>

    <!-- Circular Gallery - Visual Showcase -->
    <section class="circular-gallery-section">
      <CircularGallery
        :items="galleryItems"
        :bend="3"
        :border-radius="0.05"
        :scroll-speed="2"
        :scroll-ease="0.05"
      />
    </section>

    <!-- Featured Products Section -->
    <section class="featured" ref="featuredRef">
      <div class="container">
        <div class="featured__header">
          <h2 class="featured__title">{{ $t('home.highlights') }}</h2>
        </div>
        <ProductGrid
          :products="featuredProducts"
          :loading="productStore.loading"
          :current-page="1"
          :total-pages="1"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../stores/products'
import { scrollReveal, scrollBatch, staggerGrid, createAnimationContext, refreshScrollTriggers } from '../utils/animations'
import { prefetchProductImages } from '../utils/imagePrefetch'
import ProductGrid from '../components/product/ProductGrid.vue'

// Lazy load heavy visual components
const CircularGallery = defineAsyncComponent(() => import('../components/common/CircularGallery.vue'))
const GridScan = defineAsyncComponent(() => import('../components/common/GridScan.vue'))

const router = useRouter()
const productStore = useProductStore()
const featuredRef = ref(null)
const heroRef = ref(null)
let ctx = null
let productAnim = null

// Hero mouse tracking - direct DOM manipulation to avoid Vue reactivity overhead
let heroMouseRafId = 0
let cursorGlowElement = null

function handleHeroMouseMove(e) {
  if (heroMouseRafId) return
  heroMouseRafId = requestAnimationFrame(() => {
    heroMouseRafId = 0
    const el = e.currentTarget
    if (!el || !cursorGlowElement) return
    const rect = el.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Direct DOM manipulation instead of Vue reactive update
    cursorGlowElement.style.background = `radial-gradient(circle 400px at ${x}% ${y}%, rgba(139, 92, 246, 0.12), transparent 70%)`
  })
}

function scrollToProducts() {
  featuredRef.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(async () => {
  if (productStore.products.length === 0) {
    await Promise.all([
      productStore.fetchProducts(),
      productStore.fetchCategories()
    ])
  } else if (productStore.categories.length === 0) {
    await productStore.fetchCategories()
  }

  // Cache cursor glow element reference
  cursorGlowElement = document.querySelector('.hero__cursor-glow')

  await new Promise(r => requestAnimationFrame(r))

  // Prefetch product images after initial render
  prefetchProductImages(productStore.products, 12)

  ctx = createAnimationContext()

  ctx.add(() => {
    scrollReveal('.hero__eyebrow', {
      fromY: 20,
      fromOpacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      start: 'top 85%',
      once: true,
    })

    scrollReveal('.hero__title-line', {
      fromY: 40,
      fromOpacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      start: 'top 80%',
      once: true,
    })

    scrollReveal('.hero__subtitle', {
      fromY: 30,
      fromOpacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      start: 'top 85%',
      once: true,
    })

    scrollReveal('.hero__actions', {
      fromY: 25,
      fromOpacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      start: 'top 85%',
      once: true,
    })

    scrollReveal('.hero__stats', {
      fromY: 20,
      fromOpacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      start: 'top 90%',
      once: true,
    })
  })

  requestAnimationFrame(() => {
    productAnim = staggerGrid('.product-grid__card-wrapper', {
      fromY: 25,
      fromScale: 0.97,
      duration: 0.45,
      stagger: 0.05,
      ease: 'power3.out',
    })
  })

  window.addEventListener('load', () => refreshScrollTriggers(), { once: true })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
  if (productAnim) productAnim.kill()
  if (heroMouseRafId) cancelAnimationFrame(heroMouseRafId)
  cursorGlowElement = null
  ctx = null
  productAnim = null
  heroMouseRafId = 0
})

const featuredProducts = computed(() => productStore.products.slice(0, 12))

const galleryItems = computed(() => {
  return productStore.products.slice(0, 6).map((product, index) => {
    let img = product.image && (product.image.startsWith('data:') || product.image.startsWith('http'))
      ? product.image
      : `https://picsum.photos/800/600?random=${index + 1}`
    // For t-shirts: replace 000_image with 001_image
    if (img && img.includes('000_image')) {
      img = img.replace('000_image', '001_image')
    }
    return { image: img }
  })
})
</script>

<style scoped>
/* Hero Section */
.hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--surface-0);
}

.hero__background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: transparent;
}

/* GridScan container - fixed to viewport, covers the visible area */
.hero__background > .gridscan-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  width: 100dvw;
  height: 100vh;
  height: 100dvh;
  margin: 0;
  padding: 0;
  pointer-events: none;
  transform: none;
}

/* Other overlays stay non-interactive */
.hero__background > *:not(.gridscan-container) {
  pointer-events: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero__cursor-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: background 0.3s ease;
}

.hero__grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(63, 63, 70, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(63, 63, 70, 0.03) 1px, transparent 1px);
  background-size: clamp(40px, 6vw, 60px) clamp(40px, 6vw, 60px);
  pointer-events: none;
}

.hero__content {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 3vh, 4rem) 0;
  pointer-events: none;
}

.hero__content * {
  pointer-events: auto;
}

.hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: min(90vw, 50rem);
  width: 100%;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
  margin-bottom: clamp(0.75rem, 2vh, 1.25rem);
}

.hero__eyebrow-line {
  width: clamp(1.5rem, 3vw, 2rem);
  height: 0.0625rem;
  background: var(--accent);
  animation: vhs-line-flicker 3s ease-in-out infinite;
}

.hero__eyebrow-text {
  font-size: clamp(0.6rem, 1.2vw, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  font-family: var(--font-mono);
  text-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
}

.hero__title {
  font-size: clamp(2rem, 6vw + 1rem, 5.5rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: clamp(0.75rem, 2vh, 1.25rem);
  position: relative;
  font-family: 'Space Grotesk', var(--font-sans);
}

.hero__title-line {
  display: block;
}

.hero__title-main {
  position: relative;
  display: inline-block;
}

.hero__title-glitch {
  position: relative;
  display: inline-block;
  animation: vhs-text-glitch 5s ease-in-out infinite;
}

.hero__title-glitch::before,
.hero__title-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  animation: vhs-glitch-layers 4s ease-in-out infinite;
  font-family: 'Space Grotesk', var(--font-sans);
}

.hero__title-glitch::before {
  color: #22c55e;
  z-index: -1;
  animation-delay: 0.1s;
}

.hero__title-glitch::after {
  color: #8b5cf6;
  z-index: -1;
  animation-delay: 0.2s;
}

.hero__title-line--accent {
  color: var(--accent);
}

.hero__subtitle {
  font-size: clamp(0.85rem, 1.2vw + 0.25rem, 1.125rem);
  color: var(--text-secondary);
  line-height: clamp(1.4, 2vw, 1.6);
  max-width: clamp(280px, 50vw, 540px);
  margin-bottom: clamp(1rem, 3vh, 1.75rem);
}

/* VHS Timestamp Indicator */
.hero__vhs-indicator {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1rem);
  margin-bottom: clamp(0.75rem, 2vh, 1.25rem);
  font-family: var(--font-mono);
  opacity: 0.6;
}

.hero__vhs-rec {
  font-size: clamp(0.55rem, 1vw, 0.7rem);
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #ef4444;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  animation: vhs-rec-blink 1.5s ease-in-out infinite;
  position: relative;
}

.hero__vhs-rec::before {
  content: '';
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background: #ef4444;
  border-radius: 50%;
  margin-right: 0.375rem;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
  animation: vhs-rec-blink 1.5s ease-in-out infinite;
  vertical-align: middle;
}

.hero__vhs-timestamp {
  font-size: clamp(0.55rem, 1vw, 0.7rem);
  letter-spacing: 0.1em;
  color: var(--text-muted);
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1rem);
  margin-bottom: clamp(1.5rem, 4vh, 2.5rem);
}

.hero__btn-primary {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.2vw, 0.625rem);
  padding: clamp(0.625rem, 1.5vh, 0.875rem) clamp(1.25rem, 3vw, 1.75rem);
  background: white;
  color: var(--surface-1);
  font-size: clamp(0.75rem, 1.2vw, 0.9rem);
  font-weight: 600;
  border-radius: 1.875rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 0.25rem 0.75rem rgba(255, 255, 255, 0.1);
}

.hero__btn-primary:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.375rem 1.25rem rgba(255, 255, 255, 0.15);
}

.hero__btn-primary svg {
  transition: transform 0.2s ease;
  width: clamp(1rem, 2vw, 1.25rem);
  height: clamp(1rem, 2vw, 1.25rem);
}

.hero__btn-primary:hover svg {
  transform: translateX(0.25rem);
}

.hero__btn-secondary {
  padding: clamp(0.625rem, 1.5vh, 0.875rem) clamp(1.25rem, 3vw, 1.75rem);
  color: var(--text-primary);
  font-size: clamp(0.75rem, 1.2vw, 0.9rem);
  font-weight: 500;
  border: 0.0625rem solid var(--border);
  border-radius: 1.875rem;
  transition: all 0.2s ease;
}

.hero__btn-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.hero__stats {
  display: flex;
  gap: clamp(1.5rem, 4vw, 2.5rem);
}

.hero__stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hero__stat-value {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.hero__stat-label {
  font-size: clamp(0.55rem, 1vw, 0.7rem);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Scroll Indicator */
.hero__scroll-indicator {
  position: absolute;
  bottom: clamp(1rem, 3vh, 2rem);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  animation: float-gentle 2s ease-in-out infinite;
}

.hero__scroll-indicator svg {
  width: clamp(1.25rem, 3vw, 1.5rem);
  height: clamp(2rem, 5vw, 2.5rem);
}

.hero__scroll-indicator svg circle {
  animation: scroll-dot 2s ease-in-out infinite;
}

@keyframes scroll-dot {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* ===== VHS ANIMATIONS ===== */

/* VHS line flicker */
@keyframes vhs-line-flicker {
  0%, 100% { opacity: 1; }
  5% { opacity: 0.4; }
  10% { opacity: 1; }
  48% { opacity: 1; }
  50% { opacity: 0.6; }
  52% { opacity: 1; }
}

/* VHS text glitch */
@keyframes vhs-text-glitch {
  0%, 100% { transform: translate(0); }
  2% { transform: translate(2px, -1px); }
  4% { transform: translate(-2px, 1px); }
  6% { transform: translate(0); }
  48% { transform: translate(0); }
  50% { transform: translate(-1px, 0); }
  52% { transform: translate(1px, 0); }
  54% { transform: translate(0); }
}

/* VHS glitch layers */
@keyframes vhs-glitch-layers {
  0%, 100% { opacity: 0; transform: translate(0); }
  2% { opacity: 0.8; transform: translate(-2px, 1px); }
  4% { opacity: 0; transform: translate(0); }
  48% { opacity: 0; transform: translate(0); }
  50% { opacity: 0.6; transform: translate(2px, -1px); }
  52% { opacity: 0; transform: translate(0); }
}

/* VHS REC indicator blink */
@keyframes vhs-rec-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

/* VHS scanlines overlay effect for text */
@keyframes vhs-scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

/* VHS noise/static subtle effect */
@keyframes vhs-static {
  0%, 100% { opacity: 0.02; }
  50% { opacity: 0.04; }
}

/* Featured Section */
.featured {
  padding: clamp(2rem, 6vh, 3.125rem) 0;
  background: var(--surface-0);
}

.featured__header {
  margin-bottom: clamp(1.25rem, 3vw, 2rem);
}

.featured__title {
  font-size: clamp(1.25rem, 3vw + 0.25rem, 1.5rem);
  font-weight: 700;
  color: var(--text-primary);
}

/* Circular Gallery Section */
.circular-gallery-section {
  position: relative;
  padding: clamp(1.25rem, 4vh, 2.5rem) 0;
  background: var(--surface-1);
  height: clamp(25rem, 50vh + 5rem, 50rem);
  min-height: clamp(21.875rem, 35vh, 31.25rem);
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.circular-gallery-section .container {
  flex-shrink: 0;
}

.circular-gallery__title {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: clamp(1rem, 3vw, 1.25rem);
  text-align: center;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

/* Tablet landscape */
@media (max-width: 1024px) {
  .hero__inner {
    text-align: center;
    gap: clamp(1.25rem, 3vh, 1.875rem);
  }

  .hero__eyebrow {
    justify-content: center;
  }

  .hero__subtitle {
    max-width: min(90vw, 37.5rem);
    margin-left: auto;
    margin-right: auto;
  }

  .hero__vhs-indicator {
    justify-content: center;
  }

  .hero__actions {
    justify-content: center;
  }

  .hero__stats {
    justify-content: center;
  }
}

/* Featured Section */
@media (max-width: 768px) {
  .hero {
    min-height: 100dvh;
    padding: 0;
  }

  .hero__content {
    padding: clamp(1rem, 2.5vh, 1.5rem) 0;
  }

  .hero__title {
    font-size: clamp(1.75rem, 8vw + 0.5rem, 2.5rem);
    margin-bottom: clamp(0.5rem, 2vh, 1rem);
  }

  .hero__subtitle {
    font-size: clamp(0.8rem, 2.5vw + 0.25rem, 0.95rem);
    margin-bottom: clamp(0.75rem, 2.5vh, 1.5rem);
    line-height: 1.5;
  }

  .hero__vhs-indicator {
    margin-bottom: clamp(0.5rem, 2vh, 1rem);
  }

  .hero__actions {
    flex-direction: column;
    gap: clamp(0.5rem, 1.5vh, 0.75rem);
    margin-bottom: clamp(1rem, 3vh, 2rem);
    width: min(90vw, 20rem);
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .hero__btn-primary,
  .hero__btn-secondary {
    width: 100%;
    justify-content: center;
    padding: clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem);
  }

  .hero__stats {
    gap: clamp(1rem, 3vw, 1.5rem);
    flex-wrap: wrap;
    justify-content: center;
  }

  .hero__stat-value {
    font-size: clamp(1.125rem, 4vw + 0.25rem, 1.375rem);
  }

  .hero__stat-label {
    font-size: clamp(0.5rem, 1.2vw, 0.6rem);
  }

  .hero__scroll-indicator {
    bottom: clamp(0.75rem, 2vh, 1.25rem);
  }

  .circular-gallery-section {
    height: clamp(21.875rem, 40vh + 5rem, 31.25rem);
    min-height: clamp(18.75rem, 30vh, 25rem);
    padding: clamp(1rem, 2.5vh, 1.25rem) 0;
  }

  .featured {
    padding: clamp(1.25rem, 4vh, 1.875rem) 0;
  }

  .featured__header {
    margin-bottom: clamp(1rem, 2.5vw, 1.5rem);
  }
}

/* Mobile large */
@media (max-width: 640px) {
  .hero__eyebrow {
    margin-bottom: clamp(0.5rem, 1.5vh, 0.75rem);
  }

  .hero__eyebrow-line {
    width: clamp(1rem, 4vw, 1.5rem);
  }

  .hero__eyebrow-text {
    font-size: clamp(0.55rem, 1.5vw, 0.65rem);
  }

  .hero__title {
    font-size: clamp(1.5rem, 9vw + 0.25rem, 2rem);
    line-height: 1;
  }

  .hero__subtitle {
    font-size: clamp(0.75rem, 3vw + 0.15rem, 0.9rem);
    margin-bottom: clamp(0.625rem, 2vh, 1.25rem);
  }

  .hero__stats {
    gap: clamp(0.75rem, 2.5vw, 1.25rem);
  }
}

/* Mobile medium */
@media (max-width: 480px) {
  .hero {
    padding: 0;
  }

  .hero__content {
    padding: clamp(0.75rem, 2vh, 1rem) 0;
  }

  .hero__inner {
    gap: clamp(0.75rem, 2.5vw, 1rem);
  }

  .hero__eyebrow {
    margin-bottom: clamp(0.375rem, 1.5vh, 0.625rem);
  }

  .hero__eyebrow-line {
    width: clamp(0.75rem, 3.5vw, 1.25rem);
  }

  .hero__eyebrow-text {
    font-size: clamp(0.5rem, 1.8vw, 0.6rem);
    letter-spacing: 0.08em;
  }

  .hero__title {
    font-size: clamp(1.375rem, 10vw, 1.75rem);
    margin-bottom: clamp(0.375rem, 1.5vh, 0.75rem);
  }

  .hero__subtitle {
    font-size: clamp(0.7rem, 3.5vw + 0.1rem, 0.85rem);
    margin-bottom: clamp(0.5rem, 2vh, 1rem);
    line-height: 1.45;
  }

  .hero__actions {
    max-width: min(85vw, 17.5rem);
    margin-bottom: clamp(0.75rem, 2.5vh, 1.5rem);
    gap: clamp(0.375rem, 1.5vh, 0.625rem);
  }

  .hero__btn-primary,
  .hero__btn-secondary {
    padding: clamp(0.5rem, 1.75vw, 0.625rem) clamp(0.75rem, 3vw, 1.25rem);
    font-size: clamp(0.7rem, 2vw, 0.8rem);
  }

  .hero__stats {
    gap: clamp(0.625rem, 2.5vw, 1rem);
    flex-wrap: wrap;
  }

  .hero__stat {
    flex: 1 1 calc(50% - 0.5rem);
    min-width: clamp(4rem, 15vw, 5rem);
  }

  .hero__stat:nth-child(3) {
    flex: 1 1 100%;
    max-width: clamp(8rem, 30vw, 10rem);
    margin: 0 auto;
  }

  .hero__stat-value {
    font-size: clamp(1rem, 5.5vw + 0.15rem, 1.25rem);
  }

  .hero__stat-label {
    font-size: clamp(0.45rem, 1.3vw, 0.55rem);
  }

  .hero__scroll-indicator {
    bottom: clamp(0.5rem, 1.5vh, 1rem);
  }

  .hero__scroll-indicator svg {
    width: clamp(1rem, 3.5vw, 1.25rem);
    height: clamp(1.5rem, 5vw, 2rem);
  }

  .circular-gallery-section {
    height: clamp(18.75rem, 35vh + 3rem, 25rem);
    min-height: clamp(15.625rem, 25vh, 21.875rem);
    padding: clamp(0.75rem, 2vh, 1rem) 0;
  }

  .featured {
    padding: clamp(1rem, 3vh, 1.25rem) 0;
  }

  .featured__header {
    margin-bottom: clamp(0.75rem, 2.5vw, 1.25rem);
  }

  .featured__title {
    font-size: clamp(1.125rem, 5vw + 0.15rem, 1.375rem);
  }
}

/* Mobile small */
@media (max-width: 360px) {
  :root {
    --container-max: min(95vw, 87.5rem);
  }

  .container {
    padding: 0 clamp(0.5rem, 2vw, 0.75rem);
  }

  .hero__content {
    padding: clamp(0.5rem, 1.5vh, 0.75rem) 0;
  }

  .hero__inner {
    gap: clamp(0.5rem, 2vw, 0.75rem);
  }

  .hero__eyebrow {
    margin-bottom: clamp(0.25rem, 1vh, 0.5rem);
    gap: clamp(0.25rem, 1.5vw, 0.5rem);
  }

  .hero__eyebrow-line {
    width: clamp(0.625rem, 3vw, 1rem);
  }

  .hero__eyebrow-text {
    font-size: clamp(0.45rem, 2vw, 0.55rem);
  }

  .hero__title {
    font-size: clamp(1.25rem, 11vw, 1.5rem);
    margin-bottom: clamp(0.25rem, 1.5vh, 0.625rem);
  }

  .hero__subtitle {
    font-size: clamp(0.65rem, 4vw + 0.05rem, 0.75rem);
    margin-bottom: clamp(0.375rem, 1.5vh, 0.875rem);
  }

  .hero__actions {
    max-width: min(85vw, 16.25rem);
    margin-bottom: clamp(0.5rem, 2vh, 1.25rem);
    gap: clamp(0.25rem, 1.5vh, 0.5rem);
  }

  .hero__btn-primary,
  .hero__btn-secondary {
    padding: clamp(0.4375rem, 1.5vw, 0.625rem) clamp(0.625rem, 3vw, 1rem);
    font-size: clamp(0.65rem, 2.2vw, 0.75rem);
    gap: clamp(0.25rem, 1.5vw, 0.5rem);
  }

  .hero__btn-primary svg {
    width: clamp(0.75rem, 2.5vw, 1rem);
    height: clamp(0.75rem, 2.5vw, 1rem);
  }

  .hero__stats {
    gap: clamp(0.5rem, 2.5vw, 0.75rem);
  }

  .hero__stat {
    min-width: clamp(3.5rem, 14vw, 4.375rem);
  }

  .hero__stat-value {
    font-size: clamp(0.875rem, 6vw + 0.05rem, 1.125rem);
  }

  .hero__stat-label {
    font-size: clamp(0.4rem, 1.5vw, 0.5rem);
  }

  .circular-gallery-section {
    height: clamp(15.625rem, 30vh + 2rem, 21.875rem);
    min-height: clamp(13.75rem, 22vh, 18.75rem);
    padding: clamp(0.5rem, 1.5vh, 0.75rem) 0;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hero__scroll-indicator {
    animation: none;
  }

  .hero__scroll-indicator svg circle {
    animation: none;
  }
}
</style>
