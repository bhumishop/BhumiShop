<template>
  <div class="gallery">
    <div class="gallery__main">
      <img
        v-if="currentImage && (currentImage.startsWith('data:') || currentImage.startsWith('http'))"
        :src="currentImage"
        :alt="productName"
        class="gallery__image"
      />
      <div v-else class="gallery__placeholder">
        {{ productName?.charAt(0) || '?' }}
      </div>
    </div>
    <div v-if="images.length > 1" class="gallery__thumbs">
      <button
        v-for="(img, index) in images"
        :key="index"
        :class="['gallery__thumb', { 'gallery__thumb--active': activeIndex === index }]"
        @click="activeIndex = index"
      >
        <img v-if="img && (img.startsWith('data:') || img.startsWith('http'))" :src="img" :alt="`${productName} ${index + 1}`" />
        <span v-else class="gallery__thumb-placeholder">{{ index + 1 }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  images: { type: Array, default: () => [] },
  productName: { type: String, default: '' }
})

const activeIndex = ref(0)

const currentImage = computed(() => props.images[activeIndex.value] || '')

watch(() => props.images, () => {
  activeIndex.value = 0
})
</script>

<style scoped>
.gallery__main {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery__placeholder {
  font-size: clamp(3rem, 8vw, 4rem);
  font-weight: 700;
  color: var(--text-muted);
}

.gallery__thumbs {
  display: flex;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  margin-top: clamp(0.5rem, 1.2vh, 0.75rem);
  overflow-x: auto;
}

.gallery__thumb {
  width: clamp(3.5rem, 7vw, 4rem);
  height: clamp(3.5rem, 7vw, 4rem);
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color var(--transition-fast);
  flex-shrink: 0;
  background: var(--surface-2);
}

.gallery__thumb--active {
  border-color: var(--accent);
}

.gallery__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery__thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  color: var(--text-muted);
}
</style>
