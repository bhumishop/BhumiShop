<template>
  <picture>
    <!-- AVIF source (best compression, newest browsers) -->
    <source
      v-if="avifSrcset"
      :srcset="avifSrcset"
      :sizes="sizesAttr"
      type="image/avif"
    />

    <!-- WebP source (wide support) -->
    <source
      v-if="webpSrcset"
      :srcset="webpSrcset"
      :sizes="sizesAttr"
      type="image/webp"
    />

    <!-- Fallback img with original/optimized URL -->
    <img
      ref="imgRef"
      :src="fallbackSrc"
      :alt="alt"
      :loading="loading"
      :decoding="decoding"
      :fetchpriority="computedFetchPriority"
      :sizes="sizesAttr"
      :class="['optimized-image', imgClass]"
      :style="imgStyle"
      @load="handleLoad"
      @error="handleError"
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
import { ref, computed, watch, onMounted } from 'vue'
import {
  getOptimizedUrl,
  generateSrcset,
  generateSizes,
  transformAndOptimize,
  isValidHttpUrl
} from '../../utils/imageOptimizer'

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
  /** Maximum width for optimization */
  maxWidth: { type: Number, default: 1200 }
})

const emit = defineEmits(['load', 'error'])

const imgRef = ref(null)
const isLoaded = ref(false)
const hasError = ref(false)

// Compute transformed and optimized URLs
const webpSrcset = computed(() => {
  if (!props.src) return ''

  let url = props.src
  // Apply URL transformation (jsDelivr -> GitHub, 000 -> 001 for t-shirts)
  if (url.includes('cdn.jsdelivr.net') || url.includes('000_image')) {
    // Use transformAndOptimize for URL transformation only (no weserv optimization here)
    url = transformUrlOnly(url, props.category)
  }

  if (!isValidHttpUrl(url)) return ''

  return generateSrcset(url)
})

const avifSrcset = computed(() => {
  if (!props.src) return ''

  let url = props.src
  if (url.includes('cdn.jsdelivr.net') || url.includes('000_image')) {
    url = transformUrlOnly(url, props.category)
  }

  if (!isValidHttpUrl(url)) return ''

  // Generate AVIF srcset
  const sizes = [200, 400, 600, 800, 1200].filter(w => w <= props.maxWidth)
  return sizes
    .map(width => {
      const optimizedUrl = getOptimizedUrl(url, width, { output: 'avif' })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
})

const fallbackSrc = computed(() => {
  if (!props.src) return ''

  let url = props.src
  if (url.includes('cdn.jsdelivr.net') || url.includes('000_image')) {
    url = transformUrlOnly(url, props.category)
  }

  // For fallback, use the optimized URL at max width
  if (isValidHttpUrl(url)) {
    return getOptimizedUrl(url, props.maxWidth, { output: 'jpeg', quality: 85 })
  }

  return url
})

const sizesAttr = computed(() => generateSizes(props.layout))

const computedFetchPriority = computed(() => {
  if (props.fetchpriority !== 'auto') return props.fetchpriority
  // Auto-detect: eager loading usually means high priority
  return props.loading === 'eager' ? 'high' : 'low'
})

const imgStyle = computed(() => ({
  opacity: isLoaded.value ? 1 : 0,
  transition: 'opacity 0.3s ease'
}))

/**
 * Transform URL without applying weserv optimization
 * Only handles jsDelivr -> GitHub and 000 -> 001 for t-shirts
 */
function transformUrlOnly(url, category) {
  let transformed = url

  if (transformed.includes('cdn.jsdelivr.net/gh')) {
    transformed = transformed.replace(
      /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\//,
      'https://raw.githubusercontent.com/$1/$2/$3/'
    )
  }

  const cat = (category || '').toLowerCase()
  const isTshirt = cat.includes('camiseta') || cat.includes('t-shirt') ||
                   cat.includes('tshirt') || cat.includes('shirt') ||
                   cat.includes('vestuário') || cat.includes('wear')
  const isMug = cat.includes('caneca') || cat.includes('mug') || cat.includes('copo')

  if (transformed.includes('000_image') && isTshirt && !isMug) {
    transformed = transformed.replace('000_image', '001_image')
  }

  return transformed
}

function handleLoad(event) {
  isLoaded.value = true
  emit('load', event)
}

function handleError(event) {
  hasError.value = true
  emit('error', event)
}

// Reset state when src changes
watch(() => props.src, () => {
  isLoaded.value = false
  hasError.value = false
})

// Expose method for external access
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
