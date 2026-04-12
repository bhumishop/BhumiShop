<template>
  <div v-if="sizes && sizes.length" class="variants">
    <p class="variants__label">{{ $t('productVariants.size') }}</p>
    <div class="variants__sizes">
      <button
        v-for="size in sizes"
        :key="size"
        :class="['variants__size', { 'variants__size--active': modelValue === size }]"
        @click="$emit('update:modelValue', modelValue === size ? null : size)"
      >
        {{ size }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sizes: { type: Array, default: () => [] },
  modelValue: { type: String, default: null }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.variants__label {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: clamp(0.375rem, 0.75vh, 0.5rem);
}

.variants__sizes {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.variants__size {
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.75rem, 1.5vw, 1rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  font-weight: 500;
  color: var(--text-primary);
  background: var(--surface-0);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.variants__size:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}

.variants__size--active {
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border-color: var(--accent);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}
</style>
