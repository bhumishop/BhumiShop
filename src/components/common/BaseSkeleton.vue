<template>
  <div :class="['skeleton', `skeleton--${variant}`]" :style="width ? { width } : {}"></div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'text',
    validator: v => ['text', 'title', 'avatar', 'image', 'button', 'card'].includes(v)
  },
  width: String
})
</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton--text {
  height: clamp(0.75rem, 1.5vw, 0.875rem);
  width: 100%;
}

.skeleton--title {
  height: clamp(1.25rem, 2.5vw, 1.5rem);
  width: 60%;
}

.skeleton--avatar {
  width: clamp(2rem, 4vw, 2.5rem);
  height: clamp(2rem, 4vw, 2.5rem);
  border-radius: 50%;
}

.skeleton--image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
}

.skeleton--button {
  height: clamp(2.25rem, 4.5vw, 2.5rem);
  width: clamp(6rem, 12vw, 7.5rem);
  border-radius: var(--radius-md);
}

.skeleton--card {
  width: 100%;
  height: clamp(12rem, 25vh, 15rem);
  border-radius: var(--radius-lg);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
