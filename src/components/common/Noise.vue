<template>
  <canvas
    ref="grainRef"
    class="noise-canvas"
    :style="`image-rendering: pixelated; mix-blend-mode: ${props.mixBlendMode}`"
  ></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef, watch } from 'vue';
import {
  useDocumentVisibility,
  useEventListener,
  usePreferredReducedMotion
} from '@vueuse/core';

interface NoiseProps {
  patternRefreshInterval?: number;
  patternAlpha?: number;
  mixBlendMode?: string;
}

const props = withDefaults(defineProps<NoiseProps>(), {
  patternRefreshInterval: 4,
  patternAlpha: 5,
  mixBlendMode: 'overlay'
});

const grainRef = useTemplateRef<HTMLCanvasElement>('grainRef');

const canvasSize = 512; // Reduced from 1024 for better performance
// A handful of pre-baked tiles cycled over time, instead of regenerating
// 262,144 random pixels every refresh frame.
const TILE_COUNT = 4;

const documentVisible = useDocumentVisibility();
const reducedMotion = usePreferredReducedMotion();

const tiles: ImageData[] = [];
let cursor = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;
let idleHandle: number | null = null;
let idleTimeout: ReturnType<typeof setTimeout> | null = null;
let cancelled = false;

const scheduleIdle = (task: () => void) => {
  if (typeof requestIdleCallback === 'function') {
    idleHandle = requestIdleCallback(() => task(), { timeout: 1000 });
  } else {
    idleTimeout = setTimeout(task, 100);
  }
};

const cancelIdle = () => {
  if (idleHandle !== null && typeof cancelIdleCallback === 'function') {
    cancelIdleCallback(idleHandle);
    idleHandle = null;
  }
  if (idleTimeout !== null) {
    clearTimeout(idleTimeout);
    idleTimeout = null;
  }
};

const bakeTile = (ctx: CanvasRenderingContext2D): ImageData => {
  const data = ctx.createImageData(canvasSize, canvasSize);
  const buf = new Uint32Array(data.data.buffer);
  const a = props.patternAlpha << 24;
  for (let i = 0; i < buf.length; i++) {
    const v = (Math.random() * 255) | 0;
    buf[i] = a | (v << 16) | (v << 8) | v;
  }
  return data;
};

const paint = (ctx: CanvasRenderingContext2D, tile?: ImageData) => {
  const data = tile ?? tiles[cursor];
  if (data) ctx.putImageData(data, 0, 0);
};

const bakeRemainingTiles = (ctx: CanvasRenderingContext2D) => {
  if (cancelled || tiles.length >= TILE_COUNT) return;
  tiles.push(bakeTile(ctx));
  scheduleIdle(() => bakeRemainingTiles(ctx));
};

const refreshMs = () => Math.max(2, Math.round(props.patternRefreshInterval)) * (1000 / 60);

const stopInterval = () => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const startInterval = (ctx: CanvasRenderingContext2D) => {
  stopInterval();
  if (tiles.length === 0) return;
  intervalId = setInterval(() => {
    if (tiles.length < 2) return;
    cursor = (cursor + 1) % tiles.length;
    paint(ctx);
  }, refreshMs());
};

const resize = () => {
  const canvas = grainRef.value;
  if (!canvas) return;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
};

onMounted(() => {
  const canvas = grainRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  cancelled = false;
  resize();

  // One tile synchronously so the texture is visible on first paint, the rest
  // baked during idle time.
  tiles.push(bakeTile(ctx));
  paint(ctx, tiles[0]);
  scheduleIdle(() => bakeRemainingTiles(ctx));

  // Animating the grain is pure decoration: pause it when the tab is hidden
  // or the user asked for reduced motion.
  if (documentVisible.value === 'visible' && reducedMotion.value !== 'reduce') {
    startInterval(ctx);
  }
});

watch([documentVisible, reducedMotion], ([visible, reduce]) => {
  const ctx = grainRef.value?.getContext('2d');
  if (!ctx) return;
  if (visible === 'visible' && !reduce) startInterval(ctx);
  else stopInterval();
});

watch(
  () => props.patternAlpha,
  () => {
    const ctx = grainRef.value?.getContext('2d');
    if (!ctx) return;
    tiles.length = 0;
    cursor = 0;
    tiles.push(bakeTile(ctx));
    paint(ctx, tiles[0]);
    scheduleIdle(() => bakeRemainingTiles(ctx));
  }
);

useEventListener('resize', resize);

onBeforeUnmount(() => {
  cancelled = true;
  cancelIdle();
  stopInterval();
});
</script>

<style scoped>
.noise-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  pointer-events: none;
  z-index: 0;
}
</style>
