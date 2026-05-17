<template>
  <picture>
    <!-- WebP source (modern browsers, primary format) -->
    <source
      v-if="webpSrcset && !useDirectUrl"
      :srcset="webpSrcset"
      :sizes="sizesAttr"
      type="image/webp"
    />

    <!-- JPEG fallback (legacy browsers) -->
    <source
      v-if="jpegSrcset && !useDirectUrl"
      :srcset="jpegSrcset"
      :sizes="sizesAttr"
      type="image/jpeg"
    />

    <!-- Fallback img with optimized or direct URL -->
    <img
      ref="imgRef"
      :src="optimizedSrc"
      :alt="alt"
      :loading="loading"
      :decoding="decoding"
      :fetchpriority="computedFetchPriority"
      :sizes="sizesAttr"
      :class="['optimized-image', imgClass]"
      :style="imgStyle"
      @load="onLoad"
      @error="onError"
    />
  </picture>

  <!-- Blur-up placeholder overlay -->
  <div
    v-if="showPlaceholder && !isLoaded"
    class="optimized-image__placeholder"
    :class="{ 'optimized-image__placeholder--visible': !isLoaded && !hasError }"
  >
    <slot name="placeholder">
      <div class="optimized-image__spinner" />
    </slot>
  </div>

  <!-- Error fallback -->
  <div
    v-if="hasError"
    class="optimized-image__error"
    :class="{ 'optimized-image__error--visible': hasError }"
  >
    <slot name="error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </slot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useImageOptimizer } from '../../composables/useImageOptimizer'

const props = defineProps({
  /** Source image URL */
  src: { type: String, default: '' },
  /** Alt text for accessibility */
  alt: { type: String, default: '' },
  /** Product category for URL transformation */
  category: { type: String, default: '' },
  /** Layout type for responsive sizing: 'card', 'gallery', 'thumbnail', 'hero', 'masonry' */
  layout: { type: String, default: 'card' },
  /** Loading strategy: 'lazy' (default) or 'eager' */
  loading: { type: String, default: 'lazy' },
  /** Image decoding: 'async' (default), 'sync', or 'auto' */
  decoding: { type: String, default: 'async' },
  /** Fetch priority: 'high', 'low', or 'auto' */
  fetchpriority: { type: String, default: 'auto' },
  /** Additional CSS class for the img element */
  imgClass: { type: String, default: '' },
  /** Show blur-up placeholder */
  showPlaceholder: { type: Boolean, default: true },
  /** Target width for optimization */
  width: { type: Number, default: 800 },
  /** Target height for optimization (optional, enables x,y sizing) */
  height: { type: Number, default: null },
  /** Image quality 1-100 */
  quality: { type: Number, default: 80 },
  /** Fit mode: 'cover', 'contain', 'fill' */
  fit: { type: String, default: 'cover' }
})

const emit = defineEmits(['load', 'error'])

const imgRef = ref(null)

// Use the image optimizer composable
const {
  optimizedSrc,
  webpSrcset,
  jpegSrcset,
  sizesAttr,
  isLoaded,
  hasError,
  useDirectUrl,
  handleLoad,
  handleImageError
} = useImageOptimizer(
  computed(() => props.src),
  {
    category: props.category,
    layout: props.layout,
    width: props.width,
    height: props.height,
    quality: props.quality,
    fit: props.fit
  }
)

const computedFetchPriority = computed(() => {
  if (props.fetchpriority !== 'auto') return props.fetchpriority
  return props.loading === 'eager' ? 'high' : 'low'
})

const imgStyle = computed(() => ({
  opacity: isLoaded.value ? 1 : 0,
  transition: 'opacity 0.3s ease'
}))

function onLoad(event) {
  handleLoad(event)
  emit('load', event)
}

function onError(event) {
  handleImageError(event)
  emit('error', event)
}

defineExpose({
  imgRef,
  isLoaded,
  hasError
})
</script>

<style scoped>
.optimized-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Blur-up placeholder */
.optimized-image__placeholder {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
  background: var(--surface-2, #1a1a2e);
}

.optimized-image__placeholder--visible {
  opacity: 1;
}

/* Spinner for placeholder */
.optimized-image__spinner {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-top-color: rgba(139, 92, 246, 0.8);
  border-radius: 50%;
  animation: optimized-spin 0.8s linear infinite;
}

@keyframes optimized-spin {
  to { transform: rotate(360deg); }
}

/* Error state */
.optimized-image__error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 2;
  background: var(--surface-2, #1a1a2e);
  color: var(--text-muted, #666);
}

.optimized-image__error--visible {
  opacity: 1;
}
</style>
