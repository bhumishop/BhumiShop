<template>
  <div class="scroll-velocity" ref="containerRef">
    <div class="scroll-velocity__track">
      <div
        class="scroll-velocity__text"
        ref="scrollerRef"
      >
        <span v-for="n in repeatCount" :key="n" class="scroll-velocity__item">
          {{ text }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  text?: string
  velocity?: number
  repeatCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  text: 'BhumiShop',
  velocity: 1,
  repeatCount: 20
})

const containerRef = ref<HTMLDivElement | null>(null)
const scrollerRef = ref<HTMLDivElement | null>(null)

let animationId: number | null = null
let position = 0

const animate = () => {
  if (!scrollerRef.value || !containerRef.value) return

  position -= props.velocity
  const singleItemWidth = scrollerRef.value.scrollWidth / props.repeatCount
  const resetPoint = -singleItemWidth * (props.repeatCount / 2)

  if (position < resetPoint) {
    position = 0
  }

  scrollerRef.value.style.transform = `translateX(${position}px)`
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.scroll-velocity {
  overflow: hidden;
  padding: 1.5rem 0;
  background: var(--surface-0, #1a1a1a);
  border-top: 1px solid var(--border, rgba(255, 255, 255, 0.1));
  border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.1));
}

.scroll-velocity__track {
  overflow: hidden;
  width: 100%;
}

.scroll-velocity__text {
  display: flex;
  white-space: nowrap;
  will-change: transform;
}

.scroll-velocity__item {
  flex-shrink: 0;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-muted, rgba(255, 255, 255, 0.5));
  padding: 0 2rem;
}
</style>
