<template>
  <div ref="containerRef" class="click-spark-container" @click="handleClick">
    <canvas ref="canvasRef" class="click-spark-canvas" />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, useTemplateRef } from 'vue';

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
const sparks = ref<Spark[]>([]);
const startTimeRef = ref<number | null>(null);
const animationId = ref<number | null>(null);

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

const handleClick = (e: MouseEvent) => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const now = performance.now();
  const newSparks: Spark[] = Array.from({ length: props.sparkCount }, (_, i) => ({
    x,
    y,
    angle: (2 * Math.PI * i) / props.sparkCount,
    startTime: now
  }));

  sparks.value.push(...newSparks);
};

const draw = (timestamp: number) => {
  if (!startTimeRef.value) {
    startTimeRef.value = timestamp;
  }

  const canvas = canvasRef.value;
  if (!canvas) {
    animationId.value = requestAnimationFrame(draw);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    animationId.value = requestAnimationFrame(draw);
    return;
  }

  const currentSparks = sparks.value;
  if (currentSparks.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animationId.value = requestAnimationFrame(draw);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const duration = props.duration;
  const radius = props.sparkRadius;
  const extraScale = props.extraScale;
  const sparkSize = props.sparkSize;
  const color = props.sparkColor;
  const easeFn = easeFunc.value;

  const remaining: Spark[] = [];
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  for (let i = 0; i < currentSparks.length; i++) {
    const spark = currentSparks[i];
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

  sparks.value = remaining;
  animationId.value = requestAnimationFrame(draw);
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

  animationId.value = requestAnimationFrame(draw);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
});

watch(
  [
    () => props.sparkColor,
    () => props.sparkSize,
    () => props.sparkRadius,
    () => props.sparkCount,
    () => props.duration,
    () => props.extraScale
  ],
  () => {
    // No need to restart rAF - values are read directly in draw loop
  }
);
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
