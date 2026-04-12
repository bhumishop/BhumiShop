<template>
  <div class="language-switcher" ref="switcherRef">
    <button
      class="language-button"
      @click="isOpen = !isOpen"
      :aria-label="$t('nav.language')"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    >
      <span class="flag">{{ currentLocale.flag }}</span>
      <span class="code">{{ currentLocale.code.toUpperCase() }}</span>
      <svg
        class="chevron"
        :class="{ open: isOpen }"
        viewBox="0 0 12 8"
        width="12"
        height="8"
        fill="none"
      >
        <path
          d="M1 1.5L6 6.5L11 1.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="isOpen"
          class="language-dropdown"
          :style="dropdownPosition"
          role="listbox"
        >
          <button
            v-for="locale in supportedLocales"
            :key="locale.code"
            class="language-option"
            :class="{ active: locale.code === currentLocale.code }"
            @click="selectLocale(locale.code)"
            role="option"
            :aria-selected="locale.code === currentLocale.code"
          >
            <span class="flag">{{ locale.flag }}</span>
            <span class="name">{{ locale.name }}</span>
            <svg v-if="locale.code === currentLocale.code" class="check" viewBox="0 0 16 16" width="16" height="16" fill="none">
              <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supportedLocales, changeLocale } from '@/i18n'

const { locale } = useI18n()
const isOpen = ref(false)
const switcherRef = ref(null)
const dropdownPosition = ref({})

const currentLocale = computed(() => {
  return supportedLocales.find(l => l.code === locale.value) || supportedLocales[0]
})

function updateDropdownPosition() {
  if (!switcherRef.value) return
  const rect = switcherRef.value.getBoundingClientRect()
  dropdownPosition.value = {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    zIndex: 9999
  }
}

async function selectLocale(code) {
  await changeLocale(code)
  isOpen.value = false
}

function handleClickOutside(event) {
  if (switcherRef.value && !switcherRef.value.contains(event.target)) {
    // Check if click is outside the dropdown (teleported to body)
    const dropdown = document.querySelector('.language-dropdown')
    if (dropdown && !dropdown.contains(event.target)) {
      isOpen.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updateDropdownPosition)
  window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition)
  window.removeEventListener('resize', updateDropdownPosition)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #1e293b);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.language-button:hover {
  border-color: var(--primary, #6366f1);
  background: var(--bg-secondary, #f8fafc);
}

.flag {
  font-size: 1.125rem;
  line-height: 1;
}

.code {
  font-weight: 600;
  text-transform: uppercase;
}

.chevron {
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.language-dropdown {
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-height: 320px;
  overflow-y: auto;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-primary, #1e293b);
  transition: background 0.15s;
}

.language-option:hover {
  background: var(--bg-secondary, #f1f5f9);
}

.language-option.active {
  background: var(--primary-light, #eef2ff);
  color: var(--primary, #6366f1);
  font-weight: 500;
}

.language-option .flag {
  font-size: 1.25rem;
}

.language-option .name {
  flex: 1;
  text-align: left;
}

.language-option .check {
  color: var(--primary, #6366f1);
}

/* Dropdown transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
