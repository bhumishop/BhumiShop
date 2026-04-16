<template>
  <div class="lang-switcher" ref="rootRef">
    <button type="button" class="lang-btn" @click="isOpen = !isOpen">
      <span class="flag">{{ currentLocale.flag }}</span>
      <span class="code">{{ currentLocale.code.toUpperCase() }}</span>
      <span class="arrow" :class="{ open: isOpen }">&#9662;</span>
    </button>

    <div v-if="isOpen" class="lang-dropdown">
      <button
        v-for="loc in supportedLocales"
        :key="loc.code"
        type="button"
        class="lang-option"
        :class="{ active: loc.code === currentLocale.code }"
        @click="pickLocale(loc.code)"
      >
        <span class="opt-flag">{{ loc.flag }}</span>
        <span class="opt-name">{{ loc.name }}</span>
        <span v-if="loc.code === currentLocale.code" class="opt-check">&#10003;</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supportedLocales, changeLocale } from '@/i18n'

const { locale } = useI18n()
const isOpen = ref(false)
const rootRef = ref(null)

const currentLocale = computed(() =>
  supportedLocales.find(l => l.code === locale.value) || supportedLocales[0]
)

async function pickLocale(code) {
  await changeLocale(code)
  isOpen.value = false
}

function outside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', outside))
onUnmounted(() => document.removeEventListener('click', outside))
</script>

<style scoped>
.lang-switcher {
  position: relative;
}

.lang-btn {
  display: inline-flex;
  align-items: center;
  gap: clamp(0.25rem, 0.6vw, 0.3125rem);
  padding: clamp(0.25rem, 0.6vw, 0.3125rem) clamp(0.4375rem, 1vw, 0.5625rem);
  border: 0.0625rem solid rgba(139, 92, 246, 0.18);
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  background: rgba(139, 92, 246, 0.07);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.lang-btn:hover {
  background: rgba(139, 92, 246, 0.14);
  border-color: rgba(139, 92, 246, 0.25);
  color: var(--text-primary);
}

.flag {
  font-size: 1.1rem;
  line-height: 1;
}

.code {
  letter-spacing: 0.03125rem;
}

.arrow {
  font-size: 0.6rem;
  opacity: 0.5;
  transition: transform 0.15s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 0.375rem);
  right: 0;
  min-width: clamp(12rem, 15vw, 12.5rem);
  background: var(--surface-0, #0a0a0b);
  border: 0.0625rem solid var(--border, #1c1c1f);
  border-radius: clamp(0.5rem, 1.2vw, 0.625rem);
  padding: clamp(0.25rem, 0.6vw, 0.3125rem);
  box-shadow: 0 clamp(0.5rem, 1.5vw, 0.75rem) clamp(1.5rem, 3vw, 2rem) rgba(0, 0, 0, 0.5);
  z-index: 10000;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.8vw, 0.5rem);
  width: 100%;
  padding: clamp(0.375rem, 0.8vw, 0.4375rem) clamp(0.4375rem, 1vw, 0.5625rem);
  border: none;
  background: none;
  border-radius: clamp(0.3125rem, 0.8vw, 0.4375rem);
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: background 0.12s ease;
  text-align: left;
}

.lang-option:hover {
  background: rgba(139, 92, 246, 0.1);
  color: var(--text-primary);
}

.lang-option.active {
  background: rgba(139, 92, 246, 0.15);
  color: var(--accent);
}

.opt-flag {
  font-size: 1.2rem;
  line-height: 1;
  flex-shrink: 0;
}

.opt-name {
  flex: 1;
}

.opt-check {
  color: var(--accent);
  flex-shrink: 0;
}
</style>
