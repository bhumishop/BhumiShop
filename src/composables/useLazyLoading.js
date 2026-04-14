import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Composable for lazy loading elements using IntersectionObserver.
 * Renders a limited number of items initially, then loads more as user scrolls.
 *
 * @param {object} options
 * @param {number} options.initialCount - Number of items to render initially (default: 20)
 * @param {number} options.increment - Number of items to load on each intersection (default: 20)
 * @param {string} options.rootSelector - CSS selector for the scrollable container (default: null for viewport)
 * @param {number} options.rootMargin - Margin around the root (default: '200px')
 *
 * @returns {object} { displayedCount, loadMore, reset, observerRef }
 */
export function useLazyLoading(options = {}) {
  const {
    initialCount = 20,
    increment = 20,
    rootSelector = null,
    rootMargin = '200px'
  } = options

  const displayedCount = ref(initialCount)
  const observerRef = ref(null)
  let observer = null

  function loadMore() {
    displayedCount.value += increment
  }

  function reset() {
    displayedCount.value = initialCount
  }

  function setupObserver(element) {
    if (!element || observer) return

    const root = rootSelector ? document.querySelector(rootSelector) : null

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore()
          }
        })
      },
      {
        root,
        rootMargin,
        threshold: 0.1
      }
    )

    observer.observe(element)
  }

  function cleanupObserver() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  function refreshObserver() {
    cleanupObserver()
    if (observerRef.value) {
      nextTick(() => setupObserver(observerRef.value))
    }
  }

  onMounted(() => {
    if (observerRef.value) {
      setupObserver(observerRef.value)
    }
  })

  onUnmounted(() => {
    cleanupObserver()
  })

  return {
    displayedCount,
    loadMore,
    reset,
    observerRef,
    refreshObserver
  }
}

export default useLazyLoading
