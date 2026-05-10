<template>
  <button
    ref="buttonRef"
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--full': full, 'btn--loading': loading, 'btn--rainbow': rainbow }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span class="btn__texture" aria-hidden="true"></span>
    <span v-if="loading" class="btn__spinner"></span>
    <slot />
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from '../../utils/animations'

const _props = defineProps({
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
  disabled: Boolean,
  rainbow: Boolean
})

const emit = defineEmits(['click'])
const buttonRef = ref(null)
const _rippleRef = ref(null)
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

.btn__texture {
  position: absolute;
  inset: 0;
  background: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 1px,
      rgba(255, 255, 255, 0.015) 1px,
      rgba(255, 255, 255, 0.015) 2px
    );
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%), rgba(255, 255, 255, 0.3) 0%, transparent 60%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.3s ease;
  z-index: 2;
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
  box-shadow: 0 clamp(0.125rem, 0.4vw, 0.25rem) clamp(0.5rem, 1vw, 0.75rem) rgba(139, 92, 246, 0.25);
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--accent-hover), var(--accent));
  box-shadow: var(--glow-accent);
  transform: translateY(clamp(-0.0625rem, -0.15vw, -0.125rem));
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
}

.btn--secondary {
  background: var(--surface-2);
  color: var(--text-primary);
  border: 0.0625rem solid var(--border);
  transition: all var(--transition-fast);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--surface-3);
  border-color: var(--accent-subtle);
  transform: translateY(clamp(-0.0625rem, -0.15vw, -0.125rem));
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
  box-shadow: 0 clamp(0.125rem, 0.4vw, 0.25rem) clamp(0.5rem, 1vw, 0.75rem) rgba(239, 68, 68, 0.2);
}

.btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, color-mix(in srgb, var(--danger) 85%, black), var(--danger));
  box-shadow: 0 clamp(0.25rem, 0.6vw, 0.375rem) clamp(0.75rem, 1.5vw, 1rem) rgba(239, 68, 68, 0.3);
  transform: translateY(clamp(-0.0625rem, -0.15vw, -0.125rem));
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
  border: 0.125rem solid rgba(255, 255, 255, 0.3);
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

/* ===== Rainbow border animation (matching ProductPixelCard hover) ===== */
.btn--rainbow {
  --rainbow-radius: clamp(0.5rem, 1.5vw, 0.75rem);
  --rainbow-border-width: 0.125rem;

  position: relative;
  border-radius: var(--rainbow-radius);
  background: var(--surface-1);
  color: var(--text-primary);
  z-index: 0;
  overflow: visible;
  border: none;
}

.btn--rainbow::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--rainbow-radius);
  padding: var(--rainbow-border-width);
  background: conic-gradient(
    from var(--border-angle, 0deg),
    #8b5cf6,
    #ec4899,
    #f59e0b,
    #22c55e,
    #06b6d4,
    #3b82f6,
    #8b5cf6
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  z-index: 1;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.btn--rainbow:hover::before {
  opacity: 0.8;
  animation: btn-border-rotate 3s linear infinite;
}

.btn--rainbow::after {
  content: '';
  position: absolute;
  inset: var(--rainbow-border-width);
  border-radius: calc(var(--rainbow-radius) - var(--rainbow-border-width));
  background: var(--surface-1);
  z-index: 0;
  pointer-events: none;
}

.btn--rainbow .btn__texture {
  z-index: 1;
}

.btn--rainbow .btn__spinner,
.btn--rainbow > *:not(::before):not(::after) {
  position: relative;
  z-index: 2;
}

.btn--rainbow:hover {
  background: transparent;
  box-shadow:
    0 clamp(0.25rem, 0.6vw, 0.375rem) clamp(1rem, 2vw, 1.25rem) rgba(139, 92, 246, 0.2),
    0 0 clamp(1.5rem, 3vw, 1.875rem) rgba(139, 92, 246, 0.05);
  transform: translateY(clamp(-0.125rem, -0.3vw, -0.25rem));
}

.btn--rainbow:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

@keyframes btn-border-rotate {
  to { --border-angle: 360deg; }
}

@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
</style>
