<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal" :class="[`modal--${size}`]">
        <div class="modal__header">
          <h2 class="modal__title">{{ title }}</h2>
          <button class="modal__close" @click="close" :aria-label="$t('common.close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const _props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(clamp(0.25rem, 0.75vw, 0.5rem));
  -webkit-backdrop-filter: blur(clamp(0.25rem, 0.75vw, 0.5rem));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: clamp(0.75rem, 2vw, 1.25rem);
  animation: fade-in 0.25s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: var(--surface-0);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl), var(--glow-accent);
  width: 100%;
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

.modal--sm { max-width: min(25rem, 90vw); }
.modal--md { max-width: min(35rem, 90vw); }
.modal--lg { max-width: min(45rem, 90vw); }

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(0.875rem, 2vw, 1.25rem) clamp(1rem, 2.5vw, 1.5rem);
  border-bottom: 1px solid var(--border);
}

.modal__title {
  font-size: clamp(0.95rem, 1.8vw, 1.125rem);
  font-weight: 600;
}

.modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(2rem, 4vw, 2.25rem);
  height: clamp(2rem, 4vw, 2.25rem);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.modal__close:hover {
  background: var(--surface-2);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.modal__body {
  padding: clamp(1rem, 2.5vw, 1.5rem);
  overflow-y: auto;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
  padding: clamp(0.75rem, 1.5vw, 1rem) clamp(1rem, 2.5vw, 1.5rem);
  border-top: 1px solid var(--border);
}

/* ── Mobile Responsive Breakpoints ── */

/* Tablet (max-width: 1024px) */
@media (max-width: var(--bp-tablet)) {
  .modal--sm { max-width: min(25rem, 92vw); }
  .modal--md { max-width: min(35rem, 92vw); }
  .modal--lg { max-width: min(45rem, 92vw); }
}

/* Mobile Large (max-width: 768px) */
@media (max-width: var(--bp-mobile-lg)) {
  .modal-overlay {
    padding: var(--spacing-sm);
    align-items: flex-end;
  }

  .modal {
    max-height: 95vh;
    max-height: 95dvh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .modal--sm,
  .modal--md,
  .modal--lg {
    max-width: 100vw;
  }

  .modal__header {
    padding: 0.875rem 1rem;
  }

  .modal__title {
    font-size: 1rem;
  }

  .modal__body {
    padding: 1rem;
  }

  .modal__footer {
    padding: 0.875rem 1rem;
  }
}

/* Mobile (max-width: 640px) */
@media (max-width: var(--bp-mobile)) {
  .modal-overlay {
    padding: 0;
    align-items: stretch;
  }

  .modal {
    max-height: 100vh;
    max-height: 100dvh;
    height: auto;
    max-height: 85vh;
    max-height: 85dvh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    margin: auto 0 0;
  }

  .modal--sm,
  .modal--md,
  .modal--lg {
    max-width: 100%;
    width: 100%;
  }

  .modal__header {
    padding: 0.75rem 0.875rem;
  }

  .modal__title {
    font-size: 0.9375rem;
  }

  .modal__close {
    width: 2.25rem;
    height: 2.25rem;
  }

  .modal__body {
    padding: 0.875rem;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal__footer {
    padding: 0.75rem 0.875rem;
    gap: 0.5rem;
  }
}

/* Mobile Small (max-width: 480px) */
@media (max-width: var(--bp-mobile-sm)) {
  .modal {
    max-height: 90vh;
    max-height: 90dvh;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .modal__header {
    padding: 0.625rem 0.75rem;
  }

  .modal__title {
    font-size: 0.875rem;
  }

  .modal__close {
    width: 2rem;
    height: 2rem;
  }

  .modal__close svg {
    width: 18px;
    height: 18px;
  }

  .modal__body {
    padding: 0.75rem;
  }

  .modal__footer {
    flex-direction: column;
    padding: 0.625rem 0.75rem;
    gap: 0.5rem;
  }

  .modal__footer :deep(button),
  .modal__footer :deep(a) {
    width: 100%;
    justify-content: center;
  }
}

/* Mobile Extra Small (max-width: 360px) */
@media (max-width: var(--bp-mobile-xs)) {
  .modal-overlay {
    padding: 0;
  }

  .modal {
    max-height: 95vh;
    max-height: 95dvh;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  }

  .modal__header {
    padding: 0.5rem 0.625rem;
  }

  .modal__title {
    font-size: 0.8125rem;
  }

  .modal__close {
    width: 1.875rem;
    height: 1.875rem;
  }

  .modal__close svg {
    width: 16px;
    height: 16px;
  }

  .modal__body {
    padding: 0.625rem;
  }

  .modal__footer {
    padding: 0.5rem 0.625rem;
    gap: 0.375rem;
  }
}
</style>
