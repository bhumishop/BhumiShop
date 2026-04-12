<template>
  <button
    ref="buttonRef"
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--full': full, 'btn--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn__spinner"></span>
    <slot />
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from '../../utils/animations'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'ghost', 'danger'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  full: Boolean,
  loading: Boolean,
  disabled: Boolean
})

const emit = defineEmits(['click'])
const buttonRef = ref(null)
const rippleRef = ref(null)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function handleClick(event) {
  if (buttonRef.value) {
    createRipple(event)
  }
  
  emit('click', event)
}

function createRipple(event) {
  if (prefersReducedMotion) return

  const button = buttonRef.value
  const ripple = document.createElement('span')
  const rect = button.getBoundingClientRect()
  
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'
  ripple.classList.add('btn__ripple')
  
  button.appendChild(ripple)
  
  // Enhanced ripple with radial gradient expansion
  gsap.fromTo(ripple,
    { scale: 0, opacity: 0.6 },
    {
      scale: 4.5,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      force3D: true,
      onComplete: () => ripple.remove()
    }
  )
}

function onHoverEnter() {
  if (prefersReducedMotion || !buttonRef.value) return

  // Subtle scale and glow on hover
  gsap.to(buttonRef.value, {
    scale: 1.02,
    duration: 0.25,
    ease: 'power2.out',
    force3D: true
  })
}

function onHoverLeave() {
  if (prefersReducedMotion || !buttonRef.value) return

  gsap.to(buttonRef.value, {
    scale: 1,
    duration: 0.25,
    ease: 'power2.out',
    force3D: true
  })
}

onMounted(() => {
  // Add hover listeners for enhanced effect
  if (buttonRef.value && !prefersReducedMotion) {
    buttonRef.value.addEventListener('mouseenter', onHoverEnter)
    buttonRef.value.addEventListener('mouseleave', onHoverLeave)
  }
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.375rem, 0.8vw, 0.5rem);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  white-space: nowrap;
  user-select: none;
  line-height: 1;
  position: relative;
  overflow: hidden;
}

.btn__ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  pointer-events: none;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%), rgba(255, 255, 255, 0.3) 0%, transparent 60%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.3s ease;
}

.btn:active::before {
  transform: scale(4);
  opacity: 1;
  transition: none;
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--sm {
  padding: clamp(0.375rem, 0.8vw, 0.5rem) clamp(0.75rem, 1.5vw, 1rem);
  font-size: clamp(0.7rem, 1.1vw, 0.8rem);
  height: clamp(2rem, 4vw, 2.25rem);
}

.btn--md {
  padding: clamp(0.5rem, 1vw, 0.625rem) clamp(1rem, 2vw, 1.25rem);
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  height: clamp(2.25rem, 4.5vw, 2.5rem);
}

.btn--lg {
  padding: clamp(0.625rem, 1.2vw, 0.75rem) clamp(1.25rem, 2.5vw, 1.5rem);
  font-size: clamp(0.9rem, 1.5vw, 1rem);
  height: clamp(2.75rem, 5vw, 3rem);
}

.btn--primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--accent-hover), var(--accent));
  box-shadow: var(--glow-accent);
  transform: translateY(-1px);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
}

.btn--secondary {
  background: var(--surface-2);
  color: var(--text-primary);
  border: 1px solid var(--border);
  transition: all var(--transition-fast);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--surface-3);
  border-color: var(--accent-subtle);
  transform: translateY(-1px);
}

.btn--ghost {
  background: transparent;
  color: var(--accent);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--accent-light);
  box-shadow: var(--glow-accent);
}

.btn--danger {
  background: linear-gradient(135deg, var(--danger), color-mix(in srgb, var(--danger) 85%, black));
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, color-mix(in srgb, var(--danger) 85%, black), var(--danger));
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.btn--full {
  width: 100%;
}

.btn--loading {
  pointer-events: none;
}

.btn__spinner {
  width: clamp(0.875rem, 1.5vw, 1rem);
  height: clamp(0.875rem, 1.5vw, 1rem);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.btn--secondary .btn__spinner {
  border-color: var(--surface-3);
  border-top-color: var(--text-primary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
