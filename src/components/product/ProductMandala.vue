<template>
  <div v-if="relatedProducts.length > 0" class="flower-related" ref="flowerRoot">
    <!-- Outer glow ring -->
    <div class="flower-related__glow-ring"></div>

    <!-- Decorative background petals - subtle layer -->
    <div class="flower-related__bg-petals">
      <div
        v-for="i in 16"
        :key="'bg-' + i"
        class="flower-related__bg-petal"
        :style="`--petal-idx: ${i}`"
      ></div>
    </div>

    <!-- Spinning dust particles -->
    <div class="flower-related__particles">
      <div
        v-for="i in 6"
        :key="'particle-' + i"
        class="flower-related__particle"
        :style="`--particle-idx: ${i}`"
      ></div>
    </div>

    <!-- Inner ring decoration -->
    <div class="flower-related__inner-ring"></div>

    <!-- Center: current product -->
    <div class="flower-related__center">
      <div class="flower-related__center-pulse"></div>
      <div class="flower-related__center-ring"></div>
      <div class="flower-related__center-inner">
        <img
          v-if="currentProductImage"
          :src="currentProductImage"
          :alt="productName"
          class="flower-related__center-img"
          loading="lazy"
        />
        <span v-else class="flower-related__center-placeholder">{{ productName?.charAt(0) || '?' }}</span>
      </div>
    </div>

    <!-- Petals: related products in layered flower arrangement -->
    <div
      v-for="(prod, index) in displayedProducts"
      :key="prod.id"
      class="flower-related__petal"
      :style="getPetalStyle(index, displayedProducts.length)"
      :class="{ 'flower-related__petal--outer': index >= 6 }"
    >
      <router-link
        :to="`/produtos/${prod.id}`"
        class="flower-related__petal-link"
        :title="prod.name"
      >
        <div class="flower-related__petal-shape">
          <!-- Petal shape overlay for depth -->
          <div class="flower-related__petal-highlight"></div>
          <img
            v-if="prod.image && (prod.image.startsWith('data:') || prod.image.startsWith('http') || prod.image.startsWith('/'))"
            :src="prod.image"
            :alt="prod.name"
            class="flower-related__petal-img"
            loading="lazy"
          />
          <span v-else class="flower-related__petal-placeholder">{{ prod.name?.charAt(0) || '?' }}</span>
          <div class="flower-related__petal-overlay"></div>
        </div>
        <!-- Tooltip on hover -->
        <div class="flower-related__petal-tooltip">
          <span class="flower-related__petal-name">{{ prod.name }}</span>
          <span class="flower-related__petal-price">R$ {{ formatPrice(prod.price) }}</span>
        </div>
      </router-link>
    </div>

    <!-- Decorative stem line -->
    <div class="flower-related__stem"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  currentProduct: { type: Object, required: true },
  relatedProducts: { type: Array, default: () => [] }
})

const flowerRoot = ref(null)
const isBloomed = ref(false)

const displayedProducts = computed(() => props.relatedProducts.slice(0, 8))

const currentProductImage = computed(() => {
  const img = props.currentProduct?.image
  if (img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/'))) {
    return img
  }
  return null
})

const productName = computed(() => props.currentProduct?.name || '')

// Calculate petal positions with 2-layer flower arrangement
function getPetalStyle(index, total) {
  // Inner layer: 6 petals in hexagonal arrangement
  // Outer layer: remaining petals (if any)
  const isOuterLayer = index >= 6
  const layerIndex = isOuterLayer ? index - 6 : index
  const layerTotal = isOuterLayer ? Math.max(total - 6, 0) : Math.min(total, 6)

  // Different radius for each layer
  const baseRadius = isOuterLayer ? 1.35 : 1
  const angleOffset = isOuterLayer ? (360 / layerTotal) / 2 : 0 // Offset outer layer by half
  const angle = (360 / layerTotal) * layerIndex + angleOffset
  const radian = (angle * Math.PI) / 180

  // Add slight random-looking offset based on index for organic feel
  const organicOffsetX = Math.sin(index * 2.5) * 4
  const organicOffsetY = Math.cos(index * 3.2) * 4

  return {
    '--flower-angle': `${angle}deg`,
    '--flower-x': `${Math.cos(radian) * baseRadius}px`,
    '--flower-y': `${Math.sin(radian) * baseRadius}px`,
    '--flower-index': index,
    '--flower-layer': isOuterLayer ? '1' : '0',
    '--organic-x': `${organicOffsetX}px`,
    '--organic-y': `${organicOffsetY}px`,
    '--bloom-delay': `${index * 0.08}s`
  }
}

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

// Trigger bloom animation on mount
onMounted(() => {
  setTimeout(() => {
    isBloomed.value = true
    if (flowerRoot.value) {
      flowerRoot.value.classList.add('flower-related--bloomed')
    }
  }, 100)
})
</script>

<style scoped>
.flower-related {
  --flower-radius: clamp(5rem, 12vw, 6.5625rem);
  --flower-radius-outer: clamp(6.5rem, 16vw, 8.875rem);
  --flower-petal-size: clamp(2.25rem, 5.5vw, 3rem);
  --flower-petal-size-outer: clamp(2rem, 4.8vw, 2.625rem);
  --flower-center-size: clamp(3rem, 7vw, 3.875rem);
  --petal-bloom-scale: 0;

  position: relative;
  width: calc(var(--flower-radius-outer) * 2 + var(--flower-petal-size-outer) + 1.25rem);
  height: calc(var(--flower-radius-outer) * 2 + var(--flower-petal-size-outer) + 2.5rem);
  margin: 2rem auto;
  opacity: 0;
  animation: flower-fade-in 0.6s ease forwards;
}

@keyframes flower-fade-in {
  to { opacity: 1; }
}

/* ========== OUTER GLOW RING ========== */
.flower-related__glow-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(var(--flower-radius-outer) * 1.8);
  height: calc(var(--flower-radius-outer) * 1.8);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    var(--accent-subtle) 0%,
    transparent 70%
  );
  filter: blur(1.25rem);
  opacity: 0.4;
  animation: glow-ring-pulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glow-ring-pulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.05); }
}

/* ========== BACKGROUND DECORATIVE PETALS ========== */
.flower-related__bg-petals {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.flower-related__bg-petal {
  position: absolute;
  width: clamp(0.5rem, 1.2vw, 0.75rem);
  height: clamp(1rem, 2.5vw, 1.5rem);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: linear-gradient(
    to bottom,
    var(--accent-subtle) 0%,
    rgba(139, 92, 246, 0.02) 100%
  );
  border: 0.0625rem solid rgba(139, 92, 246, 0.04);
  top: 50%;
  left: 50%;
  margin-left: clamp(-0.375rem, -0.8vw, -0.5rem);
  margin-top: clamp(-0.75rem, -1.5vw, -1rem);
  transform:
    rotate(calc(22.5deg * var(--petal-idx)))
    translateY(calc(-1 * var(--flower-radius) - 0.5rem));
  opacity: 0.25;
  animation: bg-petal-sway 10s ease-in-out infinite;
  animation-delay: calc(var(--petal-idx) * 0.4s);
}

@keyframes bg-petal-sway {
  0%, 100% {
    transform: rotate(calc(22.5deg * var(--petal-idx))) translateY(calc(-1 * var(--flower-radius) - 0.5rem)) scaleY(1) rotate(0deg);
  }
  25% {
    transform: rotate(calc(22.5deg * var(--petal-idx) + 2deg)) translateY(calc(-1 * var(--flower-radius) - 0.625rem)) scaleY(1.08) rotate(1deg);
  }
  75% {
    transform: rotate(calc(22.5deg * var(--petal-idx) - 2deg)) translateY(calc(-1 * var(--flower-radius) - 0.375rem)) scaleY(0.95) rotate(-1deg);
  }
}

/* ========== PARTICLES ========== */
.flower-related__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.flower-related__particle {
  position: absolute;
  width: 0.1875rem;
  height: 0.1875rem;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.3;
  top: 50%;
  left: 50%;
  animation: particle-orbit 12s linear infinite;
  animation-delay: calc(var(--particle-idx) * -2s);
}

@keyframes particle-orbit {
  from {
    transform: rotate(calc(60deg * var(--particle-idx))) translateX(var(--flower-radius)) scale(1);
    opacity: 0;
  }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  to {
    transform: rotate(calc(60deg * var(--particle-idx) + 360deg)) translateX(var(--flower-radius)) scale(0.5);
    opacity: 0;
  }
}

/* ========== INNER RING ========== */
.flower-related__inner-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(var(--flower-radius) * 1.6);
  height: calc(var(--flower-radius) * 1.6);
  border-radius: 50%;
  border: 0.0625rem dashed rgba(139, 92, 246, 0.1);
  animation: inner-ring-rotate 60s linear infinite;
}

@keyframes inner-ring-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* ========== CENTER ========== */
.flower-related__center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.flower-related__center-pulse {
  position: absolute;
  inset: clamp(-0.75rem, -2vw, -0.9375rem);
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-subtle) 0%, transparent 70%);
  animation: center-pulse 3s ease-out infinite;
}

@keyframes center-pulse {
  0% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0.2; }
  100% { transform: scale(0.9); opacity: 0.5; }
}

.flower-related__center-ring {
  position: absolute;
  inset: -0.375rem;
  border-radius: 50%;
  border: 0.125rem solid var(--accent);
  box-shadow: 0 0 0.75rem var(--accent-subtle);
  animation: center-ring-pulse 3s ease-in-out infinite;
}

@keyframes center-ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.06); opacity: 0.5; }
}

.flower-related__center-inner {
  width: var(--flower-center-size);
  height: var(--flower-center-size);
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-2);
  border: 0.125rem solid var(--accent);
  box-shadow:
    0 0 1.25rem var(--accent-subtle),
    0 0.375rem 1rem rgba(0, 0, 0, 0.4),
    inset 0 0.125rem 0.5rem rgba(255, 255, 255, 0.05);
  transition: transform var(--transition-smooth), box-shadow var(--transition-smooth);
  position: relative;
}

.flower-related__center-inner::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 255, 255, 0.12) 0%,
    transparent 60%
  );
  pointer-events: none;
}

.flower-related__center-inner:hover {
  transform: scale(1.08);
  box-shadow:
    0 0 1.75rem var(--accent-subtle),
    0 0.5rem 1.25rem rgba(0, 0, 0, 0.5),
    inset 0 0.125rem 0.5rem rgba(255, 255, 255, 0.08);
}

.flower-related__center-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.flower-related__center-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-muted);
  background: linear-gradient(135deg, var(--surface-2), var(--surface-3));
}

/* ========== PETALS ========== */
.flower-related__petal {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--flower-petal-size);
  height: var(--flower-petal-size);
  margin-left: calc(var(--flower-petal-size) / -2);
  margin-top: calc(var(--flower-petal-size) / -2);
  z-index: 5;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0) rotate(-180deg);
  animation: petal-bloom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(0.2s + var(--bloom-delay));
}

@keyframes petal-bloom {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0) rotate(-180deg);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translate(
      calc(var(--flower-x) * var(--flower-radius) + var(--organic-x)),
      calc(var(--flower-y) * var(--flower-radius) + var(--organic-y))
    ) scale(1) rotate(0deg);
  }
}

.flower-related__petal--outer {
  width: var(--flower-petal-size-outer);
  height: var(--flower-petal-size-outer);
  margin-left: calc(var(--flower-petal-size-outer) / -2);
  margin-top: calc(var(--flower-petal-size-outer) / -2);
  z-index: 4;
}

.flower-related__petal--outer .flower-related__petal-shape {
  width: var(--flower-petal-size-outer);
  height: var(--flower-petal-size-outer);
}

/* Continuous floating animation after bloom */
.flower-related--bloomed .flower-related__petal {
  animation: petal-float 6s ease-in-out infinite;
  animation-delay: calc(var(--bloom-delay));
}

@keyframes petal-float {
  0%, 100% {
    transform: translate(
      calc(var(--flower-x) * var(--flower-radius) + var(--organic-x)),
      calc(var(--flower-y) * var(--flower-radius) + var(--organic-y))
    ) scale(1);
  }
  33% {
    transform: translate(
      calc(var(--flower-x) * var(--flower-radius) + var(--organic-x)),
      calc(var(--flower-y) * var(--flower-radius) + var(--organic-y) - 0.25rem)
    ) scale(1.03) rotate(1deg);
  }
  66% {
    transform: translate(
      calc(var(--flower-x) * var(--flower-radius) + var(--organic-x) + 0.125rem),
      calc(var(--flower-y) * var(--flower-radius) + var(--organic-y) + 0.1875rem)
    ) scale(0.98) rotate(-1deg);
  }
}

.flower-related--bloomed .flower-related__petal--outer {
  animation: petal-float-outer 7s ease-in-out infinite;
  animation-delay: calc(var(--bloom-delay));
}

@keyframes petal-float-outer {
  0%, 100% {
    transform: translate(
      calc(var(--flower-x) * var(--flower-radius-outer) + var(--organic-x)),
      calc(var(--flower-y) * var(--flower-radius-outer) + var(--organic-y))
    ) scale(1);
  }
  50% {
    transform: translate(
      calc(var(--flower-x) * var(--flower-radius-outer) + var(--organic-x) - 0.1875rem),
      calc(var(--flower-y) * var(--flower-radius-outer) + var(--organic-y) - 0.3125rem)
    ) scale(1.04) rotate(-1.5deg);
  }
}

.flower-related__petal-link {
  display: block;
  text-decoration: none;
  cursor: pointer;
  position: relative;
}

/* Organic petal shape - flower petal, not circle */
.flower-related__petal-shape {
  position: relative;
  width: var(--flower-petal-size);
  height: calc(var(--flower-petal-size) * 1.15);
  border-radius: 50% 50% 50% 50% / 65% 65% 35% 35%;
  overflow: hidden;
  background: var(--surface-2);
  border: 0.125rem solid var(--border);
  box-shadow:
    0 0.1875rem 0.625rem rgba(0, 0, 0, 0.3),
    0 0 0 0.0625rem rgba(139, 92, 246, 0.05);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-smooth),
    filter var(--transition-fast);
  transform: rotate(var(--flower-angle));
}

/* 3D highlight on petal */
.flower-related__petal-highlight {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    ellipse at 30% 25%,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 55%
  );
  pointer-events: none;
  z-index: 2;
}

.flower-related__petal-shape::before {
  content: '';
  position: absolute;
  inset: -0.125rem;
  border-radius: inherit;
  background: conic-gradient(
    from 0deg,
    transparent,
    var(--accent-subtle),
    transparent,
    var(--accent-subtle),
    transparent
  );
  opacity: 0;
  transition: opacity var(--transition-smooth);
  z-index: -1;
  animation: highlight-rotate 8s linear infinite;
}

@keyframes highlight-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.flower-related__petal:hover .flower-related__petal-shape {
  border-color: var(--accent);
  box-shadow:
    0 0.375rem 1.25rem var(--accent-subtle),
    0 0.1875rem 0.625rem rgba(0, 0, 0, 0.4),
    0 0 0 0.1875rem rgba(139, 92, 246, 0.1);
  transform: rotate(var(--flower-angle)) scale(1.22);
  z-index: 20;
  filter: brightness(1.1);
}

.flower-related__petal:hover .flower-related__petal-shape::before {
  opacity: 0.6;
}

.flower-related__petal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-smooth), filter var(--transition-fast);
}

.flower-related__petal:hover .flower-related__petal-img {
  transform: scale(1.08);
}

.flower-related__petal-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-muted);
  background: linear-gradient(135deg, var(--surface-2), var(--surface-3));
}

/* Hover overlay */
.flower-related__petal-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.2) 0%,
    transparent 50%,
    rgba(34, 197, 94, 0.1) 100%
  );
  opacity: 0;
  transition: opacity var(--transition-fast);
  pointer-events: none;
  z-index: 3;
}

.flower-related__petal:hover .flower-related__petal-overlay {
  opacity: 1;
}

/* Tooltip */
.flower-related__petal-tooltip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%) translateY(0.25rem);
  background: var(--surface-2);
  border: 0.0625rem solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.375rem 0.625rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.flower-related__petal-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 0.3125rem solid transparent;
  border-top-color: var(--surface-2);
}

.flower-related__petal:hover .flower-related__petal-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.flower-related__petal-name {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-primary);
  max-width: 7.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.flower-related__petal-price {
  display: block;
  font-size: 0.6rem;
  font-weight: 500;
  color: var(--green-adorn);
  font-family: var(--font-mono);
  margin-top: 0.125rem;
}

/* ========== STEM ========== */
.flower-related__stem {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0.125rem;
  height: 1.25rem;
  background: linear-gradient(to bottom, var(--accent-subtle), transparent);
  border-radius: 0.0625rem;
  opacity: 0.4;
}

/* ========== SECTION TITLE ========== */
.flower-related::before {
  content: 'Produtos Relacionados';
  position: absolute;
  bottom: -2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

/* ========== MOBILE ========== */
@media (max-width: 768px) {
  .flower-related {
    --flower-radius: clamp(4.5rem, 11vw, 5.3125rem);
    --flower-radius-outer: clamp(5.5rem, 13.5vw, 7.1875rem);
    --flower-petal-size: clamp(2rem, 5vw, 2.625rem);
    --flower-petal-size-outer: clamp(1.75rem, 4.2vw, 2.25rem);
    --flower-center-size: clamp(2.5rem, 6vw, 3.25rem);
    margin: 1.5rem auto;
  }

  .flower-related__petal-tooltip {
    display: none;
  }

  .flower-related__bg-petal {
    width: clamp(0.5rem, 1.1vw, 0.625rem);
    height: clamp(0.875rem, 2.2vw, 1.25rem);
  }

  .flower-related::before {
    font-size: 0.65rem;
    bottom: -1.75rem;
  }
}

@media (max-width: 480px) {
  .flower-related {
    --flower-radius: clamp(3.75rem, 10vw, 4.5rem);
    --flower-radius-outer: clamp(4.75rem, 12vw, 6.125rem);
    --flower-petal-size: clamp(1.75rem, 4.5vw, 2.375rem);
    --flower-petal-size-outer: clamp(1.5rem, 3.8vw, 2rem);
    --flower-center-size: clamp(2.25rem, 5.5vw, 2.875rem);
    margin: 1rem auto;
  }

  .flower-related__particle {
    display: none;
  }

  .flower-related__inner-ring {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .flower-related__bg-petal,
  .flower-related__center-ring,
  .flower-related__center-pulse,
  .flower-related__particle,
  .flower-related__inner-ring,
  .flower-related__glow-ring {
    animation: none;
  }

  .flower-related__petal {
    animation: petal-bloom 0.4s ease forwards;
  }

  .flower-related--bloomed .flower-related__petal {
    animation: none;
  }
}
</style>
