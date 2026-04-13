/**
 * High-performance GSAP animation system for Vue 3
 *
 * Best practices implemented:
 * - gsap.context() for automatic animation tracking and cleanup
 * - force3D: true for GPU-accelerated transforms
 * - ScrollTrigger.batch() for staggered scroll animations
 * - Proper refresh() calls on route changes
 * - will-change management for performance
 * - Reduced motion support throughout
 *
 * @see https://gsap.com/docs/v3/GSAP/gsap.context()
 * @see https://gsap.com/docs/v3/ScrollTrigger/
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugins once
gsap.registerPlugin(ScrollTrigger)

// ===== REDUCED MOTION =====
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
export let isReducedMotion = motionQuery.matches

motionQuery.addEventListener('change', (e) => {
  isReducedMotion = e.matches
  // Refresh all ScrollTriggers when motion preference changes
  if (!isReducedMotion) ScrollTrigger.refresh()
})

// ===== GSAP CONTEXT MANAGEMENT =====
// Central context for global animations, separate from component contexts
let globalCtx = null

/**
 * Initialize the global animation context
 * Call once on app mount
 */
export function initGlobalAnimations() {
  if (globalCtx) return globalCtx

  globalCtx = gsap.context(() => {
    // Global animations can be registered here
  })

  return globalCtx
}

/**
 * Revert all global animations
 * Call on app unmount or route change
 */
export function revertGlobalAnimations() {
  if (globalCtx) {
    globalCtx.revert()
    globalCtx = null
  }
  ScrollTrigger.killAll()
}

/**
 * Create a scoped animation context for Vue components
 * Follows GSAP best practice: wrap all component animations in context
 *
 * @example
 * const ctx = createAnimationContext()
 * ctx.add(() => gsap.to('.el', { x: 100 }))
 * // On cleanup:
 * ctx.revert()
 */
export function createAnimationContext(scopeEl) {
  const ctx = gsap.context(() => {}, scopeEl || document)

  return {
    /**
     * Add an animation to the context for automatic tracking
     * @param {Function} fn - Function that creates GSAP animations
     * @returns {Function} The original function for chaining
     */
    add(fn) {
      if (typeof fn === 'function') {
        return ctx.add(fn)
      }
      return fn
    },

    /**
     * Revert all animations tracked by this context
     * Kills tweens, removes ScrollTriggers, cleans up event listeners
     */
    revert() {
      ctx.revert()
    },

    /**
     * Get the raw GSAP context instance
     */
    get context() {
      return ctx
    },
  }
}

// ===== SCROLLTRIGGER MANAGEMENT =====

// Debounce timer for ScrollTrigger refresh
let refreshTimer = null

/**
 * Refresh ScrollTrigger positions with debouncing
 * Call after DOM changes, route navigation, or image load
 * Debounced to avoid excessive refresh calls during rapid navigation
 */
export function refreshScrollTriggers(delay = 100) {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }

  refreshTimer = setTimeout(() => {
    refreshTimer = null
    // Use double rAF to ensure DOM has fully updated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    })
  }, delay)
}

/**
 * Batch animate elements with ScrollTrigger
 * Improved: better easing, optimized will-change management
 */
export function scrollBatch(targets, config = {}) {
  if (isReducedMotion) {
    gsap.set(targets, { opacity: 1, y: 0, x: 0, scale: 1 })
    return null
  }

  const {
    fromY = 40,
    fromX = 0,
    fromScale = 1,
    fromRotation = 0,
    duration = 0.7,
    stagger = 0.08,
    ease = 'power3.out',
    start = 'top 85%',
    once = true,
    trigger,
    ...rest
  } = config

  const elements = gsap.utils.toArray(targets)
  if (!elements.length) return null

  return ScrollTrigger.batch(elements, {
    start,
    once,
    trigger: trigger || elements[0],

    onEnter: (batch) => {
      // Set will-change before animation
      batch.forEach(el => { if (el.style) el.style.willChange = 'transform, opacity' })

      gsap.fromTo(batch,
        {
          opacity: 0,
          y: fromY,
          x: fromX,
          scale: fromScale,
          rotation: fromRotation,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotation: 0,
          duration,
          stagger,
          ease,
          force3D: true,
          overwrite: true,
          ...rest,
          onComplete: () => {
            // Clean up will-change after animation
            batch.forEach(el => { if (el.style) el.style.willChange = '' })
          }
        }
      )
    },

    onBatchEnter: (batch) => {
      batch.forEach(el => { if (el.style) el.style.willChange = 'transform, opacity' })

      gsap.fromTo(batch,
        {
          opacity: 0,
          y: fromY,
          x: fromX,
          scale: fromScale,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration,
          stagger,
          ease,
          force3D: true,
          overwrite: true,
          ...rest,
          onComplete: () => {
            batch.forEach(el => { if (el.style) el.style.willChange = '' })
          }
        }
      )
    },
  })
}

/**
 * Single element scroll reveal animation
 * Improved: better will-change management, optimized toggles
 */
export function scrollReveal(targets, config = {}) {
  if (isReducedMotion) {
    gsap.set(targets, { opacity: 1, y: 0, x: 0, scale: 1 })
    return null
  }

  const {
    fromY = 0,
    fromX = 0,
    fromScale = 1,
    fromRotation = 0,
    fromOpacity = 0.01,
    duration = 0.7,
    ease = 'power3.out',
    start = 'top 85%',
    end = 'bottom 20%',
    once = true,
    scrub = false,
    trigger,
    markers = false,
    onEnter,
    onLeave,
    onComplete,
    ...rest
  } = config

  const elements = gsap.utils.toArray(targets)
  if (!elements.length) return null

  const fromVars = {
    opacity: fromOpacity,
    force3D: true,
  }
  const toVars = {
    opacity: 1,
    force3D: true,
  }

  if (fromY !== 0) { fromVars.y = fromY; toVars.y = 0 }
  if (fromX !== 0) { fromVars.x = fromX; toVars.x = 0 }
  if (fromScale !== 1) { fromVars.scale = fromScale; toVars.scale = 1 }
  if (fromRotation !== 0) { fromVars.rotation = fromRotation; toVars.rotation = 0 }

  const tween = gsap.fromTo(elements, fromVars, {
    ...toVars,
    duration: scrub ? undefined : duration,
    ease: scrub ? 'none' : ease,
    scrollTrigger: {
      trigger: trigger || elements[0],
      start,
      end,
      scrub,
      once,
      markers,
      toggleActions: once ? 'play none none none' : 'play reverse play reverse',
      onEnter: (self) => {
        elements.forEach(el => { if (el.style) el.style.willChange = 'transform, opacity' })
        if (onEnter) onEnter(self)
      },
      onLeave: (self) => {
        if (once) {
          elements.forEach(el => { if (el.style) el.style.willChange = '' })
        }
        if (onLeave) onLeave(self)
      },
      onComplete: (self) => {
        elements.forEach(el => { if (el.style) el.style.willChange = '' })
        if (onComplete) onComplete(self)
      },
      ...config.scrollTrigger
    },
    ...rest,
  })

  return tween
}

/**
 * Parallax scroll effect
 * Uses scrub for smooth scroll-linked animation
 */
export function parallax(targets, config = {}) {
  if (isReducedMotion) {
    gsap.set(targets, { y: 0 })
    return null
  }

  const {
    y = -100,
    x = 0,
    scale = 1,
    scrub = 1,
    start = 'top bottom',
    end = 'bottom top',
    trigger,
    ...rest
  } = config

  const elements = gsap.utils.toArray(targets)
  if (!elements.length) return null

  return gsap.to(elements, {
    y,
    x,
    scale,
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: trigger || elements[0],
      start,
      end,
      scrub: Math.min(scrub, 3), // Cap scrub value for performance
      ...config.scrollTrigger
    },
    ...rest,
  })
}

// ===== ANIMATION PRESETS =====

/**
 * Fade in up with configurable distance
 */
export function fadeInUp(targets, config = {}) {
  if (isReducedMotion) {
    gsap.set(targets, { opacity: 1, y: 0 })
    return null
  }

  const {
    fromY = 40,
    duration = 0.6,
    ease = 'power3.out',
    delay = 0,
    ...rest
  } = config

  return gsap.fromTo(targets,
    { opacity: 0, y: fromY },
    {
      opacity: 1,
      y: 0,
      duration,
      ease,
      delay,
      force3D: true,
      overwrite: 'auto',
      ...rest,
    }
  )
}

/**
 * Fade in left
 */
export function fadeInLeft(targets, config = {}) {
  if (isReducedMotion) {
    gsap.set(targets, { opacity: 1, x: 0 })
    return null
  }

  const {
    fromX = -40,
    duration = 0.6,
    ease = 'power3.out',
    delay = 0,
    ...rest
  } = config

  return gsap.fromTo(targets,
    { opacity: 0, x: fromX },
    {
      opacity: 1,
      x: 0,
      duration,
      ease,
      delay,
      force3D: true,
      overwrite: 'auto',
      ...rest,
    }
  )
}

/**
 * Fade in right
 */
export function fadeInRight(targets, config = {}) {
  if (isReducedMotion) {
    gsap.set(targets, { opacity: 1, x: 0 })
    return null
  }

  const {
    fromX = 40,
    duration = 0.6,
    ease = 'power3.out',
    delay = 0,
    ...rest
  } = config

  return gsap.fromTo(targets,
    { opacity: 0, x: fromX },
    {
      opacity: 1,
      x: 0,
      duration,
      ease,
      delay,
      force3D: true,
      overwrite: 'auto',
      ...rest,
    }
  )
}

/**
 * Scale in with spring-like bounce
 */
export function scaleIn(targets, config = {}) {
  if (isReducedMotion) {
    gsap.set(targets, { opacity: 1, scale: 1 })
    return null
  }

  const {
    fromScale = 0.95,
    duration = 0.5,
    ease = 'back.out(1.4)',
    delay = 0,
    ...rest
  } = config

  return gsap.fromTo(targets,
    { opacity: 0, scale: fromScale },
    {
      opacity: 1,
      scale: 1,
      duration,
      ease,
      delay,
      force3D: true,
      overwrite: 'auto',
      ...rest,
    }
  )
}

/**
 * Staggered grid animation
 * Improved: better easing, tighter stagger for momentum feel
 */
export function staggerGrid(targets, config = {}) {
  if (isReducedMotion) {
    gsap.set(targets, { opacity: 1, y: 0, scale: 1 })
    return null
  }

  const elements = gsap.utils.toArray(targets)
  if (!elements.length) return null

  const {
    fromY = 30,
    fromScale = 0.98,
    duration = 0.6,
    stagger = 0.06,
    ease = 'power3.out',
    delay = 0,
    staggerFrom = 'start',
    ...rest
  } = config

  return gsap.fromTo(elements,
    {
      opacity: 0,
      y: fromY,
      scale: fromScale,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration,
      stagger: {
        each: stagger,
        from: staggerFrom,
      },
      ease,
      delay,
      force3D: true,
      overwrite: 'auto',
      ...rest,
    }
  )
}

// ===== PAGE TRANSITIONS =====

/**
 * Page enter animation with improved momentum feel
 * Uses a subtle overshoot easing for a more dynamic entrance
 */
export function pageEnter(el, done) {
  if (isReducedMotion) {
    gsap.set(el, { opacity: 1, y: 0 });
    done();
    return;
  }

  // Set initial state - slightly deeper start for momentum feel
  gsap.set(el, { opacity: 0, y: 20, scale: 0.995 });

  gsap.to(el, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.5,
    ease: 'power3.out',
    force3D: true,
    onComplete: () => {
      refreshScrollTriggers();
      done();
    },
    onInterrupt: () => {
      gsap.set(el, { opacity: 1, y: 0, scale: 1 });
      done();
    }
  });
}

/**
 * Page leave animation with faster exit for perceived performance
 */
export function pageLeave(el, done) {
  if (isReducedMotion) {
    done();
    return;
  }

  gsap.to(el, {
    opacity: 0,
    y: -10,
    scale: 0.995,
    duration: 0.25,
    ease: 'power3.in',
    force3D: true,
    onComplete: done,
    onInterrupt: done,
  });
}

// ===== MICRO-INTERACTIONS =====

/**
 * Magnetic effect - element follows cursor within bounds
 */
export function magneticEffect(element, config = {}) {
  if (isReducedMotion) return { destroy: () => {} }

  const el = gsap.utils.toArray(element)[0]
  if (!el) return { destroy: () => {} }

  const {
    strength = 30,
    duration = 0.3,
    elasticDuration = 0.5,
  } = config

  let tween = null

  const onMouseMove = (e) => {
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    if (tween) tween.kill()

    tween = gsap.to(el, {
      x: x * (strength / 100),
      y: y * (strength / 100),
      duration,
      ease: 'power2.out',
      force3D: true,
    })
  }

  const onMouseLeave = () => {
    if (tween) tween.kill()

    gsap.to(el, {
      x: 0,
      y: 0,
      duration: elasticDuration,
      ease: 'elastic.out(1, 0.5)',
      force3D: true,
    })
  }

  el.addEventListener('mousemove', onMouseMove)
  el.addEventListener('mouseleave', onMouseLeave)

  return {
    destroy: () => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      if (tween) tween.kill()
    }
  }
}

/**
 * Hover lift with optional shadow
 */
export function hoverLift(element, config = {}) {
  if (isReducedMotion) return { destroy: () => {} }

  const el = gsap.utils.toArray(element)[0]
  if (!el) return { destroy: () => {} }

  const {
    liftY = -6,
    scale = 1.02,
    duration = 0.3,
  } = config

  let tween = null

  const onMouseEnter = () => {
    if (tween) tween.kill()

    tween = gsap.to(el, {
      y: liftY,
      scale,
      duration,
      ease: 'power2.out',
      force3D: true,
    })
  }

  const onMouseLeave = () => {
    if (tween) tween.kill()

    gsap.to(el, {
      y: 0,
      scale: 1,
      duration,
      ease: 'power2.out',
      force3D: true,
    })
  }

  el.addEventListener('mouseenter', onMouseEnter)
  el.addEventListener('mouseleave', onMouseLeave)

  return {
    destroy: () => {
      el.removeEventListener('mouseenter', onMouseEnter)
      el.removeEventListener('mouseleave', onMouseLeave)
      if (tween) tween.kill()
    }
  }
}

/**
 * Counter animation
 */
export function animateCounter(target, start, end, config = {}) {
  const el = gsap.utils.toArray(target)[0]
  if (!el) return null

  const {
    duration = 2,
    ease = 'power2.out',
    decimals = 0,
    prefix = '',
    suffix = '',
    ...rest
  } = config

  const obj = { value: start }

  return gsap.to(obj, {
    value: end,
    duration,
    ease,
    onUpdate: () => {
      el.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`
    },
    ...rest,
  })
}

// ===== UTILITY =====

/**
 * Convert any target to GSAP-friendly array
 * Handles strings, NodeLists, arrays, Vue refs
 */
export function toArray(target) {
  return gsap.utils.toArray(target)
}

/**
 * Kill all tweens and ScrollTriggers
 * Use with caution - typically only on full app teardown
 */
export function killAll() {
  gsap.globalTimeline.clear()
  ScrollTrigger.killAll()
}

// ===== EXPORT =====
export { gsap, ScrollTrigger }
