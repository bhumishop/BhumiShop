import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  function init() {
    const saved = localStorage.getItem('bhumi-theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // Default to dark (AMOLED)
      isDark.value = true
    }
    applyTheme()
  }

  function toggle() {
    isDark.value = !isDark.value
    applyTheme()
    localStorage.setItem('bhumi-theme', isDark.value ? 'dark' : 'light')
  }

  function applyTheme() {
    // Add transition class for smooth theme switching
    document.documentElement.classList.add('theme-transitioning')

    if (isDark.value) {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 400)
  }

  return { isDark, init, toggle }
})
