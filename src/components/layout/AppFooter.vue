<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <div class="footer__logo">
            <span class="footer__logo-text">{{ $t('common.appName') }}</span>
          </div>
          <p class="footer__desc">{{ $t('common.appDescription') }}</p>
        </div>

        <div class="footer__col">
          <h4 class="footer__heading">{{ $t('nav.home') }}</h4>
          <router-link to="/">{{ $t('nav.home') }}</router-link>
          <router-link to="/produtos">{{ $t('nav.products') }}</router-link>
          <router-link to="/minhas-compras">{{ $t('nav.myOrders') }}</router-link>
        </div>

        <div class="footer__col">
          <h4 class="footer__heading">{{ $t('nav.account') }}</h4>
          <router-link to="/login">{{ $t('nav.login') }}</router-link>
          <router-link to="/perfil">{{ $t('nav.profile') }}</router-link>
        </div>

        <div class="footer__col">
          <h4 class="footer__heading">{{ $t('nav.contact') }}</h4>
          <p>{{ $t('common.contactEmail') }}</p>
        </div>
      </div>

      <div class="footer__bottom">
        <p>{{ $t('common.copyright', { year: currentYear }) }}</p>
        <p class="footer__payment">{{ $t('common.securePayment') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { gsap, scrollReveal, scrollBatch, createAnimationContext } from '../../utils/animations'

const currentYear = new Date().getFullYear()
let ctx = null

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set('.footer__brand, .footer__col, .footer__bottom', { opacity: 1, y: 0 })
    return
  }

  ctx = createAnimationContext()

  ctx.add(() => {
    // Brand section slides in with subtle rotation
    scrollReveal('.footer__brand', {
      fromY: 30,
      fromRotation: -1,
      duration: 0.7,
      ease: 'power3.out',
      start: 'top 90%',
      once: true,
    })

    // Footer columns stagger with scale - using batch for performance
    scrollBatch('.footer__col', {
      fromY: 20,
      fromScale: 0.98,
      duration: 0.5,
      stagger: 0.1,
      ease: 'back.out(1.2)',
      start: 'top 92%',
      once: true,
    })

    // Bottom bar slides up
    scrollReveal('.footer__bottom', {
      fromY: 15,
      duration: 0.5,
      ease: 'power3.out',
      start: 'top 95%',
      once: true,
    })
  })
})

onUnmounted(() => {
  if (ctx) {
    ctx.revert()
    ctx = null
  }
})
</script>

<style scoped>
.footer {
  background: var(--surface-0);
  border-top: 1px solid var(--border);
  padding: clamp(2rem, 5vh, 3.5rem) 0 clamp(1rem, 2vh, 1.75rem);
  margin-top: auto;
  position: relative;
  transition: background var(--transition-smooth), border-color var(--transition-smooth);
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-subtle), var(--green-adorn), var(--accent-subtle), transparent);
  opacity: 0.5;
}

.footer__grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: clamp(1.25rem, 3vw, 2.5rem);
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.footer__logo {
  font-size: clamp(1.125rem, 2.5vw, 1.375rem);
  font-weight: 700;
  margin-bottom: clamp(0.5rem, 1.2vh, 0.75rem);
}

.footer__logo-text {
  color: var(--text-primary);
  transition: color var(--transition-smooth);
}

.footer__logo-accent {
  color: var(--accent);
  text-shadow: 0 0 clamp(0.375rem, 1vw, 0.75rem) var(--accent-light);
}

.footer__desc {
  color: var(--text-secondary);
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  line-height: 1.6;
  max-width: min(17.5rem, 90%);
  transition: color var(--transition-smooth);
}

.footer__heading {
  font-size: clamp(0.7rem, 1.1vw, 0.8rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-primary);
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
  transition: color var(--transition-smooth);
}

.footer__col a,
.footer__col p {
  display: block;
  color: var(--text-secondary);
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  padding: clamp(0.125rem, 0.3vh, 0.25rem) 0;
  text-decoration: none;
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.footer__col a:hover {
  color: var(--accent);
  transform: translateX(clamp(0.125rem, 0.4vw, 0.25rem));
}

.footer__bottom {
  border-top: 1px solid var(--border);
  padding-top: clamp(0.875rem, 2vh, 1.5rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: clamp(0.7rem, 1.1vw, 0.8rem);
  color: var(--text-muted);
  transition: border-color var(--transition-smooth), color var(--transition-smooth);
}

.footer__payment {
  font-size: clamp(0.65rem, 1vw, 0.75rem);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.footer__payment::before {
  content: '';
  display: inline-block;
  width: clamp(0.375rem, 0.75vw, 0.5rem);
  height: clamp(0.375rem, 0.75vw, 0.5rem);
  background: var(--green-adorn);
  border-radius: var(--radius-full);
  box-shadow: 0 0 clamp(0.375rem, 1vw, 0.625rem) var(--green-adorn-glow);
  animation: pulse-glow 2s ease-in-out infinite;
}

@media (max-width: 768px) {
  .footer__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer__bottom {
    flex-direction: column;
    gap: clamp(0.375rem, 1vh, 0.5rem);
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer__grid {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer__desc {
    max-width: 100%;
  }
}
</style>
