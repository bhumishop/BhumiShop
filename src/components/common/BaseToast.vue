<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="['toast', `toast--${toast.type}`, { 'toast--leaving': toast.leaving }]"
      >
        <div class="toast__icon">
          <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <svg v-else-if="toast.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <svg v-else-if="toast.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <span class="toast__message">{{ toast.message }}</span>
        <button class="toast__close" @click="toastStore.removeToast(toast.id)" :aria-label="$t('common.close')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from '../../stores/toast'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: calc(var(--header-height) + clamp(0.5rem, 1.5vw, 1rem));
  right: clamp(0.5rem, 1.5vw, 1rem);
  z-index: 400;
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  max-width: min(24rem, 90vw);
  width: 100%;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
  padding: clamp(0.625rem, 1.5vw, 0.875rem) clamp(0.75rem, 1.5vw, 1rem);
  border-radius: var(--radius-md);
  background: var(--surface-0);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  pointer-events: all;
  animation: toast-enter 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transition: background var(--transition-smooth), border-color var(--transition-smooth);
}

.toast--leaving {
  animation: toast-exit 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.toast--success {
  border-left: 3px solid var(--success);
  box-shadow: var(--shadow-lg), 0 0 clamp(0.5rem, 1.5vw, 0.75rem) var(--success-light);
}
.toast--error {
  border-left: 3px solid var(--danger);
  box-shadow: var(--shadow-lg), 0 0 clamp(0.5rem, 1.5vw, 0.75rem) var(--danger-light);
}
.toast--warning {
  border-left: 3px solid var(--warning);
  box-shadow: var(--shadow-lg), 0 0 clamp(0.5rem, 1.5vw, 0.75rem) var(--warning-light);
}
.toast--info {
  border-left: 3px solid var(--info);
  box-shadow: var(--shadow-lg), 0 0 clamp(0.5rem, 1.5vw, 0.75rem) var(--info-light);
}

.toast__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.toast--success .toast__icon { color: var(--success); }
.toast--error .toast__icon { color: var(--danger); }
.toast--warning .toast__icon { color: var(--warning); }
.toast--info .toast__icon { color: var(--info); }

.toast__message {
  flex: 1;
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  line-height: 1.5;
  color: var(--text-primary);
  transition: color var(--transition-smooth);
}

.toast__close {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: color var(--transition-fast);
  margin-top: 1px;
}

.toast__close:hover {
  color: var(--text-primary);
}

.toast-list-enter-active {
  animation: toast-enter 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.toast-list-leave-active {
  animation: toast-exit 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes toast-enter {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes toast-exit {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(100%); }
}

/* ============================================
   MOBILE RESPONSIVE BREAKPOINTS
   ============================================ */

/* Tablet (max-width: 1024px) */
@media (max-width: var(--bp-tablet)) {
  .toast-container {
    max-width: min(22rem, 92vw);
    right: clamp(0.5rem, 2vw, 1rem);
  }

  .toast {
    gap: clamp(0.5rem, 1.5vw, 0.625rem);
    padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.625rem, 1.5vw, 0.875rem);
  }
}

/* Mobile Large (max-width: 768px) */
@media (max-width: var(--bp-mobile-lg)) {
  .toast-container {
    max-width: min(20rem, 94vw);
    right: 0.5rem;
    left: 0.5rem;
    margin: 0 auto;
  }

  .toast {
    padding: 0.5rem 0.625rem;
    gap: 0.5rem;
  }

  .toast__message {
    font-size: 0.8rem;
  }
}

/* Mobile (max-width: 640px) */
@media (max-width: var(--bp-mobile)) {
  .toast-container {
    top: calc(var(--header-height) + 0.5rem);
    right: 0.375rem;
    left: 0.375rem;
    max-width: calc(100% - 0.75rem);
    gap: 0.375rem;
  }

  .toast {
    padding: 0.5rem;
    gap: 0.375rem;
    border-radius: var(--radius-sm);
    border-left-width: 2px;
  }

  .toast__icon {
    margin-top: 0;
  }

  .toast__icon svg {
    width: 16px;
    height: 16px;
  }

  .toast__message {
    font-size: 0.75rem;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .toast__close {
    margin-top: 0;
    padding: 0.25rem;
    min-width: 28px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast__close svg {
    width: 12px;
    height: 12px;
  }

  .toast--success,
  .toast--error,
  .toast--warning,
  .toast--info {
    box-shadow: var(--shadow-md), 0 0 0.5rem var(--success-light);
  }

  .toast--error {
    box-shadow: var(--shadow-md), 0 0 0.5rem var(--danger-light);
  }

  .toast--warning {
    box-shadow: var(--shadow-md), 0 0 0.5rem var(--warning-light);
  }

  .toast--info {
    box-shadow: var(--shadow-md), 0 0 0.5rem var(--info-light);
  }
}

/* Mobile Small (max-width: 480px) */
@media (max-width: var(--bp-mobile-sm)) {
  .toast-container {
    right: 0.25rem;
    left: 0.25rem;
    max-width: calc(100% - 0.5rem);
    gap: 0.25rem;
    top: calc(var(--header-height) + 0.375rem);
  }

  .toast {
    padding: 0.375rem 0.5rem;
    gap: 0.375rem;
    border-left-width: 2px;
  }

  .toast__icon svg {
    width: 14px;
    height: 14px;
  }

  .toast__message {
    font-size: 0.7rem;
    line-height: 1.35;
  }

  .toast__close {
    padding: 0.125rem;
    min-width: 24px;
    min-height: 24px;
  }

  .toast__close svg {
    width: 11px;
    height: 11px;
  }
}

/* Mobile Extra Small (max-width: 360px) */
@media (max-width: var(--bp-mobile-xs)) {
  .toast-container {
    right: 0.125rem;
    left: 0.125rem;
    max-width: calc(100% - 0.25rem);
    gap: 0.25rem;
    top: calc(var(--header-height) + 0.25rem);
  }

  .toast {
    padding: 0.375rem;
    gap: 0.25rem;
    border-left-width: 2px;
    flex-wrap: wrap;
  }

  .toast__icon svg {
    width: 14px;
    height: 14px;
  }

  .toast__message {
    font-size: 0.65rem;
    line-height: 1.3;
    flex-basis: calc(100% - 2rem);
  }

  .toast__close {
    padding: 0.125rem;
    min-width: 22px;
    min-height: 22px;
  }

  .toast__close svg {
    width: 10px;
    height: 10px;
  }
}

/* Ensure toast stacks properly when multiple toasts are shown on narrow screens */
@media (max-width: var(--bp-mobile)) {
  .toast-container {
    max-height: calc(100vh - var(--header-height) - 1rem);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  /* Limit visible toasts on small screens to prevent overflow */
  .toast-container > div:nth-child(n+4) {
    display: none;
  }
}
</style>
