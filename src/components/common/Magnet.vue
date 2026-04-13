<template>
  <div
    ref="magnetRef"
    :class="wrapperClassName"
    :style="{ position: 'relative', display: 'inline-block' }"
    v-bind="$attrs"
  >
    <div
      :class="innerClassName"
      :style="{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: transitionStyle,
        willChange: 'transform'
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, useTemplateRef } from 'vue';

interface Props {
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  wrapperClassName?: string;
  innerClassName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  padding: 100,
  disabled: false,
  magnetStrength: 2,
  activeTransition: 'transform 0.3s ease-out',
  inactiveTransition: 'transform 0.5s ease-in-out',
  wrapperClassName: '',
  innerClassName: ''
});

defineOptions({
  inheritAttrs: false
});

const magnetRef = useTemplateRef<HTMLDivElement>('magnetRef');
const isActive = ref(false);
const position = ref({ x: 0, y: 0 });

const transitionStyle = computed(() => (isActive.value ? props.activeTransition : props.inactiveTransition));

const handleMouseMove = (e: MouseEvent) => {
  if (!magnetRef.value || props.disabled) return;

  const { left, top, width, height } = magnetRef.value.getBoundingClientRect();
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  const distX = Math.abs(centerX - e.clientX);
  const distY = Math.abs(centerY - e.clientY);

  const paddingPlusHalf = props.padding;
  const halfW = width / 2;
  const halfH = height / 2;

  if (distX < halfW + paddingPlusHalf && distY < halfH + paddingPlusHalf) {
    isActive.value = true;
    const invStrength = 1 / props.magnetStrength;
    position.value = { x: (e.clientX - centerX) * invStrength, y: (e.clientY - centerY) * invStrength };
  } else if (isActive.value) {
    isActive.value = false;
    position.value = { x: 0, y: 0 };
  }
};

let rafId = 0;
let pendingEvent: MouseEvent | null = null;

const throttledMouseMove = (e: MouseEvent) => {
  pendingEvent = e;
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    if (pendingEvent) {
      handleMouseMove(pendingEvent);
      pendingEvent = null;
    }
  });
};

onMounted(() => {
  window.addEventListener('mousemove', throttledMouseMove, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('mousemove', throttledMouseMove);
  if (rafId) cancelAnimationFrame(rafId);
});

watch(
  () => props.disabled,
  newDisabled => {
    if (newDisabled) {
      position.value = { x: 0, y: 0 };
      isActive.value = false;
    }
  }
);
</script>
