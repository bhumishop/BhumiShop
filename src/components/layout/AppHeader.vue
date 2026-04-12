<template>
  <header class="header" :class="{ 'header--scrolled': scrolled }">
    <div class="header__inner container">
      <router-link to="/" class="header__logo">
        <span class="header__logo-text">{{ $t('common.appName') }}</span>
      </router-link>

      <nav class="header__nav" :class="{ 'header__nav--open': mobileMenuOpen }">
        <router-link to="/" @click="mobileMenuOpen = false">{{ $t('nav.home') }}</router-link>
        <router-link to="/produtos" @click="mobileMenuOpen = false">{{ $t('nav.products') }}</router-link>
        <router-link v-if="authStore.adminRole" to="/admin" @click="mobileMenuOpen = false">{{ $t('nav.admin') }}</router-link>
      </nav>

      <div class="header__actions">
        <SearchBar />

        <ThemeSwitcher />

        <LanguageSwitcher />

        <button class="header__cart-btn" @click="cartStore.openDrawer()" :aria-label="$t('nav.cart')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span v-if="cartStore.totalItems > 0" class="header__cart-badge">{{ cartStore.totalItems }}</span>
        </button>

        <router-link v-if="authStore.isLoggedIn" to="/perfil" class="header__user-btn" :aria-label="$t('nav.profile')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </router-link>
        <router-link v-else to="/login" class="header__user-btn" :aria-label="$t('nav.login')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </router-link>

        <button class="header__mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen" :aria-label="$t('nav.menu')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from '../../utils/animations'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import SearchBar from '../common/SearchBar.vue'
import ThemeSwitcher from '../common/ThemeSwitcher.vue'
import LanguageSwitcher from '../common/LanguageSwitcher.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let scrollTween = null
let headerAnimations = null

function onScroll() {
  const isScrolled = window.scrollY > 10
  
  if (isScrolled !== scrolled.value) {
    scrolled.value = isScrolled
    
    // Smooth header transition on scroll
    const header = document.querySelector('.header')
    if (header) {
      if (scrollTween) scrollTween.kill()
      
      scrollTween = gsap.to(header, {
        boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : 'none',
        duration: 0.3,
        ease: 'power2.out',
        force3D: true,
        overwrite: true,
      })
    }
  }
}

function animateHeaderOnLoad() {
  if (prefersReducedMotion) return

  const tl = gsap.timeline({ defaults: { force3D: true } })

  // Logo entrance with slight bounce
  tl.fromTo('.header__logo',
    { opacity: 0, x: -20, scale: 0.95 },
    { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)' }
  )

  // Nav items stagger with spring
  tl.fromTo('.header__nav a',
    { opacity: 0, y: -10, scale: 0.98 },
    { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      duration: 0.5, 
      stagger: 0.08,
      ease: 'power3.out'
    },
    '-=0.3'
  )

  // Action buttons pop in with elastic
  tl.fromTo('.header__actions > *',
    { opacity: 0, scale: 0.85 },
    { 
      opacity: 1, 
      scale: 1, 
      duration: 0.5, 
      stagger: 0.06,
      ease: 'elastic.out(1, 0.6)'
    },
    '-=0.35'
  )

  // Subtle glow on logo after everything loads
  tl.to('.header__logo-text', {
    textShadow: '0 0 8px rgba(139, 92, 246, 0.3)',
    duration: 1,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: 1
  }, '+=0.2')

  headerAnimations = tl
}

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
  background: color-mix(in srgb, var(--surface-0) 85%, transparent);
  backdrop-filter: blur(clamp(0.5rem, 1vw, 0.75rem));
  -webkit-backdrop-filter: blur(clamp(0.5rem, 1vw, 0.75rem));
  border-bottom: 1px solid var(--border);
  height: var(--header-height);
  transition: box-shadow var(--transition-base), background var(--transition-smooth);
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--green-adorn), var(--accent), var(--green-adorn), transparent);
  opacity: 0;
  transition: opacity var(--transition-smooth);
}

.header--scrolled::after {
  opacity: 0.4;
}

.header--scrolled {
  box-shadow: var(--shadow-md);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: clamp(0.75rem, 2vw, 1.25rem);
}

.header__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: clamp(1.125rem, 2.5vw, 1.375rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;
  transition: transform var(--transition-fast);
}

.header__logo:hover {
  transform: scale(1.03);
}

.header__logo-text {
  color: var(--text-primary);
  transition: color var(--transition-smooth);
}

.header__logo-accent {
  color: var(--accent);
  text-shadow: 0 0 clamp(0.5rem, 1.5vw, 1rem) var(--accent-light);
}

.header__nav {
  display: flex;
  align-items: center;
  gap: clamp(1.25rem, 3vw, 2rem);
}

.header__nav a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: clamp(0.8rem, 1.2vw, 0.875rem);
  font-weight: 500;
  transition: color var(--transition-fast), transform var(--transition-fast);
  white-space: nowrap;
  position: relative;
}

.header__nav a::after {
  content: '';
  position: absolute;
  bottom: -0.25rem;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--transition-smooth);
  border-radius: var(--radius-full);
}

.header__nav a:hover::after,
.header__nav a.router-link-active::after {
  transform: scaleX(1);
  transform-origin: left;
}

.header__nav a:hover,
.header__nav a.router-link-active {
  color: var(--accent);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
}

.header__cart-btn,
.header__user-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(2.25rem, 4vw, 2.5rem);
  height: clamp(2.25rem, 4vw, 2.5rem);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.header__cart-btn:hover,
.header__user-btn:hover {
  color: var(--accent);
  background: var(--accent-light);
  box-shadow: var(--glow-accent);
}

.header__cart-btn:active,
.header__user-btn:active {
  transform: scale(0.92);
}

.header__cart-badge {
  position: absolute;
  top: clamp(0.125rem, 0.3vw, 0.1875rem);
  right: clamp(0.125rem, 0.3vw, 0.1875rem);
  background: linear-gradient(135deg, var(--accent), var(--green-adorn));
  color: white;
  font-size: clamp(0.6rem, 0.9vw, 0.65rem);
  font-weight: 700;
  min-width: clamp(0.875rem, 1.5vw, 1rem);
  height: clamp(0.875rem, 1.5vw, 1rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  line-height: 1;
  box-shadow: var(--glow-green);
  animation: pulse-glow 2s ease-in-out infinite;
}

.header__mobile-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: clamp(2.25rem, 4vw, 2.5rem);
  height: clamp(2.25rem, 4vw, 2.5rem);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.header__mobile-toggle:hover {
  color: var(--accent);
  background: var(--accent-light);
}

@media (max-width: 768px) {
  .header__nav {
    display: none;
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    background: var(--surface-0);
    border-bottom: 1px solid var(--border);
    padding: clamp(0.75rem, 2vh, 1rem) clamp(1rem, 3vw, 1.5rem);
    flex-direction: column;
    gap: clamp(0.25rem, 0.75vh, 0.5rem);
    box-shadow: var(--shadow-lg);
    animation: fade-in-down 0.3s ease;
  }

  .header__nav--open {
    display: flex;
  }

  .header__nav a {
    padding: clamp(0.5rem, 1.5vh, 0.75rem) 0;
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    width: 100%;
    border-bottom: 1px solid var(--surface-2);
  }

  .header__nav a::after {
    display: none;
  }

  .header__mobile-toggle {
    display: flex;
  }

  .header__actions :deep(.search-bar) {
    display: none;
  }
}
</style>
