<template>
  <div class="gallery">
    <div class="gallery__main">
      <img
        v-if="currentImage && isValidImage(currentImage)"
        :src="currentImage"
        :alt="productName"
        class="gallery__image"
        @error="handleImageError"
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
        <img v-if="img && isValidImage(img)" :src="img" :alt="`${productName} ${index + 1}`" @error="handleThumbError($event, index)" />
        <span v-else class="gallery__thumb-placeholder">{{ index + 1 }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { isLikelyBrokenCdnUrl, markImageUrlAsBroken } from '../../utils/brokenImages'

const props = defineProps({
  images: { type: Array, default: () => [] },
  productName: { type: String, default: '' },
  // When a color is selected, jump to that color's first image
  selectedColorImageIndex: { type: Number, default: null }
})

const activeIndex = ref(0)
const brokenThumbs = ref(new Set())

const currentImage = computed(() => props.images[activeIndex.value] || '')

/**
 * Check if an image URL is valid (not broken, not marked as broken CDN).
 */
function isValidImage(url) {
  if (!url) return false
  if (brokenThumbs.value.has(url)) return false
  // Allow data URLs
  if (url.startsWith('data:')) return true
  // For HTTP URLs, check if they're likely broken
  if (url.startsWith('http')) {
    return !isLikelyBrokenCdnUrl(url)
  }
  return false
}

function handleImageError(event) {
  const src = event.target?.src
  if (src) {
    markImageUrlAsBroken(src)
  }
}

function handleThumbError(event, index) {
  const src = event.target?.src
  if (src) {
    markImageUrlAsBroken(src)
    brokenThumbs.value.add(src)
  }
}

watch(() => props.images, () => {
  activeIndex.value = 0
  brokenThumbs.value.clear()
})

watch(() => props.selectedColorImageIndex, (newIndex) => {
  if (newIndex !== null && newIndex >= 0 && newIndex < props.images.length) {
    activeIndex.value = newIndex
  }
})

// Expose method to set active image
function setActiveImage(index) {
  if (index >= 0 && index < props.images.length) {
    activeIndex.value = index
  }
}

defineExpose({ setActiveImage })
</script>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
}

.gallery__main {
  width: 100%;
  height: clamp(320px, 50vw, 520px);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gallery__image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
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
  padding: 0;
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
