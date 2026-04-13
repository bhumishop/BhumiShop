<template>
  <div v-if="colorGroups.length > 1" class="color-swatches">
    <p class="color-swatches__label">{{ $t('productVariants.color') || 'Cor' }}</p>
    <div class="color-swatches__grid">
      <button
        v-for="(group, index) in colorGroups"
        :key="index"
        :class="['color-swatches__swatch', { 'color-swatches__swatch--active': modelValue === index }]"
        @click="$emit('update:modelValue', modelValue === index ? null : index)"
        :title="group.colorName"
      >
        <span
          class="color-swatches__circle"
          :style="{ backgroundColor: group.colorHex }"
        ></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Array of color swatch image URLs
  colorSwatches: { type: Array, default: () => [] },
  // Currently selected color index
  modelValue: { type: Number, default: null }
})

defineEmits(['update:modelValue'])

// Comprehensive color mapping for tshirt detection
const colorMapping = {
  // Portuguese
  'preto': { hex: '#1A1A1A', name: 'Preto' },
  'black': { hex: '#1A1A1A', name: 'Preto' },
  'azul': { hex: '#2563EB', name: 'Azul' },
  'blue': { hex: '#2563EB', name: 'Azul' },
  'amarelo': { hex: '#FBBF24', name: 'Amarelo' },
  'yellow': { hex: '#FBBF24', name: 'Amarelo' },
  'vermelho': { hex: '#DC2626', name: 'Vermelho' },
  'red': { hex: '#DC2626', name: 'Vermelho' },
  'verde': { hex: '#059669', name: 'Verde' },
  'green': { hex: '#059669', name: 'Verde' },
  'branco': { hex: '#FAFAFA', name: 'Branco' },
  'white': { hex: '#FAFAFA', name: 'Branco' },
  'rosa': { hex: '#EC4899', name: 'Rosa' },
  'pink': { hex: '#EC4899', name: 'Rosa' },
  'roxo': { hex: '#7C3AED', name: 'Roxo' },
  'purple': { hex: '#7C3AED', name: 'Roxo' },
  'violeta': { hex: '#7C3AED', name: 'Roxo' },
  'laranja': { hex: '#F97316', name: 'Laranja' },
  'orange': { hex: '#F97316', name: 'Laranja' },
  'cinza': { hex: '#6B7280', name: 'Cinza' },
  'gray': { hex: '#6B7280', name: 'Cinza' },
  'grey': { hex: '#6B7280', name: 'Cinza' },
  'marrom': { hex: '#92400E', name: 'Marrom' },
  'brown': { hex: '#92400E', name: 'Marrom' },
  'bege': { hex: '#F5F5DC', name: 'Bege' },
  'beige': { hex: '#F5F5DC', name: 'Bege' },
  'cream': { hex: '#FEF3C7', name: 'Creme' },
  'creme': { hex: '#FEF3C7', name: 'Creme' },
  ' Bordô': { hex: '#800020', name: 'Bordô' },
  'burgundy': { hex: '#800020', name: 'Bordô' },
  'marinho': { hex: '#1E3A8A', name: 'Azul Marinho' },
  'navy': { hex: '#1E3A8A', name: 'Azul Marinho' },
  'turquesa': { hex: '#06B6D4', name: 'Turquesa' },
  'turquoise': { hex: '#06B6D4', name: 'Turquesa' },
  'salmão': { hex: '#FB7185', name: 'Salmão' },
  'salmon': { hex: '#FB7185', name: 'Salmão' },
  'vinho': { hex: '#722F37', name: 'Vinho' },
  'wine': { hex: '#722F37', name: 'Vinho' },
  'mostarda': { hex: '#D97706', name: 'Mostarda' },
  'mustard': { hex: '#D97706', name: 'Mostarda' },
  'off-white': { hex: '#F5F5F0', name: 'Off-White' },
  'offwhite': { hex: '#F5F5F0', name: 'Off-White' },
  'natural': { hex: '#E8E4D9', name: 'Natural' },
  'areia': { hex: '#D4C5A9', name: 'Areia' },
  'sand': { hex: '#D4C5A9', name: 'Areia' }
}

// Fallback colors for when detection fails
const fallbackColors = [
  { hex: '#1A1A1A', name: 'Cor 1' },
  { hex: '#2563EB', name: 'Cor 2' },
  { hex: '#DC2626', name: 'Cor 3' },
  { hex: '#059669', name: 'Cor 4' },
  { hex: '#D97706', name: 'Cor 5' },
  { hex: '#7C3AED', name: 'Cor 6' },
  { hex: '#EC4899', name: 'Cor 7' },
  { hex: '#6B7280', name: 'Cor 8' }
]

/**
 * Extract color information from swatch image URL
 */
function detectColorFromUrl(url) {
  if (!url) return null

  const lowerUrl = url.toLowerCase()

  // Try to match against our comprehensive color mapping
  for (const [keyword, colorInfo] of Object.entries(colorMapping)) {
    if (lowerUrl.includes(keyword.toLowerCase())) {
      return { ...colorInfo, detected: true }
    }
  }

  return null
}

// Extract color information from swatch images
const colorGroups = computed(() => {
  if (!props.colorSwatches || props.colorSwatches.length === 0) return []

  return props.colorSwatches.map((swatch, index) => {
    // Try to detect color from URL
    const detectedColor = detectColorFromUrl(swatch)

    if (detectedColor) {
      return {
        colorName: detectedColor.name,
        colorHex: detectedColor.hex,
        swatchUrl: swatch,
        detected: true
      }
    }

    // Fallback to generic color
    const fallback = fallbackColors[index % fallbackColors.length]
    return {
      colorName: fallback.name,
      colorHex: fallback.hex,
      swatchUrl: swatch,
      detected: false
    }
  })
})
</script>

<style scoped>
.color-swatches {
  margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
}

.color-swatches__label {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: clamp(0.5rem, 1vh, 0.625rem);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.color-swatches__grid {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  align-items: center;
}

.color-swatches__swatch {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(2.25rem, 4.5vw, 2.75rem);
  height: clamp(2.25rem, 4.5vw, 2.75rem);
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--surface-0);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 3px;
}

.color-swatches__swatch:hover {
  border-color: var(--accent);
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-swatches__swatch:hover::after {
  content: attr(title);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 0.375rem 0.625rem;
  background: var(--text-primary);
  color: var(--surface-0);
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-swatches__swatch--active {
  border-color: var(--accent);
  border-width: 3px;
  box-shadow: 0 0 0 2px var(--surface-0), 0 0 0 4px var(--accent), 0 4px 12px rgba(139, 92, 246, 0.3);
  transform: scale(1.1);
}

.color-swatches__swatch--active:hover {
  transform: scale(1.2);
}

.color-swatches__circle {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all var(--transition-fast);
}

/* Better border for light colors */
.color-swatches__circle[style*="#FAFAFA"],
.color-swatches__circle[style*="#fafafa"],
.color-swatches__circle[style*="#F5F5DC"],
.color-swatches__circle[style*="#f5f5dc"],
.color-swatches__circle[style*="#FEF3C7"],
.color-swatches__circle[style*="#fef3c7"],
.color-swatches__circle[style*="#F5F5F0"],
.color-swatches__circle[style*="#f5f5f0"],
.color-swatches__circle[style*="#E8E4D9"],
.color-swatches__circle[style*="#e8e4d9"],
.color-swatches__circle[style*="#D4C5A9"],
.color-swatches__circle[style*="#d4c5a9"],
.color-swatches__circle[style*="#F5F5F0"],
.color-swatches__circle[style*="#f5f5f0"] {
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.color-swatches__swatch--active .color-swatches__circle {
  border-color: transparent;
}
</style>
