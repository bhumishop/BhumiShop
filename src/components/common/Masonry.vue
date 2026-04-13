<template>
  <div
    ref="containerRef"
    class="masonry-root"
    role="list"
    aria-label="Product grid"
  >
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="masonry-skeleton">
      <div
        v-for="i in skeletonCount"
        :key="'skeleton-' + i"
        class="masonry-skeleton__item"
        :style="{ height: skeletonHeights[i % skeletonHeights.length] + 'px' }"
      >
        <div class="masonry-skeleton__item-shimmer"></div>
      </div>
    </div>

    <!-- Masonry grid using CSS columns (native, no JS layout needed) -->
    <div v-else class="masonry-columns">
      <div
        v-for="item in items"
        :key="item.id"
        class="masonry-item"
        role="listitem"
      >
        <button
          class="masonry-item__card"
          type="button"
          :aria-label="item.name || 'View product'"
          @click="handleClick(item)"
          @keydown.enter="handleClick(item)"
          @keydown.space.prevent="handleClick(item)"
        >
          <!-- Image container -->
          <div class="masonry-item__image-wrap">
            <img
              :src="item.img"
              :alt="item.name || ''"
              class="masonry-item__img"
              loading="lazy"
              decoding="async"
              @error="handleImageError(item.id, $event)"
            />
            <!-- Hover overlay -->
            <div class="masonry-item__overlay" />
          </div>

          <!-- Product info below image -->
          <div v-if="showInfo" class="masonry-item__info">
            <p v-if="item.name" class="masonry-item__name">{{ item.name }}</p>
            <p v-if="item.price !== undefined" class="masonry-item__price">
              R$ {{ formatPrice(item.price) }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface MasonryItem {
  id: string;
  img: string;
  url: string;
  name?: string;
  price?: number;
  /** Height in pixels. If not provided, aspect ratio is used. */
  height?: number;
  /** CSS aspect-ratio fallback when height is not provided (default: '1/1') */
  aspectRatio?: string;
}

interface MasonryProps {
  items: MasonryItem[];
  columns?: number;
  gap?: number;
  showInfo?: boolean;
  onItemClick?: (_item: MasonryItem) => void;
}

const props = withDefaults(defineProps<MasonryProps>(), {
  columns: 4,
  gap: 16,
  showInfo: true,
  onItemClick: undefined,
});

const isLoading = ref(true);
const containerRef = ref<HTMLDivElement | null>(null);

/** Track broken images per item ID */
const brokenImages = ref<Set<string>>(new Set());

function handleImageError(itemId: string, event: Event) {
  const img = event.target as HTMLImageElement;
  brokenImages.value.add(itemId);
  // Replace with a colored placeholder SVG
  const name = (props.items.find(i => i.id === itemId)?.name || 'Product').replace(/'/g, '&#39;');
  img.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#f0f0f5" width="400" height="400"/><text x="50%" y="45%" font-family="system-ui" font-size="16" fill="#999" text-anchor="middle">${name}</text><text x="50%" y="55%" font-family="system-ui" font-size="12" fill="#bbb" text-anchor="middle">Image unavailable</text></svg>`)}`;
}

/** Responsive column count based on viewport width */
const responsiveColumns = ref(props.columns);

function updateResponsiveColumns() {
  const width = window.innerWidth;
  if (width >= 1500) responsiveColumns.value = 5;
  else if (width >= 1200) responsiveColumns.value = 4;
  else if (width >= 900) responsiveColumns.value = 3;
  else if (width >= 600) responsiveColumns.value = 2;
  else responsiveColumns.value = 1;
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(updateResponsiveColumns, 100);
}

onMounted(() => {
  updateResponsiveColumns();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if (resizeTimer) clearTimeout(resizeTimer);
});

/** Distribute items into columns for CSS masonry layout - used for potential JS fallback */
const _columns = computed(() => {
  const colCount = responsiveColumns.value;
  const result: MasonryItem[][] = Array.from({ length: colCount }, () => []);

  // Track column heights to distribute evenly
  const colHeights = new Array(colCount).fill(0);

  for (const item of props.items) {
    // Find the shortest column
    const shortestIdx = colHeights.indexOf(Math.min(...colHeights));
    result[shortestIdx].push(item);
    colHeights[shortestIdx] += getItemHeight(item);
  }

  return result;
});

/** Calculate item height for distribution logic */
function getItemHeight(item: MasonryItem): number {
  if (item.height) return item.height;
  // Default height estimate based on aspect ratio
  const containerWidth = containerRef.value?.clientWidth || 1200;
  const colWidth = (containerWidth - (responsiveColumns.value - 1) * props.gap) / responsiveColumns.value;
  const [w, h] = (item.aspectRatio || '1/1').split('/').map(Number);
  return colWidth * (h / w);
}

/** Skeleton loading state */
const skeletonCount = computed(() => responsiveColumns.value * 3);
const skeletonHeights = [180, 220, 260, 200, 240, 190];

/** Format price */
function formatPrice(value: number): string {
  return Number(value).toFixed(2).replace('.', ',');
}

/** Handle item click */
function handleClick(item: MasonryItem) {
  if (props.onItemClick) {
    props.onItemClick(item);
  }
}

/** Mark as loaded when items are available */
onMounted(() => {
  // Small delay to simulate loading, then show content
  requestAnimationFrame(() => {
    isLoading.value = false;
  });
});
</script>

<style scoped>
.masonry-root {
  width: 100%;
}

/* ===== CSS Columns Masonry Layout ===== */
.masonry-columns {
  columns: v-bind(responsiveColumns);
  column-gap: v-bind(`${props.gap}px`);
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: v-bind(`${props.gap}px`);
}

.masonry-item__card {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  text-align: left;
}

.masonry-item__card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.masonry-item__card:focus-visible {
  outline: 2px solid var(--accent, #8b5cf6);
  outline-offset: 2px;
}

/* ===== Image ===== */
.masonry-item__image-wrap {
  position: relative;
  overflow: hidden;
  background: var(--surface-1, #f5f5f7);
  aspect-ratio: v-bind('props.items[0]?.aspectRatio || "1/1"');
}

.masonry-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.4s ease;
}

.masonry-item__card:hover .masonry-item__img {
  transform: scale(1.05);
}

/* Hover overlay */
.masonry-item__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.3) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.masonry-item__card:hover .masonry-item__overlay {
  opacity: 1;
}

/* ===== Product info ===== */
.masonry-item__info {
  padding: 10px 12px 12px;
  background: var(--surface-0, #fff);
}

.masonry-item__name {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary, #111);
  line-height: 1.3;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.masonry-item__price {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent, #8b5cf6);
  margin: 0;
}

/* ===== Skeleton Loading ===== */
.masonry-skeleton {
  columns: v-bind(responsiveColumns);
  column-gap: v-bind(`${props.gap}px`);
}

.masonry-skeleton__item {
  break-inside: avoid;
  margin-bottom: v-bind(`${props.gap}px`);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-1, #e5e5e7);
}

.masonry-skeleton__item-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--surface-1, #e5e5e7) 25%,
    var(--surface-2, #d4d4d8) 50%,
    var(--surface-1, #e5e5e7) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== Responsive ===== */
@media (max-width: 1200px) {
  .masonry-columns,
  .masonry-skeleton {
    columns: 3;
  }
}

@media (max-width: 900px) {
  .masonry-columns,
  .masonry-skeleton {
    columns: 2;
  }
}

@media (max-width: 600px) {
  .masonry-columns,
  .masonry-skeleton {
    columns: 2;
  }

  .masonry-item__info {
    padding: 8px 10px 10px;
  }

  .masonry-item__name {
    font-size: 0.75rem;
  }

  .masonry-item__price {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .masonry-columns,
  .masonry-skeleton {
    columns: 1;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .masonry-skeleton__item-shimmer {
    animation: none;
  }

  .masonry-item__img {
    transition: none;
  }

  .masonry-item__card {
    transition: none;
  }

  .masonry-item__overlay {
    transition: none;
  }
}
</style>
