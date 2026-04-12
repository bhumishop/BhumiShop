<template>
  <span :class="['badge', `badge--${variant}`, `badge--${size}`]">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'accent', 'success', 'warning', 'danger', 'info'].includes(v)
  },
  size: {
    type: String,
    default: 'sm',
    validator: v => ['xs', 'sm', 'md'].includes(v)
  }
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  border-radius: var(--radius-full);
  white-space: nowrap;
  line-height: 1;
  transition: all var(--transition-fast);
}

.badge--xs {
  font-size: clamp(0.55rem, 0.9vw, 0.65rem);
  padding: clamp(0.1rem, 0.25vw, 0.15rem) clamp(0.375rem, 0.75vw, 0.5rem);
}

.badge--sm {
  font-size: clamp(0.6rem, 1vw, 0.7rem);
  padding: clamp(0.125rem, 0.3vw, 0.2rem) clamp(0.45rem, 1vw, 0.6rem);
}

.badge--md {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  padding: clamp(0.2rem, 0.4vw, 0.3rem) clamp(0.5rem, 1.2vw, 0.75rem);
}

.badge--default {
  background: var(--surface-2);
  color: var(--text-secondary);
}

.badge--accent {
  background: var(--accent-light);
  color: var(--accent);
}

.badge--success {
  background: var(--success-light);
  color: var(--success);
}

.badge--warning {
  background: var(--warning-light);
  color: var(--warning);
}

.badge--danger {
  background: var(--danger-light);
  color: var(--danger);
}

.badge--info {
  background: var(--info-light);
  color: var(--info);
}
</style>
