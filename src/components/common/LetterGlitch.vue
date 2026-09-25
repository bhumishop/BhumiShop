<template>
  <div class="relative overflow-hidden">
    <canvas ref="canvasRef" class="top-0 left-0 absolute w-full h-full" />

    <div
      v-if="outerVignette"
      class="top-0 left-0 absolute bg-[radial-gradient(circle,rgba(0,0,0,0)_60%,rgba(0,0,0,1)_100%)] w-full h-full pointer-events-none"
    />

    <div
      v-if="centerVignette"
      class="top-0 left-0 absolute bg-[radial-gradient(circle,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0)_60%)] w-full h-full pointer-events-none"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import {
  useDocumentVisibility,
  useEventListener,
  useIntersectionObserver,
  usePreferredReducedMotion
} from '@vueuse/core';

interface Props {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  glitchColors: () => ['#2b4539', '#61dca3', '#61b3dc'],
  glitchSpeed: 50,
  centerVignette: false,
  outerVignette: false,
  smooth: true
});

interface Letter {
  char: string;
  color: { r: number; g: number; b: number };
  target: { r: number; g: number; b: number };
  progress: number;
  inTransition: boolean;
}

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef');

// Plain (non-reactive) state: this grid holds ~10k cells for a full-screen
// backdrop and none of it is rendered by Vue. Wrapping it in a deep ref made
// every mutation go through a Proxy and forced re-renders nobody consumed.
let letters: Letter[] = [];
let grid = { columns: 0, rows: 0 };
let ctx: CanvasRenderingContext2D | null = null;
let cssWidth = 0;
let cssHeight = 0;
let animationId: number | null = null;
let lastGlitchTime = 0;
let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
// Indices currently mid colour transition - only these get redrawn per frame
// instead of re-filling every cell.
let transitioning: number[] = [];

const inView = ref(false);
const documentVisible = useDocumentVisibility();
const reducedMotion = usePreferredReducedMotion();

const shouldAnimate = computed(
  () => inView.value && documentVisible.value === 'visible' && reducedMotion.value !== 'reduce'
);

const fontSize = 16;
const charWidth = 10;
const charHeight = 20;

const lettersAndSymbols = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '!', '@', '#', '$', '&', '*', '(', ')', '-', '_', '+', '=', '/',
  '[', ']', '{', '}', ';', ':', '<', '>', ',',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

const getRandomChar = () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 0, b: 0 };
};

const getRandomColor = () => hexToRgb(props.glitchColors[Math.floor(Math.random() * props.glitchColors.length)]);

const calculateGrid = (width: number, height: number) => {
  const columns = Math.ceil(width / charWidth);
  const rows = Math.ceil(height / charHeight);
  return { columns, rows };
};

const initializeLetters = (columns: number, rows: number) => {
  grid = { columns, rows };
  const totalLetters = columns * rows;
  transitioning = [];
  letters = Array.from({ length: totalLetters }, () => {
    const color = getRandomColor();
    return {
      char: getRandomChar(),
      color: { ...color },
      target: getRandomColor(),
      progress: 1,
      inTransition: false
    };
  });
};

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;

  const dpr = window.devicePixelRatio || 1;

  const parentWidth = parent.parentElement?.offsetWidth || parent.offsetWidth || window.innerWidth;
  const parentHeight = parent.parentElement?.offsetHeight || parent.offsetHeight || window.innerHeight;

  const width = Math.max(parentWidth, 300);
  const height = Math.max(parentHeight, 300);

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Cache the CSS box: measuring it with getBoundingClientRect() on every
  // frame forced a synchronous layout read 60x/second.
  cssWidth = width;
  cssHeight = height;

  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const { columns, rows } = calculateGrid(width, height);
  initializeLetters(columns, rows);
  drawLetters();
};

const drawLetter = (index: number) => {
  if (!ctx) return;
  const letter = letters[index];
  if (!letter) return;
  const x = (index % grid.columns) * charWidth;
  const y = Math.floor(index / grid.columns) * charHeight;
  ctx.clearRect(x, y, charWidth, charHeight);
  ctx.fillStyle = `rgb(${letter.color.r}, ${letter.color.g}, ${letter.color.b})`;
  ctx.fillText(letter.char, x, y);
};

// Full repaint - only needed on init/resize. Steady-state updates redraw the
// handful of cells that actually changed.
const drawLetters = () => {
  if (!ctx || letters.length === 0) return;
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = 'top';

  for (let index = 0; index < letters.length; index++) {
    const letter = letters[index];
    const x = (index % grid.columns) * charWidth;
    const y = Math.floor(index / grid.columns) * charHeight;
    ctx.fillStyle = `rgb(${letter.color.r}, ${letter.color.g}, ${letter.color.b})`;
    ctx.fillText(letter.char, x, y);
  }
};

const updateLetters = (): number[] => {
  if (letters.length === 0) return [];

  // Reduced from 5% to 2% for better performance
  const updateCount = Math.max(1, Math.floor(letters.length * 0.02));
  const changed: number[] = [];

  for (let i = 0; i < updateCount; i++) {
    const index = Math.floor(Math.random() * letters.length);
    const letter = letters[index];
    if (!letter) continue;

    letter.char = getRandomChar();
    letter.target = getRandomColor();

    if (!props.smooth) {
      letter.color = { ...letter.target };
      letter.progress = 1;
      if (letter.inTransition) {
        letter.inTransition = false;
        transitioning = transitioning.filter((idx) => idx !== index);
      }
    } else if (!letter.inTransition) {
      letter.inTransition = true;
      letter.progress = 0;
      transitioning.push(index);
    } else {
      letter.progress = 0;
    }

    changed.push(index);
  }

  return changed;
};

const handleSmoothTransitions = () => {
  if (transitioning.length === 0) return;

  const stillTransitioning: number[] = [];

  for (let i = 0; i < transitioning.length; i++) {
    const index = transitioning[i];
    const letter = letters[index];
    if (!letter) continue;

    letter.progress = Math.min(1, letter.progress + 0.05);
    const f = letter.progress;
    letter.color.r = Math.round(letter.color.r + (letter.target.r - letter.color.r) * f);
    letter.color.g = Math.round(letter.color.g + (letter.target.g - letter.color.g) * f);
    letter.color.b = Math.round(letter.color.b + (letter.target.b - letter.color.b) * f);

    drawLetter(index);

    if (letter.progress < 1) {
      stillTransitioning.push(index);
    } else {
      letter.inTransition = false;
    }
  }

  transitioning = stillTransitioning;
};

const animate = () => {
  animationId = null;
  if (!ctx || !shouldAnimate.value) return; // paused - the watcher restarts it

  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = 'top';

  const now = Date.now();
  if (now - lastGlitchTime >= props.glitchSpeed) {
    lastGlitchTime = now;
    const changed = updateLetters();
    for (let i = 0; i < changed.length; i++) drawLetter(changed[i]);
  }

  if (props.smooth) {
    handleSmoothTransitions();
  }

  animationId = requestAnimationFrame(animate);
};

const startLoop = () => {
  if (animationId !== null) return;
  animationId = requestAnimationFrame(animate);
};

const stopLoop = () => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

const handleResize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 150);
};

useEventListener('resize', handleResize, { passive: true });

useIntersectionObserver(
  canvasRef,
  (entries) => {
    inView.value = entries[0]?.isIntersecting ?? false;
  },
  { rootMargin: '100px' }
);

watch(shouldAnimate, (value) => {
  if (value) startLoop();
  else stopLoop();
}, { immediate: true });

watch([() => props.glitchSpeed, () => props.smooth], () => {
  lastGlitchTime = 0;
});

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resizeCanvas();
  if (shouldAnimate.value) startLoop();
});

onUnmounted(() => {
  stopLoop();
  clearTimeout(resizeTimeout);
  letters = [];
  transitioning = [];
  ctx = null;
});
</script>

<style scoped>
div {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

:deep(canvas) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}
</style>
