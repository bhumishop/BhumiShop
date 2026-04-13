<template>
  <canvas
    ref="grainRef"
    class="noise-canvas"
    :style="`image-rendering: pixelated; mix-blend-mode: ${props.mixBlendMode}`"
  ></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue';

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

let animationId = 0;
let frame = 0;
const canvasSize = 512; // Reduced from 1024 for better performance

const resize = () => {
  const canvas = grainRef.value;
  if (!canvas) return;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
};

let noiseData: ImageData;
let noise32: Uint32Array;

const initImageData = (ctx: CanvasRenderingContext2D) => {
  noiseData = ctx.createImageData(canvasSize, canvasSize);
  noise32 = new Uint32Array(noiseData.data.buffer);
};

const drawGrain = () => {
  const a = props.patternAlpha << 24;
  for (let i = 0; i < noise32.length; i++) {
    const v = (Math.random() * 255) | 0;
    noise32[i] = a | (v << 16) | (v << 8) | v;
  }
};

const loop = (ctx: CanvasRenderingContext2D) => {
  frame++;
  const refreshRate = Math.max(2, Math.round(props.patternRefreshInterval));
  if (frame % refreshRate === 0) {
    drawGrain();
    ctx.putImageData(noiseData, 0, 0);
  }
  animationId = requestAnimationFrame(() => loop(ctx));
};

onMounted(() => {
  const canvas = grainRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  resize();
  initImageData(ctx);
  drawGrain();
  ctx.putImageData(noiseData, 0, 0);
  loop(ctx);

  window.addEventListener('resize', resize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  cancelAnimationFrame(animationId);
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
