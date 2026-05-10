<template>
  <span class="fulfillment-badge" :class="badgeClass" :title="tooltipText">
    <svg v-if="normalizedType === 'uma_penca'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
    <svg v-else-if="normalizedType === 'digital'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>
    </svg>
    <svg v-else-if="normalizedType === 'uiclap'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
    {{ labelText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (v) => ['uma_penca', 'uma penca', 'digital', 'uiclap', 'third_party'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md'].includes(v)
  }
})

// Normalize 'uma penca' (space) to 'uma_penca' (underscore) for CSS class matching
const normalizedType = computed(() => {
  return props.type === 'uma penca' ? 'uma_penca' : props.type
})

const badgeClass = computed(() => {
  const classes = [`fulfillment-badge--${normalizedType.value}`]
  if (props.size === 'sm') classes.push('fulfillment-badge--sm')
  return classes
})

const labelText = computed(() => {
  return t(`fulfillment.${props.type}`, props.type)
})

const tooltipText = computed(() => {
  return t(`fulfillment.${props.type}Tooltip`, '')
})
</script>

<style scoped>
.fulfillment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm, 0.25rem);
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  flex-shrink: 0;
}

.fulfillment-badge--sm {
  font-size: 0.55rem;
  padding: 0.05rem 0.3rem;
}

.fulfillment-badge--uma_penca {
  background: var(--accent-subtle);
  color: var(--accent);
}

.fulfillment-badge--digital {
  background: var(--success-light);
  color: var(--success);
}

.fulfillment-badge--uiclap {
  background: var(--info-light);
  color: var(--info);
}

.fulfillment-badge--third_party {
  background: rgba(107, 114, 128, 0.12);
  color: var(--text-muted);
}
</style>
