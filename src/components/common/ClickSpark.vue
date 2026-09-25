<template>
  <div ref="containerRef" class="click-spark-container" @click="handleClick">
    <canvas ref="canvasRef" class="click-spark-canvas" />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, useTemplateRef } from 'vue';

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

interface Props {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
}

const props = withDefaults(defineProps<Props>(), {
  sparkColor: '#fff',
  sparkSize: 10,
  sparkRadius: 15,
  sparkCount: 8,
  duration: 400,
  easing: 'ease-out',
  extraScale: 1.0
});

const containerRef = useTemplateRef<HTMLDivElement>('containerRef');
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef');

// Plain array: nothing renders from it and a deep ref would be re-proxied
// on every animation frame for no reason.
let sparks: Spark[] = [];
let animationId: number | null = null;

const easeFunc = computed(() => {
  return (t: number) => {
    switch (props.easing) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t * (2 - t);
    }
  };
});

const stopLoop = () => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

// The rAF loop only runs while sparks are actually on screen; it idles at
// zero cost between clicks instead of clearing the canvas 60x/second.
const startLoop = () => {
  if (animationId === null) {
    animationId = requestAnimationFrame(draw);
  }
};

const handleClick = (e: MouseEvent) => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const now = performance.now();
  for (let i = 0; i < props.sparkCount; i++) {
    sparks.push({
      x,
      y,
      angle: (2 * Math.PI * i) / props.sparkCount,
      startTime: now
    });
  }

  startLoop();
};

const draw = (timestamp: number) => {
  animationId = null;

  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (sparks.length === 0) return; // nothing left to animate - loop ends here

  const duration = props.duration;
  const radius = props.sparkRadius;
  const extraScale = props.extraScale;
  const sparkSize = props.sparkSize;
  const color = props.sparkColor;
  const easeFn = easeFunc.value;

  const remaining: Spark[] = [];
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  for (let i = 0; i < sparks.length; i++) {
    const spark = sparks[i];
    const elapsed = timestamp - spark.startTime;
    if (elapsed >= duration) continue;

    const progress = elapsed / duration;
    const eased = easeFn(progress);
    const distance = eased * radius * extraScale;
    const lineLength = sparkSize * (1 - eased);
    const cos = Math.cos(spark.angle);
    const sin = Math.sin(spark.angle);

    const x1 = spark.x + distance * cos;
    const y1 = spark.y + distance * sin;
    const x2 = spark.x + (distance + lineLength) * cos;
    const y2 = spark.y + (distance + lineLength) * sin;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    remaining.push(spark);
  }

  sparks = remaining;
  animationId = requestAnimationFrame(draw);
};

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const parent = canvas.parentElement;
  if (!parent) return;

  const { width, height } = parent.getBoundingClientRect();
  if (width === 0 || height === 0) return;
  const w = Math.round(width);
  const h = Math.round(height);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const parent = canvas.parentElement;
  if (!parent) return;

  resizeCanvas();
  resizeObserver = new ResizeObserver(() => resizeCanvas());
  resizeObserver.observe(parent);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  stopLoop();
  sparks = [];
});
</script>

<style scoped>
.click-spark-container {
  position: relative;
  width: 100%;
  min-height: 100%;
}

.click-spark-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}
</style>
