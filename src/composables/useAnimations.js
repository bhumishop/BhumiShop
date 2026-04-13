/**
 * Vue 3 composables for GSAP animations
 *
 * Best practices:
 * - Uses gsap.context() for automatic cleanup
 * - overwrite: 'auto' to prevent animation conflicts
 * - force3D: true for GPU acceleration
 * - Proper lifecycle management
 *
 * @see https://gsap.com/resources/frameworks/
 */
import { onUnmounted, nextTick, ref } from 'vue'
import {
  gsap,
  ScrollTrigger,
  scrollReveal,
  scrollBatch,
  staggerGrid,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  parallax,
  magneticEffect,
  hoverLift,
  createAnimationContext,
  pageEnter,
  pageLeave,
  refreshScrollTriggers,
} from '../utils/animations'

/**
 * Main GSAP animation composable for Vue 3 components
 *
 * @example
 * const { mountAnimation, scrollReveal, cleanup } = useGSAPAnimations()
 *
 * onMounted(() => {
 *   mountAnimation('.hero', 'fadeInUp', { fromY: 50 })
 *   setupScrollAnimations('.card', { fromY: 30, stagger: 0.1 })
 * })
 */
export function useGSAPAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Create a scoped context for this component
  const ctx = createAnimationContext()

  /**
   * Animate element on mount (non-scroll)
   * @param {string|Element} element - Target element
   * @param {string} type - Animation type: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn'
   * @param {object} config - Animation config
   */
  function mountAnimation(element, type = 'fadeInUp', config = {}) {
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0, x: 0, scale: 1 })
      return null
    }

    const animationMap = {
      fadeInUp: () => fadeInUp(element, config),
      fadeInLeft: () => fadeInLeft(element, config),
      fadeInRight: () => fadeInRight(element, config),
      scaleIn: () => scaleIn(element, config),
    }

    const fn = animationMap[type]
    if (!fn) return null

    return ctx.add(fn)
  }

  /**
   * Setup scroll-triggered reveal animations
   * @param {string|Element} selector - Target elements
   * @param {object} config - Scroll reveal config
   */
  function setupScrollAnimations(selector, config = {}) {
    if (prefersReducedMotion) {
      gsap.set(selector, { opacity: 1, y: 0 })
      return null
    }

    return ctx.add(() =>
      scrollReveal(selector, {
        fromY: 40,
        duration: 0.7,
        ease: 'power3.out',
        start: 'top 85%',
        once: true,
        ...config,
      })
    )
  }

  /**
   * Batch scroll animations for staggered reveals
   * Best practice for grids and lists - better performance than individual triggers
   */
  function setupScrollBatch(selector, config = {}) {
    if (prefersReducedMotion) {
      gsap.set(selector, { opacity: 1, y: 0 })
      return null
    }

    return ctx.add(() =>
      scrollBatch(selector, {
        fromY: 30,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        start: 'top 85%',
        once: true,
        ...config,
      })
    )
  }

  /**
   * Stagger animate grid items (non-scroll)
   */
  function staggerAnimate(selector, config = {}) {
    if (prefersReducedMotion) {
      gsap.set(selector, { opacity: 1, y: 0 })
      return null
    }

    return ctx.add(() =>
      staggerGrid(selector, {
        fromY: 30,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        ...config,
      })
    )
  }

  /**
   * Parallax scroll effect
   */
  function setupParallax(selector, config = {}) {
    if (prefersReducedMotion) {
      gsap.set(selector, { y: 0 })
      return null
    }

    return ctx.add(() =>
      parallax(selector, {
        y: config.y || -100,
        scrub: config.scrub || 1,
        ...config,
      })
    )
  }

  /**
   * Hover lift effect
   * @returns {object} { destroy } - Call destroy to clean up
   */
  function setupHoverLift(element, config = {}) {
    if (prefersReducedMotion) return { destroy: () => {} }

    return hoverLift(element, {
      liftY: config.liftY || -6,
      scale: config.scale || 1.02,
      ...config,
    })
  }

  /**
   * Magnetic button effect
   */
  function setupMagnetic(element, config = {}) {
    if (prefersReducedMotion) return { destroy: () => {} }

    return magneticEffect(element, {
      strength: config.strength || 9,
      ...config,
    })
  }

  /**
   * Cleanup all animations
   * Call in onUnmounted
   */
  function cleanup() {
    ctx.revert()
  }

  // Auto-cleanup on unmount
  onUnmounted(() => {
    ctx.revert()
  })

  return {
    mountAnimation,
    setupScrollAnimations,
    setupScrollBatch,
    staggerAnimate,
    setupParallax,
    setupHoverLift,
    setupMagnetic,
    cleanup,
    refreshScrollTriggers,
    // Expose raw GSAP for advanced usage
    gsap,
    ScrollTrigger,
    prefersReducedMotion,
  }
}

/**
 * Composable for magnetic button effect
 *
 * @example
 * const { attach, detach } = useMagneticButton(30)
 *
 * onMounted(() => {
 *   attach(buttonRef.value)
 * })
 *
 * onUnmounted(() => {
 *   detach()
 * })
 */
export function useMagneticButton(strength = 30) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let instance = null

  function attach(element) {
    if (prefersReducedMotion) return
    instance = magneticEffect(element, { strength })
  }

  function detach() {
    if (instance) {
      instance.destroy()
      instance = null
    }
  }

  onUnmounted(() => {
    detach()
  })

  return { attach, detach, prefersReducedMotion }
}

/**
 * Composable for hover lift effect
 */
export function useHoverLift(config = {}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let instance = null

  function attach(element) {
    if (prefersReducedMotion) return
    instance = hoverLift(element, config)
  }

  function detach() {
    if (instance) {
      instance.destroy()
      instance = null
    }
  }

  onUnmounted(() => {
    detach()
  })

  return { attach, detach, prefersReducedMotion }
}

/**
 * Composable for page transitions
 * Use with Vue <transition> component
 *
 * @example
 * const { onEnter, onLeave } = usePageTransition()
 *
 * <transition name="page" mode="out-in" @enter="onEnter" @leave="onLeave">
 */
export function usePageTransition() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function onEnter(el, done) {
    if (prefersReducedMotion) {
      done()
      return
    }
    pageEnter(el, done)
  }

  function onLeave(el, done) {
    if (prefersReducedMotion) {
      done()
      return
    }
    pageLeave(el, done)
  }

  return { onEnter, onLeave, prefersReducedMotion }
}

/**
 * Composable for scroll-triggered counter animation
 */
export function useCounterAnimation(target, endValue, config = {}) {
  const counterEl = ref(null)
  let tween = null

  function start() {
    const el = target || counterEl.value
    if (!el) return

    tween = gsap.to({ value: config.startValue || 0 }, {
      value: endValue,
      duration: config.duration || 2,
      ease: config.ease || 'power2.out',
      onUpdate: function () {
        el.textContent = `${config.prefix || ''}${Math.round(this.targets()[0].value).toLocaleString()}${config.suffix || ''}`
      },
    })
  }

  function reset() {
    if (tween) {
      tween.kill()
      tween = null
    }
  }

  onUnmounted(() => {
    reset()
  })

  return { counterEl, start, reset }
}

export { gsap, ScrollTrigger }
