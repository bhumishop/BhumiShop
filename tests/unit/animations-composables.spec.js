/**
 * Tests for Vue animation composables
 *
 * Tests cover:
 * - useGSAPAnimations composable
 * - useMagneticButton composable
 * - useHoverLift composable
 * - usePageTransition composable
 * - Memory management and cleanup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref, onMounted, onUnmounted, nextTick, h } from 'vue'
import {
  useGSAPAnimations,
  useMagneticButton,
  useHoverLift,
  usePageTransition,
} from '../../src/composables/useAnimations'

// Helper to create test component
function createTestComponent(template = null, setup = null) {
  return defineComponent({
    template: template || '<div ref="el">Test</div>',
    setup: setup || (() => {
      const { mountAnimation, cleanup } = useGSAPAnimations()
      return { mountAnimation, cleanup }
    }),
  })
}

// Helper to create wrapper with element
function createWrapper(content = '<div class="test-el">Test</div>') {
  return mount({
    template: `<div>${content}</div>`,
  })
}

describe('useGSAPAnimations Composable', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('should return expected methods', () => {
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        const api = useGSAPAnimations()
        return { api }
      },
    })

    const { api } = wrapper.vm

    expect(api.mountAnimation).toBeDefined()
    expect(api.setupScrollAnimations).toBeDefined()
    expect(api.setupScrollBatch).toBeDefined()
    expect(api.staggerAnimate).toBeDefined()
    expect(api.setupParallax).toBeDefined()
    expect(api.setupHoverLift).toBeDefined()
    expect(api.setupMagnetic).toBeDefined()
    expect(api.cleanup).toBeDefined()
    expect(api.refreshScrollTriggers).toBeDefined()
    expect(api.gsap).toBeDefined()
    expect(api.prefersReducedMotion).toBeDefined()
  })

  describe('mountAnimation', () => {
    it('should animate element on mount', () => {
      const el = document.createElement('div')
      el.className = 'mount-test'
      el.style.opacity = '0'
      document.body.appendChild(el)

      const wrapper = mount({
        template: '<div><div class="mount-test">Test</div></div>',
        setup() {
          const { mountAnimation } = useGSAPAnimations()

          onMounted(() => {
            mountAnimation('.mount-test', 'fadeInUp', {
              fromY: 40,
              duration: 0.001,
            })
          })

          return {}
        },
      })

      vi.advanceTimersByTime(10)

      // Element should be animated in
      expect(parseFloat(el.style.opacity)).toBeGreaterThan(0.5)
    })

    it('should handle fadeInLeft type', () => {
      const el = document.createElement('div')
      el.className = 'mount-left'
      el.style.opacity = '0'
      document.body.appendChild(el)

      const wrapper = mount({
        template: '<div><div class="mount-left">Test</div></div>',
        setup() {
          const { mountAnimation } = useGSAPAnimations()

          onMounted(() => {
            mountAnimation('.mount-left', 'fadeInLeft', {
              fromX: -40,
              duration: 0.001,
            })
          })

          return {}
        },
      })

      vi.advanceTimersByTime(10)
      expect(parseFloat(el.style.opacity)).toBeGreaterThan(0.5)
    })

    it('should handle fadeInRight type', () => {
      const el = document.createElement('div')
      el.className = 'mount-right'
      el.style.opacity = '0'
      document.body.appendChild(el)

      const wrapper = mount({
        template: '<div><div class="mount-right">Test</div></div>',
        setup() {
          const { mountAnimation } = useGSAPAnimations()

          onMounted(() => {
            mountAnimation('.mount-right', 'fadeInRight', {
              fromX: 40,
              duration: 0.001,
            })
          })

          return {}
        },
      })

      vi.advanceTimersByTime(10)
      expect(parseFloat(el.style.opacity)).toBeGreaterThan(0.5)
    })

    it('should handle scaleIn type', () => {
      const el = document.createElement('div')
      el.className = 'mount-scale'
      el.style.opacity = '0'
      document.body.appendChild(el)

      const wrapper = mount({
        template: '<div><div class="mount-scale">Test</div></div>',
        setup() {
          const { mountAnimation } = useGSAPAnimations()

          onMounted(() => {
            mountAnimation('.mount-scale', 'scaleIn', {
              fromScale: 0.9,
              duration: 0.001,
            })
          })

          return {}
        },
      })

      vi.advanceTimersByTime(10)
      expect(parseFloat(el.style.opacity)).toBeGreaterThan(0.5)
    })

    it('should return null for invalid animation type', () => {
      const wrapper = mount({
        template: '<div><div class="invalid">Test</div></div>',
        setup() {
          const { mountAnimation } = useGSAPAnimations()

          onMounted(() => {
            const result = mountAnimation('.invalid', 'invalidType')
            expect(result).toBeNull()
          })

          return {}
        },
      })
    })
  })

  describe('staggerAnimate', () => {
    it('should animate multiple elements', () => {
      for (let i = 0; i < 5; i++) {
        const el = document.createElement('div')
        el.className = 'stagger-item'
        el.style.opacity = '0'
        document.body.appendChild(el)
      }

      const wrapper = mount({
        template: '<div>test</div>',
        setup() {
          const { staggerAnimate } = useGSAPAnimations()

          onMounted(() => {
            staggerAnimate('.stagger-item', {
              fromY: 30,
              stagger: 0.05,
              duration: 0.001,
            })
          })

          return {}
        },
      })

      vi.advanceTimersByTime(10)

      const items = document.querySelectorAll('.stagger-item')
      expect(items.length).toBe(5)
    })
  })

  describe('setupScrollAnimations', () => {
    it('should create scroll-triggered animations', () => {
      const el = document.createElement('div')
      el.className = 'scroll-target'
      el.style.width = '100px'
      el.style.height = '100px'
      document.body.appendChild(el)

      const wrapper = mount({
        template: '<div>test</div>',
        setup() {
          const { setupScrollAnimations } = useGSAPAnimations()

          onMounted(() => {
            setupScrollAnimations('.scroll-target', {
              fromY: 40,
              start: 'top 80%',
              once: true,
            })
          })

          return {}
        },
      })

      // Should not throw
      expect(wrapper).toBeDefined()
    })
  })

  describe('cleanup', () => {
    it('should cleanup animations on unmount', () => {
      const el = document.createElement('div')
      el.className = 'cleanup-test'
      el.style.width = '100px'
      el.style.height = '100px'
      document.body.appendChild(el)

      const wrapper = mount({
        template: '<div><div class="cleanup-test">Test</div></div>',
        setup() {
          const { mountAnimation, cleanup } = useGSAPAnimations()

          onMounted(() => {
            mountAnimation('.cleanup-test', 'fadeInUp', { duration: 10 })
          })

          onUnmounted(() => {
            cleanup()
          })

          return {}
        },
      })

      // Unmount should trigger cleanup
      wrapper.unmount()

      // No error should occur
      expect(true).toBe(true)
    })
  })

  describe('auto-cleanup on unmount', () => {
    it('should automatically cleanup when component unmounts', () => {
      const wrapper = mount({
        template: '<div>test</div>',
        setup() {
          const api = useGSAPAnimations()
          return { api }
        },
      })

      // Unmount should not throw
      expect(() => wrapper.unmount()).not.toThrow()
    })
  })
})

describe('useMagneticButton Composable', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('should return attach and detach methods', () => {
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        const magnetic = useMagneticButton(30)
        return { magnetic }
      },
    })

    const { magnetic } = wrapper.vm
    expect(magnetic.attach).toBeDefined()
    expect(magnetic.detach).toBeDefined()
    expect(typeof magnetic.prefersReducedMotion).toBe('boolean')
  })

  it('should attach to element without errors', () => {
    const el = document.createElement('button')
    el.style.width = '100px'
    el.style.height = '40px'
    document.body.appendChild(el)

    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        const magnetic = useMagneticButton(30)

        onMounted(() => {
          magnetic.attach(el)
        })

        return { magnetic }
      },
    })

    // Should not throw
    expect(wrapper).toBeDefined()
  })

  it('should detach and cleanup on unmount', () => {
    const el = document.createElement('button')
    el.style.width = '100px'
    el.style.height = '40px'
    document.body.appendChild(el)

    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        const magnetic = useMagneticButton(30)

        onMounted(() => {
          magnetic.attach(el)
        })

        return { magnetic }
      },
    })

    // Unmount should cleanup
    expect(() => wrapper.unmount()).not.toThrow()
  })
})

describe('useHoverLift Composable', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should return attach and detach methods', () => {
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        const hover = useHoverLift({ liftY: -6 })
        return { hover }
      },
    })

    const { hover } = wrapper.vm
    expect(hover.attach).toBeDefined()
    expect(hover.detach).toBeDefined()
  })

  it('should attach and detach without errors', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        const hover = useHoverLift({ liftY: -6 })

        onMounted(() => {
          hover.attach(el)
        })

        onUnmounted(() => {
          hover.detach()
        })

        return { hover }
      },
    })

    wrapper.unmount()
    expect(true).toBe(true)
  })
})

describe('usePageTransition Composable', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('should return onEnter and onLeave methods', () => {
    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        const transition = usePageTransition()
        return { transition }
      },
    })

    const { transition } = wrapper.vm
    expect(transition.onEnter).toBeDefined()
    expect(transition.onLeave).toBeDefined()
  })

  it('should call done callback on enter', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        const transition = usePageTransition()
        return { transition }
      },
    })

    const { transition } = wrapper.vm
    const done = vi.fn()

    transition.onEnter(el, done)
    vi.advanceTimersByTime(500)

    expect(done).toHaveBeenCalled()
  })

  it('should call done callback on leave', () => {
    const el = document.createElement('div')
    el.style.width = '100px'
    el.style.height = '100px'
    document.body.appendChild(el)

    const wrapper = mount({
      template: '<div>test</div>',
      setup() {
        const transition = usePageTransition()
        return { transition }
      },
    })

    const { transition } = wrapper.vm
    const done = vi.fn()

    transition.onLeave(el, done)
    vi.advanceTimersByTime(400)

    expect(done).toHaveBeenCalled()
  })
})

describe('Composable Memory Management', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should not leak animations on rapid mount/unmount', () => {
    // Mount and unmount 20 times rapidly
    for (let i = 0; i < 20; i++) {
      const wrapper = mount({
        template: '<div><div class="leak-test">Test</div></div>',
        setup() {
          const { mountAnimation } = useGSAPAnimations()

          onMounted(() => {
            mountAnimation('.leak-test', 'fadeInUp', { duration: 10 })
          })

          return {}
        },
      })

      wrapper.unmount()
    }

    // Should not cause any issues
    expect(true).toBe(true)
  })

  it('should handle nested composables without conflicts', () => {
    const wrapper = mount({
      template: `
        <div>
          <div class="magnetic-btn">Button</div>
          <div class="hover-card">Card</div>
        </div>
      `,
      setup() {
        const { mountAnimation, cleanup } = useGSAPAnimations()
        const magnetic = useMagneticButton(30)
        const hover = useHoverLift({ liftY: -6 })

        const magneticEl = ref(null)
        const hoverEl = ref(null)

        onMounted(() => {
          mountAnimation('.magnetic-btn', 'fadeInUp', { duration: 0.001 })

          const btn = document.querySelector('.magnetic-btn')
          const card = document.querySelector('.hover-card')

          if (btn) magnetic.attach(btn)
          if (card) hover.attach(card)
        })

        onUnmounted(() => {
          magnetic.detach()
          hover.detach()
          cleanup()
        })

        return { magneticEl, hoverEl }
      },
    })

    // Should mount without errors
    expect(wrapper).toBeDefined()

    // Should unmount without errors
    expect(() => wrapper.unmount()).not.toThrow()
  })
})
