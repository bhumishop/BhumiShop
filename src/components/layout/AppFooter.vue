<template>
  <footer class="footer">
    <!-- DarkVeil background -->
    <div class="footer__darkveil">
      <DarkVeil
        :hue-shift="120"
        :noise-intensity="0"
        :scanline-intensity="0"
        :speed="0.5"
        :scanline-frequency="0"
        :warp-amount="0"
        :resolution-scale="1"
      />
    </div>

    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <div class="footer__logo">
            <span class="footer__logo-text">{{ $t('common.appName') }}</span>
          </div>
          <p class="footer__desc">{{ $t('common.appDescription') }}</p>
        </div>

        <div class="footer__col">
          <h4 class="footer__heading">Navegacao</h4>
          <router-link to="/">Home</router-link>
          <router-link to="/produtos">Produtos</router-link>
          <router-link to="/minhas-compras">Meus Pedidos</router-link>
        </div>

        <div class="footer__col">
          <h4 class="footer__heading">Institucional</h4>
          <router-link to="/sobre-nos">Sobre Nos</router-link>
          <router-link to="/contato">Contato</router-link>
          <router-link to="/faq">FAQ / Ajuda</router-link>
        </div>

        <div class="footer__col">
          <h4 class="footer__heading">Politicas</h4>
          <router-link to="/privacidade">Privacidade</router-link>
          <router-link to="/termos">Termos de Servico</router-link>
          <router-link to="/trocas">Trocas e Devolucoes</router-link>
          <router-link to="/envio">Politica de Envio</router-link>
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
import DarkVeil from '../common/DarkVeil.vue'

const currentYear = new Date().getFullYear()
let ctx = null

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    const elements = document.querySelectorAll('.footer__brand, .footer__col, .footer__bottom')
    if (elements.length) {
      gsap.set(elements, { opacity: 1, y: 0 })
    }
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
  border-top: 0.0625rem solid var(--border);
  padding: clamp(1.5rem, 5vh, 2.5rem) 0 clamp(0.75rem, 2vh, 1.25rem);
  margin-top: auto;
  position: relative;
  overflow: hidden;
  min-height: 12rem;
  contain: layout style;
  transition: background var(--transition-smooth), border-color var(--transition-smooth);
}

.footer__darkveil {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.15;
  pointer-events: none;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.0625rem;
  background: linear-gradient(90deg, transparent, var(--accent-subtle), var(--green-adorn), var(--accent-subtle), transparent);
  opacity: 0.5;
  z-index: 1;
}

.footer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 0.1875rem,
      rgba(139, 92, 246, 0.008) 0.1875rem,
      rgba(139, 92, 246, 0.008) 0.375rem
    );
  pointer-events: none;
  z-index: 0;
}

.footer__grid {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: clamp(1rem, 3vw, 2rem);
  margin-bottom: clamp(1rem, 3vh, 1.5rem);
  position: relative;
  z-index: 1;
}

.footer__logo {
  font-size: clamp(0.9rem, 2.5vw, 1.25rem);
  font-weight: 700;
  margin-bottom: clamp(0.375rem, 1.2vh, 0.625rem);
}

.footer__logo-text {
  color: var(--text-primary);
  transition: color var(--transition-smooth);
}

.footer__logo-accent {
  color: var(--accent);
  text-shadow: 0 0 clamp(0.25rem, 1vw, 0.5rem) var(--accent-light);
}

.footer__desc {
  color: var(--text-secondary);
  font-size: clamp(0.7rem, 1.5vw, 0.875rem);
  line-height: 1.6;
  max-width: min(17.5rem, 90%);
  transition: color var(--transition-smooth);
}

.footer__heading {
  font-size: clamp(0.6rem, 1.3vw, 0.75rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-primary);
  margin-bottom: clamp(0.5rem, 1.5vh, 0.75rem);
  transition: color var(--transition-smooth);
}

.footer__col a,
.footer__col p {
  display: block;
  color: var(--text-secondary);
  font-size: clamp(0.7rem, 1.5vw, 0.875rem);
  padding: clamp(0.0625rem, 0.3vh, 0.1875rem) 0;
  text-decoration: none;
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.footer__col a:hover {
  color: var(--accent);
  transform: translateX(clamp(0.0625rem, 0.4vw, 0.1875rem));
}

.footer__bottom {
  border-top: 0.0625rem solid var(--border);
  padding-top: clamp(0.625rem, 2vh, 1rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: clamp(0.6rem, 1.3vw, 0.75rem);
  color: var(--text-muted);
  transition: border-color var(--transition-smooth), color var(--transition-smooth);
}

.footer__payment {
  font-size: clamp(0.55rem, 1.2vw, 0.7rem);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: clamp(0.1875rem, 0.6vw, 0.3125rem);
}

.footer__payment::before {
  content: '';
  display: inline-block;
  width: clamp(0.25rem, 0.8vw, 0.4375rem);
  height: clamp(0.25rem, 0.8vw, 0.4375rem);
  background: var(--green-adorn);
  border-radius: var(--radius-full);
  box-shadow: 0 0 clamp(0.25rem, 1vw, 0.4375rem) var(--green-adorn-glow);
  animation: pulse-glow 2s ease-in-out infinite;
}

@media (max-width: 768px) {
  .footer__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(0.875rem, 3vw, 1.5rem);
  }

  .footer__bottom {
    flex-direction: column;
    gap: clamp(0.25rem, 1.5vh, 0.5rem);
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer__grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: clamp(0.75rem, 3vh, 1.25rem);
  }

  .footer__desc {
    max-width: 100%;
  }

  .footer__col a,
  .footer__col p {
    padding: clamp(0.125rem, 0.5vh, 0.25rem) 0;
  }
}

@media (max-width: 360px) {
  .footer {
    padding: clamp(1rem, 4vh, 1.5rem) 0 clamp(0.5rem, 1.5vh, 0.875rem);
  }

  .footer__grid {
    gap: clamp(0.625rem, 3vh, 1rem);
  }

  .footer__logo {
    font-size: clamp(0.8rem, 3vw, 1rem);
  }

  .footer__desc {
    font-size: clamp(0.65rem, 2vw, 0.8rem);
  }

  .footer__heading {
    font-size: clamp(0.55rem, 1.8vw, 0.65rem);
  }

  .footer__col a,
  .footer__col p {
    font-size: clamp(0.65rem, 2vw, 0.8rem);
  }

  .footer__bottom {
    font-size: clamp(0.55rem, 1.8vw, 0.65rem);
  }

  .footer__payment {
    font-size: clamp(0.5rem, 1.5vw, 0.6rem);
  }
}
</style>
