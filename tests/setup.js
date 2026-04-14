import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import en from '../src/i18n/locales/en.json'
import ptBR from '../src/i18n/locales/pt-BR.json'
import zh from '../src/i18n/locales/zh.json'
import ja from '../src/i18n/locales/ja.json'
import es from '../src/i18n/locales/es.json'
import th from '../src/i18n/locales/th.json'
import ne from '../src/i18n/locales/ne.json'
import hi from '../src/i18n/locales/hi.json'

// Create a global i18n instance for tests
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'pt-BR',
  messages: {
    en,
    'pt-BR': ptBR,
    zh,
    ja,
    es,
    th,
    ne,
    hi
  },
  globalInjection: true
})

// Create pinia instance
const pinia = createPinia()
setActivePinia(pinia)

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
})

// ===== GSAP Mock for jsdom test environment =====
// GSAP's DOM manipulation doesn't work properly in jsdom, so we mock it
// The mock provides the same API but applies styles directly without animations

const mockGSAP = {
  set: (targets, vars) => {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : [targets]
    elements.forEach(el => {
      if (el && el.style) {
        Object.keys(vars).forEach(key => {
          if (key === 'force3D' || key === 'overwrite' || key === 'delay') return
          const cssKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
          el.style[cssKey] = vars[key]
        })
      }
    })
    return { kill: () => {}, isActive: false }
  },
  to: (targets, vars) => {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : [targets]
    elements.forEach(el => {
      if (el && el.style) {
        // Apply end state immediately for tests
        if (vars.opacity !== undefined) el.style.opacity = vars.opacity
        if (vars.y !== undefined) el.style.transform = el.style.transform || ''
        if (vars.x !== undefined) el.style.transform = el.style.transform || ''
        if (vars.scale !== undefined) el.style.transform = el.style.transform || ''
      }
    })
    // Call onComplete immediately
    if (vars.onComplete) vars.onComplete()
    return {
      kill: () => {},
      then: (cb) => cb && cb(),
      isActive: false,
      vars: vars
    }
  },
  from: (targets, vars) => {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : [targets]
    elements.forEach(el => {
      if (el && el.style) {
        if (vars.opacity !== undefined) el.style.opacity = vars.opacity
      }
    })
    if (vars.onComplete) vars.onComplete()
    return { kill: () => {}, then: (cb) => cb && cb(), isActive: false, vars: vars }
  },
  fromTo: (targets, fromVars, toVars) => {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : [targets]
    elements.forEach(el => {
      if (el && el.style) {
        // Apply from state
        if (fromVars.opacity !== undefined) el.style.opacity = fromVars.opacity
        // Apply to state
        if (toVars.opacity !== undefined) el.style.opacity = toVars.opacity
        if (toVars.y !== undefined) el.style.transform = el.style.transform || ''
        if (toVars.x !== undefined) el.style.transform = el.style.transform || ''
        if (toVars.scale !== undefined) el.style.transform = el.style.transform || ''
      }
    })
    // Call onComplete immediately after a tick
    if (toVars.onComplete) {
      setTimeout(() => toVars.onComplete(), 0)
    }
    return { kill: () => {}, then: (cb) => cb && cb(), isActive: false, vars: { ...fromVars, ...toVars } }
  },
  context: (fn, scope) => {
    const ctx = {
      add: (animationFn) => {
        if (typeof animationFn === 'function') {
          try {
            return animationFn()
          } catch (e) {
            // Silently fail in tests
            return null
          }
        }
        return animationFn
      },
      revert: () => {},
      selector: scope
    }
    if (typeof fn === 'function') {
      try {
        fn(ctx)
      } catch (e) {
        // Silently fail in tests
      }
    }
    return ctx
  },
  utils: {
    toArray: (targets) => {
      if (typeof targets === 'string') {
        return Array.from(document.querySelectorAll(targets))
      }
      if (targets && targets.$el) return [targets.$el] // Vue ref support
      if (Array.isArray(targets)) return targets
      if (targets) return [targets]
      return []
    }
  },
  registerPlugin: () => {},
  globalTimeline: {
    clear: () => {},
    getChildren: () => [],
    kill: () => {}
  },
  ticker: {
    fps: 60
  }
}

// Mock ScrollTrigger
const mockScrollTrigger = {
  create: () => ({ kill: () => {}, disable: () => {} }),
  batch: () => ({ kill: () => {} }),
  refresh: () => {},
  killAll: () => {},
  register: () => {}
}

// Register GSAP mocks globally before importing animation modules
window.gsap = mockGSAP
window.ScrollTrigger = mockScrollTrigger

// Mock the animations module by creating a manual mock
vi.mock('gsap', () => ({
  gsap: mockGSAP
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: mockScrollTrigger
}))

// Configure Vue Test Utils
config.global.plugins = [i18n, pinia]

// Make i18n available globally
globalThis.i18n = i18n
globalThis.pinia = pinia
