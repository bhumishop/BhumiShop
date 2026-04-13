<template>
  <Teleport to="body">
    <div v-if="show" class="provider-popup-overlay" @click.self="$emit('close')">
      <div class="provider-popup" role="dialog" aria-modal="true" :aria-label="$t('paymentProvider.title')">
        <div class="provider-popup__header">
          <h2 class="provider-popup__title">{{ $t('paymentProvider.title') }}</h2>
          <p class="provider-popup__subtitle">{{ $t('paymentProvider.subtitle') }}</p>
          <button class="provider-popup__close" @click="$emit('close')" :aria-label="$t('paymentProvider.close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="provider-popup__cards">
          <!-- Uma Penca Direct (only for Brazil users) -->
          <button
            v-if="isInBrazil"
            class="provider-card"
            :class="{ 'provider-card--selected': selected === 'uma_penca' }"
            @click="select('uma_penca')"
          >
            <div class="provider-card__icon provider-card__icon--uma-penca">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <div class="provider-card__info">
              <h3 class="provider-card__name">{{ $t('paymentProvider.umaPencaDirect') }}</h3>
              <p class="provider-card__desc">{{ $t('paymentProvider.umaPencaDesc') }}</p>
              <div class="provider-card__methods">
                <span class="provider-card__method">{{ $t('paymentProvider.externalCheckout') }}</span>
              </div>
            </div>
            <div class="provider-card__check">
              <svg v-if="selected === 'uma_penca'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </button>

          <!-- AbacatePay -->
          <button
            class="provider-card"
            :class="{ 'provider-card--selected': selected === 'abacatepay' }"
            @click="select('abacatepay')"
          >
            <div class="provider-card__icon provider-card__icon--abacatepay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
            <div class="provider-card__info">
              <h3 class="provider-card__name">{{ $t('paymentProvider.abacatepay') }}</h3>
              <p class="provider-card__desc">{{ $t('paymentProvider.abacatepayDesc') }}</p>
              <div class="provider-card__methods">
                <span class="provider-card__method provider-card__method--pix">{{ $t('paymentProvider.pix') }}</span>
                <span class="provider-card__method provider-card__method--card">{{ $t('paymentProvider.card') }}</span>
              </div>
            </div>
            <div class="provider-card__check">
              <svg v-if="selected === 'abacatepay'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </button>

          <!-- PIX Bricks International -->
          <button
            class="provider-card"
            :class="{ 'provider-card--selected': selected === 'pix_bricks' }"
            @click="select('pix_bricks')"
          >
            <div class="provider-card__icon provider-card__icon--pix-bricks">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            </div>
            <div class="provider-card__info">
              <h3 class="provider-card__name">{{ $t('paymentProvider.pixBricksIntl') }}</h3>
              <p class="provider-card__desc">{{ $t('paymentProvider.pixBricksDesc') }}</p>
              <div class="provider-card__methods">
                <span class="provider-card__method provider-card__method--pix">{{ $t('paymentProvider.pix') }}</span>
                <span class="provider-card__method provider-card__method--card">{{ $t('paymentProvider.card') }}</span>
                <span class="provider-card__method provider-card__method--intl">{{ $t('paymentProvider.upi') }}</span>
                <span class="provider-card__method provider-card__method--intl">{{ $t('paymentProvider.alipay') }}</span>
              </div>
              <div class="provider-card__flags">🇧🇷 🇮🇳 🇨🇳</div>
            </div>
            <div class="provider-card__check">
              <svg v-if="selected === 'pix_bricks'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </button>
        </div>

        <div class="provider-popup__footer">
          <button class="provider-popup__cancel" @click="$emit('close')">{{ $t('paymentProvider.cancel') }}</button>
          <button
            class="provider-popup__confirm"
            :disabled="!selected"
            @click="confirm"
          >
            {{ $t('paymentProvider.continue') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'

const _t = useI18n()
const authStore = useAuthStore()

const _props = defineProps({
  show: { type: Boolean, default: false },
  hasUmaPencaItems: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'select'])

const selected = ref('')

// Check if user is in Brazil based on saved location
const isInBrazil = computed(() => {
  return authStore.userLocation?.countryCode === 'BR'
})

function select(provider) {
  selected.value = provider
}

function confirm() {
  if (!selected.value) return
  emit('select', selected.value)
  selected.value = ''
}
</script>

<style scoped>
.provider-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(clamp(0.25rem, 0.75vw, 0.5rem));
  -webkit-backdrop-filter: blur(clamp(0.25rem, 0.75vw, 0.5rem));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
  padding: clamp(0.75rem, 2vw, 1.25rem);
  animation: fade-in 0.25s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.provider-popup {
  background: var(--surface-0);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl), var(--glow-accent);
  width: 100%;
  max-width: min(32rem, 92vw);
  max-height: 90vh;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(clamp(0.75rem, 2.5vh, 1.5rem)) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.provider-popup__header {
  position: relative;
  padding: clamp(1.25rem, 3vw, 1.75rem) clamp(1.25rem, 3vw, 1.75rem) clamp(0.75rem, 1.5vh, 1rem);
  text-align: center;
}

.provider-popup__title {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: clamp(0.25rem, 0.5vw, 0.375rem);
}

.provider-popup__subtitle {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
}

.provider-popup__close {
  position: absolute;
  top: clamp(0.75rem, 1.5vw, 1rem);
  right: clamp(0.75rem, 1.5vw, 1rem);
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(2rem, 4vw, 2.25rem);
  height: clamp(2rem, 4vw, 2.25rem);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  background: none;
  border: none;
  cursor: pointer;
}

.provider-popup__close:hover {
  background: var(--surface-2);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.provider-popup__cards {
  padding: 0 clamp(1.25rem, 3vw, 1.75rem);
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1.2vh, 0.75rem);
  overflow-y: auto;
}

.provider-card {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  padding: clamp(0.875rem, 2vw, 1.125rem);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-0);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  position: relative;
}

.provider-card:hover {
  border-color: var(--accent-subtle);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.provider-card--selected {
  border-color: var(--accent);
  background: var(--accent-light);
  box-shadow: var(--glow-accent);
}

.provider-card__icon {
  flex-shrink: 0;
  width: clamp(2.75rem, 6vw, 3rem);
  height: clamp(2.75rem, 6vw, 3rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.provider-card__icon--uma-penca {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.provider-card__icon--abacatepay {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.provider-card__icon--pix-bricks {
  background: linear-gradient(135deg, #009ee3, #0077b6);
  color: white;
}

.provider-card__info {
  flex: 1;
  min-width: 0;
}

.provider-card__name {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: clamp(0.2rem, 0.4vw, 0.25rem);
}

.provider-card__desc {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-secondary);
  margin-bottom: clamp(0.375rem, 0.75vw, 0.5rem);
}

.provider-card__methods {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.provider-card__method {
  padding: clamp(0.1rem, 0.3vw, 0.2rem) clamp(0.35rem, 0.7vw, 0.5rem);
  background: var(--surface-2);
  border-radius: var(--radius-sm);
  font-size: clamp(0.55rem, 1vw, 0.65rem);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.provider-card__method--pix {
  background: #e0f2fe;
  color: #0284c7;
}

.provider-card__method--card {
  background: #fef3c7;
  color: #b45309;
}

.provider-card__method--intl {
  background: #ede9fe;
  color: #7c3aed;
}

.provider-card__flags {
  margin-top: clamp(0.25rem, 0.5vw, 0.375rem);
  font-size: clamp(0.85rem, 1.5vw, 1rem);
}

.provider-card__check {
  flex-shrink: 0;
  width: clamp(1.5rem, 3vw, 1.75rem);
  height: clamp(1.5rem, 3vw, 1.75rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border);
  border-radius: 50%;
  color: var(--accent);
  transition: all var(--transition-fast);
}

.provider-card--selected .provider-card__check {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.provider-popup__footer {
  display: flex;
  justify-content: flex-end;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
  padding: clamp(0.875rem, 2vw, 1.25rem) clamp(1.25rem, 3vw, 1.75rem);
  border-top: 1px solid var(--border);
  margin-top: clamp(0.75rem, 1.5vh, 1rem);
}

.provider-popup__cancel {
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 2vw, 1.25rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-0);
  color: var(--text-secondary);
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.provider-popup__cancel:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.provider-popup__confirm {
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1.25rem, 2.5vw, 1.5rem);
  border: none;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: white;
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--glow-accent);
}

.provider-popup__confirm:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.provider-popup__confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
