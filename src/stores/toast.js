import { defineStore } from 'pinia'
import { ref } from 'vue'

let toastId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function addToast({ type = 'info', message = '', duration = 4000 }) {
    const id = ++toastId
    const toast = { id, type, message, duration, leaving: false }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value[index].leaving = true
      setTimeout(() => {
        const idx = toasts.value.findIndex(t => t.id === id)
        if (idx !== -1) toasts.value.splice(idx, 1)
      }, 300)
    }
  }

  function success(message, duration) {
    return addToast({ type: 'success', message, duration: duration || 4000 })
  }

  function error(message, duration) {
    return addToast({ type: 'error', message, duration: duration || 6000 })
  }

  function info(message, duration) {
    return addToast({ type: 'info', message, duration: duration || 4000 })
  }

  function warning(message, duration) {
    return addToast({ type: 'warning', message, duration: duration || 5000 })
  }

  function clear() {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    clear
  }
})
