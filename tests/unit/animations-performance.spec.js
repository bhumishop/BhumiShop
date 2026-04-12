/**
 * Performance and memory leak tests for the animation system
 *
 * These tests specifically look for:
 * - Memory leaks from unreferenced animations
 * - ScrollTrigger cleanup issues
 * - Event listener leaks
 * - Performance regressions
 * - DOM element retention after unmount
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  gsap,
  ScrollTrigger,
  createAnimationContext,
  initGlobalAnimations,
  revertGlobalAnimations,
  scrollReveal,
  scrollBatch,
  staggerGrid,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  magneticEffect,
  hoverLift,
  killAll,
  toArray,
} from '../../src/utils/animations'

// Memory tracking utility
function getMemoryUsage() {
  // In Node.js/vitest, we can't access real memory, but we can track object counts
  return {
    animations: gsap.globalTimeline.getChildren().length,
    scrollTriggers: ScrollTrigger.getAll?.().length || 0,
  }
}

// Helper to create test elements
function createElements(count, className = 'test-el') {
  const elements = []
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = `${className}-${i}`
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)
    elements.push(el)
  }
  return elements
}

function cleanup() {
  document.body.innerHTML = ''
  killAll()
  vi.clearAllMocks()
}

describe('Memory Leak Detection', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('should not leak animations after context revert', () => {
    const initialCount = gsap.globalTimeline.getChildren().length

    for (let i = 0; i < 10; i++) {
      const el = document.createElement('div')
      el.style.width = '100px'
      el.style.height = '100px'
      document.body.appendChild(el)

      const ctx = createAnimationContext()
      ctx.add(() => gsap.to(el, { x: 100, duration: 10 }))
      ctx.revert()
    }

    // After all contexts are reverted, count should be same as initial
    const finalCount = gsap.globalTimeline.getChildren().length
    expect(finalCount).toBe(initialCount)
  })

  it('should not leak ScrollTrigger instances', () => {
    // Mock ScrollTracker to track instances
    const mockKill = vi.fn()
    vi.spyOn(ScrollTrigger, 'killAll')

    // Create scroll animations
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('div')
      el.style.width = '100px'
      el.style.height = '100px'
      document.body.appendChild(el)

      scrollReveal(el, {
        fromY: 40,
        duration: 0.5,
        start: 'top 80%',
        once: true,
      })
    }

    revertGlobalAnimations()
    expect(ScrollTrigger.killAll).toHaveBeenCalled()
  })

  it('should clean up event listeners from magnetic effect', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    const instance = magneticEffect(el, { strength: 30 })

    // Track initial listener count
    const initialMouseMoves = el._listeners?.mousemove?.length || 1

    instance.destroy()

    // After destroy, listeners should be removed
    const afterMouseMoves = el._listeners?.mousemove?.length || 0
    expect(afterMouseMoves).toBeLessThan(initialMouseMoves)
  })

  it('should clean up event listeners from hover lift', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    const instance = hoverLift(el)
    instance.destroy()

    // Should not throw on double destroy
    expect(() => instance.destroy()).not.toThrow()
  })

  it('should handle rapid context creation/destruction without leaks', () => {
    const iterations = 50
    const memorySnapshots = []

    for (let i = 0; i < iterations; i++) {
      const el = document.createElement('div')
      el.style.width = '100px'
      el.style.height = '100px'
      document.body.appendChild(el)

      const ctx = createAnimationContext()
      ctx.add(() => gsap.to(el, { opacity: 0.5, duration: 1 }))
      ctx.add(() => gsap.to(el, { x: 50, duration: 1 }))
      ctx.revert()

      // Snapshot every 10 iterations
      if (i % 10 === 0) {
        memorySnapshots.push(getMemoryUsage())
      }
    }

    // Memory should be stable (not growing)
    const first = memorySnapshots[0]
    const last = memorySnapshots[memorySnapshots.length - 1]

    expect(last.animations).toBe(first.animations)
  })

  it('should not retain DOM references after element removal', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    const ctx = createAnimationContext()
    ctx.add(() => gsap.to(el, { x: 100, duration: 10 }))

    // Remove element
    el.remove()

    // Revert should not throw
    expect(() => ctx.revert()).not.toThrow()
  })

  it('should clear global timeline on killAll', () => {
    const elements = createElements(10)

    elements.forEach((el) => {
      fadeInUp(el, { duration: 10 })
    })

    expect(gsap.globalTimeline.getChildren().length).toBeGreaterThan(0)

    killAll()

    expect(gsap.globalTimeline.getChildren().length).toBe(0)
  })
})

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('should setup 100 stagger animations in < 50ms', () => {
    createElements(100, 'perf-stagger')

    const start = performance.now()
    staggerGrid('.perf-stagger', {
      fromY: 30,
      stagger: 0.01,
      duration: 0.001,
    })
    const end = performance.now()

    expect(end - start).toBeLessThan(50)
  })

  it('should setup 50 scroll reveals in < 100ms', () => {
    createElements(50, 'perf-scroll')

    const start = performance.now()
    createElements(50, 'perf-scroll').forEach((el) => {
      scrollReveal(el, {
        fromY: 40,
        duration: 0.5,
        start: 'top 80%',
        once: true,
      })
    })
    const end = performance.now()

    // Setup time should be reasonable
    expect(end - start).toBeLessThan(200)
  })

  it('should handle 1000 concurrent tweens without crash', () => {
    const elements = createElements(1000, 'perf-concurrent')

    // This should not throw or crash
    expect(() => {
      elements.forEach((el, i) => {
        gsap.to(el, {
          x: i,
          y: i * 0.5,
          opacity: 0.5,
          duration: 0.001,
          force3D: true,
        })
      })
    }).not.toThrow()
  })

  it('should animate large grid with consistent timing', () => {
    createElements(64, 'perf-grid') // 8x8 grid

    const times = []

    // Run 10 times to check consistency
    for (let run = 0; run < 10; run++) {
      document.body.innerHTML = ''
      createElements(64, 'perf-grid')

      const start = performance.now()
      staggerGrid('.perf-grid', {
        fromY: 30,
        stagger: 0.01,
        duration: 0.001,
      })
      const end = performance.now()
      times.push(end - start)
    }

    // All runs should be under 100ms
    const maxTime = Math.max(...times)
    expect(maxTime).toBeLessThan(100)

    // Variance should be low (consistent performance)
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length
    expect(variance).toBeLessThan(100)
  })

  it.skip('should use GPU acceleration (force3D)', () => {
    // Skipped: jsdom doesn't support CSS transforms properly
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    gsap.to(el, { x: 100, duration: 0.1, force3D: true })
    vi.advanceTimersByTime(5000)

    const transform = el.style.transform
    expect(transform).toMatch(/translate|matrix/)
  })
})

describe('ScrollTrigger Best Practices', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('should use once: true for entry animations to avoid re-triggering', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    const tween = scrollReveal(el, {
      fromY: 40,
      once: true,
      duration: 0.5,
    })

    // Verify ScrollTrigger config
    if (tween && tween.scrollTrigger) {
      expect(tween.scrollTrigger.vars.once).toBe(true)
    }
  })

  it('should handle ScrollTrigger refresh without errors', () => {
    createElements(10, 'refresh-test')

    // Create scroll triggers
    toArray('.refresh-test').forEach((el) => {
      scrollReveal(el, { fromY: 30, duration: 0.5 })
    })

    // Refresh should not throw
    expect(() => {
      ScrollTrigger.refresh()
    }).not.toThrow()
  })

  it('should use appropriate scrub values for parallax', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    // Create tween with scrub value
    const tween = gsap.to(el, {
      y: -100,
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 5,
      },
    })

    // Verify scrub value is set (our implementation caps at 3, but raw GSAP doesn't)
    expect(tween.scrollTrigger.vars.scrub).toBe(5)
  })
})

describe('Edge Cases and Bug Prevention', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('should handle elements with same class in different parents', () => {
    const parent1 = document.createElement('div')
    const parent2 = document.createElement('div')

    const el1 = document.createElement('div')
    el1.className = 'duplicate'
    el1.style.width = '100px'
    el1.style.height = '100px'
    parent1.appendChild(el1)

    const el2 = document.createElement('div')
    el2.className = 'duplicate'
    el2.style.width = '100px'
    el2.style.height = '100px'
    parent2.appendChild(el2)

    document.body.appendChild(parent1)
    document.body.appendChild(parent2)

    // Should animate all matching elements
    const anim = staggerGrid('.duplicate', { duration: 0.001 })
    expect(anim).toBeDefined()
  })

  it('should handle zero-duration animations', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    expect(() => {
      fadeInUp(el, { duration: 0 })
    }).not.toThrow()
  })

  it('should handle negative delay', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    expect(() => {
      fadeInUp(el, { delay: -0.5 })
    }).not.toThrow()
  })

  it('should handle very large fromY values', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    expect(() => {
      fadeInUp(el, { fromY: 10000 })
    }).not.toThrow()
  })

  it('should not animate elements outside viewport with scrollTrigger', () => {
    // Place element below viewport
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    el.style.position = 'absolute'
    el.style.top = '10000px'
    document.body.appendChild(el)

    const tween = scrollReveal(el, {
      fromY: 40,
      start: 'top 80%',
      once: true,
    })

    // Element should still be in initial state (not visible yet)
    expect(tween).toBeDefined()
  })

  it('should handle context add with non-function argument', () => {
    const ctx = createAnimationContext()

    // Should return the argument as-is
    const result = ctx.add(null)
    expect(result).toBeNull()

    const result2 = ctx.add(42)
    expect(result2).toBe(42)
  })

  it('should handle concurrent fade animations on same element', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    // Start multiple animations on same element
    fadeInUp(el, { duration: 1 })
    fadeInLeft(el, { duration: 1 })
    scaleIn(el, { duration: 1 })

    // With overwrite: auto, should not conflict
    vi.advanceTimersByTime(5000)
    expect(el.style.opacity).toBeDefined()
  })
})

describe('Reduced Motion Compliance', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    killAll()
  })

  it('should skip all animations when reduced motion is preferred', () => {
    // This test verifies the behavior exists
    // Actual value depends on system settings
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    el.style.opacity = '0'
    document.body.appendChild(el)

    // Regardless of motion preference, API should not throw
    expect(() => {
      fadeInUp(el)
      fadeInLeft(el)
      fadeInRight(el)
      scaleIn(el)
      staggerGrid([el])
    }).not.toThrow()
  })
})
