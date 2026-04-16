<template>
  <button
    class="theme-switcher"
    :aria-label="isDark ? t('theme.lightMode') : t('theme.darkMode')"
    @click="themeStore.toggle()"
  >
    <transition name="theme-icon" mode="out-in">
      <!-- Sun icon for light mode -->
      <svg
        v-if="isDark"
        key="sun"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <!-- Moon icon for dark mode -->
      <svg
        v-else
        key="moon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </transition>
  </button>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '../../stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()
const isDark = themeStore.isDark

onMounted(() => {
  themeStore.init()
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(1.75rem, 3.5vw, 2rem);
  height: clamp(1.75rem, 3.5vw, 2rem);
  border-radius: clamp(0.4375rem, 1vw, 0.5625rem);
  color: var(--text-secondary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  overflow: hidden;
}

.theme-switcher:hover {
  color: var(--accent);
  background: var(--accent-light);
  transform: translateY(clamp(-0.0625rem, -0.15vw, -0.125rem));
}

.theme-switcher:active {
  transform: translateY(0) scale(0.96);
}

/* Icon transition */
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

@media (prefers-reduced-motion: reduce) {
  .theme-icon-enter-active,
  .theme-icon-leave-active {
    transition: none;
  }
}
</style>
