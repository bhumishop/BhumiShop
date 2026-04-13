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
  gap: 5px;
  padding: 5px 9px;
  border: 1px solid rgba(139, 92, 246, 0.18);
  border-radius: 8px;
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
  letter-spacing: 0.5px;
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
  top: calc(100% + 6px);
  right: 0;
  min-width: 200px;
  background: var(--surface-0, #0a0a0b);
  border: 1px solid var(--border, #1c1c1f);
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  z-index: 10000;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 9px;
  border: none;
  background: none;
  border-radius: 7px;
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
