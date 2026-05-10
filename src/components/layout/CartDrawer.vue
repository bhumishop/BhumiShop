<template>
  <Teleport to="body">
    <div
      ref="overlayRef"
      class="drawer-overlay"
      :style="{ display: shouldShowOverlay ? 'block' : 'none' }"
      @click="handleOverlayClick"
    ></div>
    <div
      ref="drawerRef"
      class="drawer"
      :style="{ display: cartStore.isOpen ? 'flex' : 'none' }"
    >
      <div class="drawer__header">
        <h2 class="drawer__title">{{ $t('cart.cartCount', { count: cartStore.totalItems }) }}</h2>
        <button
          type="button"
          class="drawer__close"
          @click="handleClose"
          :aria-label="$t('common.close')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div v-if="cartStore.items.length === 0" class="drawer__empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>{{ $t('cart.empty') }}</p>
        <BaseButton variant="primary" size="sm" @click="handleCloseAndNavigate">
          {{ $t('cart.viewProducts') }}
        </BaseButton>
      </div>

      <div v-else class="drawer__content">
        <div class="drawer__items">
          <div
            v-for="item in cartStore.items"
            :key="`${item.id}_${item.size || 'default'}`"
            class="drawer__item"
            :class="getItemClass(item)"
          >
            <div class="drawer__item-img">
              <img v-if="item.image" :src="item.image" :alt="item.name" loading="lazy" />
              <div v-else class="drawer__item-placeholder">{{ item.name?.charAt(0) || '?' }}</div>
            </div>
            <div class="drawer__item-info">
              <div class="drawer__item-name-row">
                <h4 class="drawer__item-name">{{ item.name }}</h4>
                <FulfillmentBadge v-if="shouldShowBadge(item)" :type="item.fulfillment_type" size="sm" />
              </div>
              <p v-if="item.size" class="drawer__item-size">{{ $t('cart.size') }}: {{ item.size }}</p>
              <p class="drawer__item-price">R$ {{ formatPrice(item.price) }}</p>
              <div class="drawer__item-qty">
                <button type="button" @click="cartStore.updateQuantity(item.id, item.quantity - 1, item.size)" :aria-label="$t('productDetail.decrease')">−</button>
                <span>{{ item.quantity }}</span>
                <button type="button" @click="cartStore.updateQuantity(item.id, item.quantity + 1, item.size)" :aria-label="$t('productDetail.increase')">+</button>
              </div>
            </div>
            <button
              type="button"
              class="drawer__item-remove"
              @click="cartStore.removeItem(item.id, item.size)"
              :aria-label="$t('cart.remove')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- UmaPenca info banner -->
        <div v-if="cartStore.hasUmaPencaItems" class="drawer__uma-penca-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>{{ $t('cart.umaPencaNote') || 'Items from UmaPenca will be checked out separately' }}</span>
        </div>

        <div class="drawer__footer">
          <div class="drawer__totals">
            <div class="drawer__total-line">
              <span>{{ $t('cart.subtotal') || 'Subtotal' }}</span>
              <span>R$ {{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
            <div class="drawer__total-line drawer__total-line--final">
              <span>{{ $t('cart.total') }}</span>
              <span class="drawer__total-price">R$ {{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
          </div>
          <BaseButton
            type="button"
            variant="primary"
            full
            @click="handleCheckout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {{ $t('cart.checkout') }}
          </BaseButton>
          <button type="button" class="drawer__clear" @click="handleClearCart">{{ $t('cart.clearCart') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from '../../utils/animations'
import { useCartStore } from '../../stores/cart'
import BaseButton from '../common/BaseButton.vue'
import FulfillmentBadge from '../common/FulfillmentBadge.vue'

const cartStore = useCartStore()
const router = useRouter()
const drawerRef = ref(null)
const overlayRef = ref(null)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const shouldShowOverlay = ref(false)

let activeTweens = []

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

function killAllTweens() {
  for (const tween of activeTweens) {
    if (tween && tween.kill) tween.kill()
  }
  activeTweens = []
}

function handleClose() {
  cartStore.closeDrawer()
}

function handleOverlayClick() {
  handleClose()
}

function handleCloseAndNavigate() {
  handleClose()
  setTimeout(() => router.push('/produtos'), 400)
}

function handleCheckout() {
  cartStore.closeDrawer()
  setTimeout(() => router.push('/checkout'), 400)
}

function handleClearCart() {
  if (cartStore.items.length === 0) return
  cartStore.clearCart()
}

function getItemClass(item) {
  const ft = item.fulfillment_type
  if (ft === 'uma_penca' || ft === 'uma penca') return 'drawer__item--uma-penca'
  if (ft === 'digital') return 'drawer__item--digital'
  if (ft === 'uiclap') return 'drawer__item--uma-penca'
  return ''
}

function shouldShowBadge(item) {
  return item.fulfillment_type && item.fulfillment_type !== 'own'
}

// Watch for drawer state changes
watch(() => cartStore.isOpen, async (isOpen) => {
  await nextTick()

  killAllTweens()

  if (isOpen) {
    shouldShowOverlay.value = true
    animateDrawerIn()
  } else {
    animateDrawerOut()
  }
})

function animateDrawerIn() {
  if (!drawerRef.value || !overlayRef.value) return

  // Reset initial state
  gsap.set(overlayRef.value, { opacity: 0, pointerEvents: 'none' })
  gsap.set(drawerRef.value, { xPercent: 100, pointerEvents: 'none' })

  // Animate overlay
  const overlayTween = gsap.to(overlayRef.value, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.out',
    onStart: () => { gsap.set(overlayRef.value, { pointerEvents: 'auto' }) },
    overwrite: true,
  })
  activeTweens.push(overlayTween)

  // Animate drawer
  const drawerTween = gsap.to(drawerRef.value, {
    xPercent: 0,
    duration: 0.45,
    ease: 'power3.out',
    onStart: () => { gsap.set(drawerRef.value, { pointerEvents: 'auto' }) },
    overwrite: true,
  })
  activeTweens.push(drawerTween)

  // Animate items
  const items = document.querySelectorAll('.drawer__item')
  if (items.length > 0 && !prefersReducedMotion) {
    const itemsTween = gsap.fromTo(items,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.1, overwrite: 'auto' }
    )
    activeTweens.push(itemsTween)
  }

  // Animate footer
  const footer = document.querySelector('.drawer__footer')
  if (footer && !prefersReducedMotion) {
    const footerTween = gsap.fromTo(footer,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', delay: 0.15, overwrite: true }
    )
    activeTweens.push(footerTween)
  }
}

function animateDrawerOut() {
  if (!drawerRef.value) return

  // Ensure pointer-events are auto before animating out
  gsap.set(drawerRef.value, { pointerEvents: 'auto' })
  if (overlayRef.value) {
    gsap.set(overlayRef.value, { pointerEvents: 'auto' })
  }

  if (prefersReducedMotion) {
    gsap.set(drawerRef.value, { xPercent: 100, pointerEvents: 'none' })
    if (overlayRef.value) gsap.set(overlayRef.value, { opacity: 0, pointerEvents: 'none' })
    shouldShowOverlay.value = false
    return
  }

  // Fade out items first
  const items = document.querySelectorAll('.drawer__item')
  if (items.length > 0) {
    const itemsTween = gsap.to(items, {
      opacity: 0, x: 15, duration: 0.15, stagger: 0.02,
      ease: 'power2.in', overwrite: 'auto',
    })
    activeTweens.push(itemsTween)
  }

  // Animate footer out
  const footer = document.querySelector('.drawer__footer')
  if (footer) {
    const footerTween = gsap.to(footer, {
      opacity: 0, y: 10, duration: 0.2,
      ease: 'power2.in', overwrite: true,
    })
    activeTweens.push(footerTween)
  }

  // Animate overlay out
  if (overlayRef.value) {
    const overlayTween = gsap.to(overlayRef.value, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      overwrite: true,
      onComplete: () => {
        gsap.set(overlayRef.value, { pointerEvents: 'none' })
        shouldShowOverlay.value = false
      },
    })
    activeTweens.push(overlayTween)
  }

  // Animate drawer out
  const drawerTween = gsap.to(drawerRef.value, {
    xPercent: 100,
    duration: 0.35,
    ease: 'power3.in',
    overwrite: true,
    onComplete: () => {
      gsap.set(drawerRef.value, { pointerEvents: 'none' })
    },
  })
  activeTweens.push(drawerTween)
}

onUnmounted(() => {
  killAllTweens()
})
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(clamp(0.25rem, 0.75vw, 0.5rem));
  -webkit-backdrop-filter: blur(clamp(0.25rem, 0.75vw, 0.5rem));
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  will-change: opacity;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: clamp(20rem, 85vw, 25rem);
  max-width: 90vw;
  height: 100vh;
  height: 100dvh;
  background: var(--surface-0);
  z-index: 201;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl), var(--glow-accent);
  border-left: 0.0625rem solid var(--border);
}

.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(1rem, 2vw, 1.25rem) clamp(1.25rem, 2.5vw, 1.5rem);
  border-bottom: 0.0625rem solid var(--border);
  position: relative;
  flex-shrink: 0;
}

.drawer__header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0.0625rem;
  background: linear-gradient(90deg, transparent, var(--green-adorn), var(--accent), transparent);
  opacity: 0.3;
}

.drawer__title {
  font-size: clamp(0.9rem, 1.6vw, 1rem);
  font-weight: 600;
}

.drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(2rem, 4vw, 2.25rem);
  height: clamp(2rem, 4vw, 2.25rem);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  z-index: 10;
}

.drawer__close:hover {
  background: var(--surface-2);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.drawer__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(0.75rem, 2vh, 1rem);
  padding: clamp(1.5rem, 4vw, 2rem);
  color: var(--text-muted);
  text-align: center;
}

.drawer__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer__items {
  flex: 1;
  overflow-y: auto;
  padding: clamp(0.75rem, 1.5vw, 1rem) clamp(1.25rem, 2.5vw, 1.5rem);
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.drawer__item {
  display: flex;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
  padding: clamp(0.75rem, 1.5vh, 1rem) 0;
  border-bottom: 0.0625rem solid var(--surface-2);
  position: relative;
}

.drawer__item--uma-penca {
  border-left: 0.1875rem solid #8b5cf6;
  padding-left: clamp(0.5rem, 1.2vw, 0.75rem);
}

.drawer__item--digital {
  border-left: 0.1875rem solid #10b981;
  padding-left: clamp(0.5rem, 1.2vw, 0.75rem);
}

.drawer__item-img {
  width: clamp(3.5rem, 8vw, 4rem);
  height: clamp(3.5rem, 8vw, 4rem);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface-2);
  flex-shrink: 0;
}

.drawer__item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drawer__item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--surface-2);
}

.drawer__item-info {
  flex: 1;
  min-width: 0;
}

.drawer__item-name-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.drawer__item-name {
  font-size: clamp(0.8rem, 1.4vw, 0.875rem);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer__item-size {
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  color: var(--text-muted);
  margin-top: clamp(0.0625rem, 0.2vh, 0.125rem);
}

.drawer__item-price {
  font-family: var(--font-mono);
  font-size: clamp(0.8rem, 1.4vw, 0.875rem);
  font-weight: 500;
  color: var(--text-primary);
  margin-top: clamp(0.125rem, 0.3vh, 0.25rem);
}

.drawer__item-qty {
  display: inline-flex;
  align-items: center;
  gap: 0;
  margin-top: clamp(0.375rem, 0.75vh, 0.5rem);
  border: 0.0625rem solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.drawer__item-qty button {
  width: clamp(1.5rem, 3vw, 1.75rem);
  height: clamp(1.5rem, 3vw, 1.75rem);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  border: none;
  background: transparent;
  cursor: pointer;
}

.drawer__item-qty button:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.drawer__item-qty span {
  width: clamp(1.75rem, 3.5vw, 2rem);
  text-align: center;
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 600;
  border-left: 0.0625rem solid var(--border);
  border-right: 0.0625rem solid var(--border);
  line-height: clamp(1.5rem, 3vw, 1.75rem);
}

.drawer__item-remove {
  position: absolute;
  top: clamp(0.75rem, 1.5vh, 1rem);
  right: 0;
  color: var(--text-muted);
  transition: color var(--transition-fast);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.25rem;
}

.drawer__item-remove:hover {
  color: var(--danger);
}

/* UmaPenca banner */
.drawer__uma-penca-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: clamp(0.625rem, 1.2vw, 0.75rem) clamp(1.25rem, 2.5vw, 1.5rem);
  background: var(--accent-light);
  border-top: 0.0625rem solid var(--accent-subtle);
  border-bottom: 0.0625rem solid var(--accent-subtle);
  font-size: clamp(0.7rem, 1.2vw, 0.75rem);
  color: var(--accent);
  flex-shrink: 0;
}

/* Footer */
.drawer__footer {
  padding: clamp(1rem, 2vw, 1.25rem) clamp(1.25rem, 2.5vw, 1.5rem);
  border-top: 0.0625rem solid var(--border);
  background: var(--surface-1);
  position: relative;
  flex-shrink: 0;
}

.drawer__footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.0625rem;
  background: linear-gradient(90deg, transparent, var(--accent-subtle), transparent);
  opacity: 0.4;
}

.drawer__totals {
  margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
}

.drawer__total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.25rem, 0.5vh, 0.375rem) 0;
  font-size: clamp(0.8rem, 1.4vw, 0.875rem);
  color: var(--text-secondary);
}

.drawer__total-line--final {
  padding-top: clamp(0.5rem, 1vh, 0.75rem);
  margin-top: clamp(0.25rem, 0.5vh, 0.375rem);
  border-top: 0.0625rem solid var(--border);
  font-weight: 600;
  color: var(--text-primary);
}

.drawer__total-price {
  font-family: var(--font-mono);
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: var(--text-primary);
}

.drawer__clear {
  display: block;
  margin: clamp(0.5rem, 1.2vh, 0.75rem) auto 0;
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  color: var(--text-muted);
  text-decoration: underline;
  transition: color var(--transition-fast);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.25rem;
}

.drawer__clear:hover {
  color: var(--danger);
}
</style>
