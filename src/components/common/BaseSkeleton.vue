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
  height: 14px;
  width: 100%;
}

.skeleton--title {
  height: 24px;
  width: 60%;
}

.skeleton--avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton--image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
}

.skeleton--button {
  height: 40px;
  width: 120px;
  border-radius: var(--radius-md);
}

.skeleton--card {
  width: 100%;
  height: 240px;
  border-radius: var(--radius-lg);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
