<template>
  <header
    class="header"
    :class="headerClasses"
    :style="headerStyle"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="header__inner container">
      <!-- Left section: Logo -->
      <div class="header__section header__section--left">
        <router-link to="/" class="header__logo">
          <div class="header__logo__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="header__logo__text">{{ $t('common.appName') }}</span>
        </router-link>
      </div>

      <!-- Center section: Navigation -->
      <div class="header__section header__section--center">
        <nav class="header__nav" :class="{ 'header__nav--open': mobileMenuOpen }">
          <router-link to="/" @click="mobileMenuOpen = false" class="header__nav__item">
            <span class="header__nav__text">{{ $t('nav.home') }}</span>
          </router-link>
          <router-link to="/produtos" @click="mobileMenuOpen = false" class="header__nav__item">
            <span class="header__nav__text">{{ $t('nav.products') }}</span>
          </router-link>
          <router-link v-if="authStore.adminRole" to="/admin" @click="mobileMenuOpen = false" class="header__nav__item">
            <span class="header__nav__text">{{ $t('nav.admin') }}</span>
          </router-link>
        </nav>
      </div>

      <!-- Right section: Actions -->
      <div class="header__section header__section--right">
        <!-- Search (desktop) -->
        <div class="header__search">
          <SearchBar />
        </div>

        <!-- Divider -->
        <div class="header__divider" aria-hidden="true"></div>

        <!-- Utility icons (theme + language) -->
        <div class="header__utils">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>

        <!-- Divider -->
        <div class="header__divider" aria-hidden="true"></div>

        <!-- User actions -->
        <div class="header__user-actions">
          <!-- Cart -->
          <button class="header__action" @click="cartStore.openDrawer()" :aria-label="$t('nav.cart')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span v-if="cartStore.totalItems > 0" class="header__action__badge">
              {{ cartStore.totalItems > 9 ? '9+' : cartStore.totalItems }}
            </span>
          </button>

          <!-- User profile -->
          <router-link v-if="authStore.isLoggedIn" to="/perfil" class="header__action" :aria-label="$t('nav.profile')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </router-link>
          <router-link v-else to="/login" class="header__action header__action--login" :aria-label="$t('nav.login')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <span class="header__action__text">{{ $t('nav.login') }}</span>
          </router-link>
        </div>

        <!-- Mobile menu toggle -->
        <button class="header__mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen" :aria-label="$t('nav.menu')">
          <div class="header__mobile-toggle__icon" :class="{ 'header__mobile-toggle__icon--open': mobileMenuOpen }">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { gsap } from '../../utils/animations'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import SearchBar from '../common/SearchBar.vue'
import ThemeSwitcher from '../common/ThemeSwitcher.vue'
import LanguageSwitcher from '../common/LanguageSwitcher.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const scrolled = ref(false)
const headerVisible = ref(true)
const mobileMenuOpen = ref(false)
const isHovered = ref(false)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lastScrollY = window.scrollY
let ticking = false
let scrollTween = null
let headerAnimations = null

// Scroll configuration
const SCROLL_THRESHOLD = 80
const HIDE_THRESHOLD = 5
const SHOW_THRESHOLD = 5

const headerClasses = computed(() => ({
  'header--scrolled': scrolled.value,
  'header--hidden': !headerVisible.value && scrolled.value,
  'header--hovered': isHovered.value && scrolled.value,
}))

const headerStyle = computed(() => {
  if (!scrolled.value) {
    return {
      background: 'transparent',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
      borderBottomColor: 'transparent',
    }
  }
  
  return {
    background: 'rgba(10, 10, 11, 0.72)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderBottomColor: 'rgba(139, 92, 246, 0.08)',
  }
})

function onScroll() {
  if (ticking) return
  
  requestAnimationFrame(() => {
    const currentScrollY = window.scrollY
    const isScrolled = currentScrollY > SCROLL_THRESHOLD
    
    // Update scrolled state
    if (isScrolled !== scrolled.value) {
      scrolled.value = isScrolled
      animateHeaderState(isScrolled)
    }
    
    // Always show header when near the top
    if (currentScrollY <= SCROLL_THRESHOLD) {
      if (!headerVisible.value) {
        headerVisible.value = true
      }
      lastScrollY = currentScrollY
      ticking = false
      return
    }
    
    // Calculate scroll direction and distance
    const scrollDelta = currentScrollY - lastScrollY
    
    // Scrolling down past threshold - hide header
    if (scrollDelta > HIDE_THRESHOLD && headerVisible.value) {
      headerVisible.value = false
    }
    // Scrolling up past threshold - show header
    else if (scrollDelta < -SHOW_THRESHOLD && !headerVisible.value) {
      headerVisible.value = true
    }
    
    lastScrollY = currentScrollY
    ticking = false
  })
  
  ticking = true
}

function animateHeaderState(isScrolled) {
  const header = document.querySelector('.header')
  if (!header || prefersReducedMotion) return
  
  if (scrollTween) scrollTween.kill()
  
  scrollTween = gsap.to(header, {
    boxShadow: isScrolled ? '0 8px 40px rgba(139, 92, 246, 0.06)' : 'none',
    duration: 0.4,
    ease: 'power2.out',
    force3D: true,
    overwrite: true,
  })
}

function animateHeaderVisibility(isVisible) {
  const header = document.querySelector('.header')
  if (!header || prefersReducedMotion) return
  
  // Kill any existing transform tween to prevent conflicts
  if (scrollTween) scrollTween.kill()
  
  gsap.to(header, {
    y: isVisible ? 0 : '-100%',
    duration: 0.3,
    ease: isVisible ? 'power3.out' : 'power3.in',
    force3D: true,
    overwrite: true,
    onComplete: () => {
      // Ensure final state is set
      if (isVisible) {
        header.style.transform = 'translateZ(0)'
      }
    }
  })
}

function animateHeaderOnLoad() {
  if (prefersReducedMotion) return

  const tl = gsap.timeline({ defaults: { force3D: true } })

  // Logo icon scales in with rotation
  tl.fromTo('.header__logo__icon',
    { opacity: 0, rotation: -90, scale: 0.5 },
    { opacity: 1, rotation: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }
  )

  // Logo text fades in
  tl.fromTo('.header__logo__text',
    { opacity: 0, x: -8 },
    { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' },
    '-=0.35'
  )

  // Nav items stagger
  tl.fromTo('.header__nav__item',
    { opacity: 0, y: -6 },
    { 
      opacity: 1, 
      y: 0,
      duration: 0.35, 
      stagger: 0.05,
      ease: 'power2.out'
    },
    '-=0.2'
  )

  // Right section elements stagger
  tl.fromTo('.header__section--right > *',
    { opacity: 0, scale: 0.85, y: -6 },
    { 
      opacity: 1, 
      scale: 1,
      y: 0,
      duration: 0.35, 
      stagger: 0.04,
      ease: 'back.out(1.4)'
    },
    '-=0.15'
  )

  headerAnimations = tl
}

watch(headerVisible, (newValue) => {
  animateHeaderVisibility(newValue)
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  animateHeaderOnLoad()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (scrollTween) scrollTween.kill()
  if (headerAnimations) headerAnimations.kill()
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-bottom: 1px solid transparent;
  height: var(--header-height-fixed, 4rem);
  transition: 
    background 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    -webkit-backdrop-filter 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  transform: translateZ(0);
}

/* Bottom gradient border */
.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 92, 246, 0.4) 25%,
    rgba(34, 197, 94, 0.5) 50%,
    rgba(139, 92, 246, 0.4) 75%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header--scrolled::after {
  opacity: 1;
}

/* Top glow on hover */
.header--hovered::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 92, 246, 0.3) 50%,
    transparent 100%
  );
}

/* Hidden state - GSAP handles the animation */
.header--hidden {
  transform: translateY(-100%) !important;
}

.header__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  height: 100%;
  gap: clamp(0.75rem, 2vw, 1.5rem);
}

/* Section layout */
.header__section {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 1rem);
}

.header__section--left {
  justify-content: flex-start;
}

.header__section--center {
  justify-content: center;
}

.header__section--right {
  justify-content: flex-end;
}

/* Logo */
.header__logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  white-space: nowrap;
}

.header__logo__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #8b5cf6 0%, #22c55e 100%);
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.3);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.header__logo:hover .header__logo__icon {
  transform: rotate(-6deg) scale(1.05);
}

.header__logo__text {
  font-size: clamp(1.0625rem, 2.2vw, 1.25rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Navigation */
.header__nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 4px;
  background: rgba(139, 92, 246, 0.04);
  border: 1px solid rgba(139, 92, 246, 0.08);
  border-radius: 12px;
}

.header__nav__item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 9px;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.header__nav__text {
  position: relative;
  z-index: 1;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.header__nav__item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(139, 92, 246, 0.1);
  border-radius: inherit;
  opacity: 0;
  transform: scale(0.92);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.header__nav__item:hover::before,
.header__nav__item.router-link-active::before {
  opacity: 1;
  transform: scale(1);
}

.header__nav__item:hover .header__nav__text,
.header__nav__item.router-link-active .header__nav__text {
  color: var(--accent);
}

/* Active indicator */
.header__nav__item::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 50%;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--green-adorn));
  border-radius: 99px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.header__nav__item.router-link-active::after {
  transform: translateX(-50%) scaleX(1);
}

/* Search wrapper */
.header__search {
  display: flex;
  align-items: center;
}

/* Divider */
.header__divider {
  width: 1px;
  height: 20px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(139, 92, 246, 0.2) 50%,
    transparent 100%
  );
}

/* Utility icons (theme + language) */
.header__utils {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

/* User actions */
.header__user-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Action buttons */
.header__action {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.header__action:hover {
  color: var(--accent);
  background: var(--accent-light);
  transform: translateY(-1px);
}

.header__action:active {
  transform: translateY(0) scale(0.96);
}

/* Login button with text */
.header__action--login {
  width: auto;
  padding: 0 0.75rem;
}

.header__action__text {
  font-size: 0.8125rem;
  font-weight: 500;
}

/* Badge */
.header__action__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: linear-gradient(135deg, #8b5cf6, #22c55e);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 99px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.35);
  animation: badge-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes badge-pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* Mobile toggle */
.header__mobile-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.header__mobile-toggle:hover {
  background: var(--accent-light);
}

.header__mobile-toggle__icon {
  position: relative;
  width: 18px;
  height: 14px;
}

.header__mobile-toggle__icon span {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--text-secondary);
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.header__mobile-toggle__icon span:nth-child(1) { top: 0; }
.header__mobile-toggle__icon span:nth-child(2) { top: 50%; transform: translateY(-50%); }
.header__mobile-toggle__icon span:nth-child(3) { bottom: 0; }

/* X animation */
.header__mobile-toggle__icon--open span:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  background: var(--accent);
}

.header__mobile-toggle__icon--open span:nth-child(2) {
  opacity: 0;
  transform: translateX(-10px);
}

.header__mobile-toggle__icon--open span:nth-child(3) {
  bottom: 50%;
  transform: translateY(50%) rotate(-45deg);
  background: var(--accent);
}

/* Mobile navigation */
@media (max-width: 768px) {
  .header__inner {
    grid-template-columns: auto 1fr auto;
  }

  .header__section--center {
    display: none;
  }

  .header__nav {
    display: none;
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    background: rgba(10, 10, 11, 0.96);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-bottom: 1px solid rgba(139, 92, 246, 0.1);
    padding: 0.75rem;
    flex-direction: column;
    gap: 0.25rem;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
    animation: mobile-menu-slide 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0;
    background: none;
    border: none;
  }

  @keyframes mobile-menu-slide {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header__nav--open {
    display: flex;
  }

  .header__nav__item {
    width: 100%;
    padding: 0.75rem 1rem;
  }

  .header__nav__item::after {
    display: none;
  }

  .header__nav__text {
    font-size: 0.9375rem;
  }

  .header__mobile-toggle {
    display: flex;
  }

  .header__search {
    display: none;
  }

  .header__divider {
    display: none;
  }
}

/* Light theme adjustments */
:root[data-theme="light"] .header--scrolled {
  background: rgba(255, 255, 255, 0.78);
}

:root[data-theme="light"] .header__nav {
  background: rgba(139, 92, 246, 0.03);
  border-color: rgba(139, 92, 246, 0.06);
}

:root[data-theme="light"] .header__nav__item:hover::before,
:root[data-theme="light"] .header__nav__item.router-link-active::before {
  background: rgba(139, 92, 246, 0.08);
}

:root[data-theme="light"] .header__divider {
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(139, 92, 246, 0.15) 50%,
    transparent 100%
  );
}

:root[data-theme="light"] .header__action__badge {
  background: linear-gradient(135deg, #7c3aed, #16a34a);
}
</style>
