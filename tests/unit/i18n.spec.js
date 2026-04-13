import { describe, it, expect, beforeEach } from 'vitest'
import { createI18n } from 'vue-i18n'
import { supportedLocales, defaultLocale, detectLocale, changeLocale } from '@/i18n'
import en from '@/i18n/locales/en.json'
import ptBR from '@/i18n/locales/pt-BR.json'
import zh from '@/i18n/locales/zh.json'
import ja from '@/i18n/locales/ja.json'
import es from '@/i18n/locales/es.json'
import th from '@/i18n/locales/th.json'
import ne from '@/i18n/locales/ne.json'
import hi from '@/i18n/locales/hi.json'

const localeFiles = { en, 'pt-BR': ptBR, zh, ja, es, th, ne, hi }

describe('i18n Configuration', () => {
  it('should have the correct default locale', () => {
    expect(defaultLocale).toBe('pt-BR')
  })

  it('should have all 8 supported locales', () => {
    expect(supportedLocales).toHaveLength(8)
    const codes = supportedLocales.map(l => l.code)
    expect(codes).toContain('en')
    expect(codes).toContain('pt-BR')
    expect(codes).toContain('zh')
    expect(codes).toContain('ja')
    expect(codes).toContain('es')
    expect(codes).toContain('th')
    expect(codes).toContain('ne')
    expect(codes).toContain('hi')
  })

  it('should have valid locale objects with required properties', () => {
    supportedLocales.forEach(locale => {
      expect(locale).toHaveProperty('code')
      expect(locale).toHaveProperty('name')
      expect(locale).toHaveProperty('flag')
      expect(locale).toHaveProperty('dir')
      expect(typeof locale.code).toBe('string')
      expect(typeof locale.name).toBe('string')
      expect(typeof locale.flag).toBe('string')
      expect(['ltr', 'rtl']).toContain(locale.dir)
    })
  })
})

describe('Locale Files', () => {
  it('should have all 8 locale files', () => {
    expect(Object.keys(localeFiles)).toHaveLength(8)
  })

  it('should have consistent structure across all locales', () => {
    const keys = Object.keys(en)
    Object.entries(localeFiles).forEach(([code, locale]) => {
      keys.forEach(key => {
        expect(locale).toHaveProperty(key)
      })
    })
  })

  it('should have all required top-level sections', () => {
    const requiredSections = [
      'common', 'nav', 'home', 'products', 'productDetail',
      'productCard', 'productVariants', 'cart', 'checkout', 'payment',
      'pixPayment', 'orderConfirmation', 'auth', 'profile', 'myOrders',
      'admin', 'toast', 'stores', 'theme'
    ]

    Object.entries(localeFiles).forEach(([code, locale]) => {
      requiredSections.forEach(section => {
        expect(locale).toHaveProperty(section)
      })
    })
  })

  it('should have non-empty translations for all keys', () => {
    Object.entries(localeFiles).forEach(([code, locale]) => {
      Object.entries(locale).forEach(([section, values]) => {
        Object.entries(values).forEach(([key, value]) => {
          if (typeof value === 'string') {
            expect(value).toBeTruthy()
            expect(value.length).toBeGreaterThan(0)
          } else if (typeof value === 'object') {
            Object.values(value).forEach(nestedValue => {
              if (typeof nestedValue === 'string') {
                expect(nestedValue).toBeTruthy()
                expect(nestedValue.length).toBeGreaterThan(0)
              }
            })
          }
        })
      })
    })
  })
})

describe('i18n Instance', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'pt-BR',
    messages: localeFiles,
    globalInjection: true
  })

  it('should be created with Composition API mode', () => {
    expect(i18n.mode).toBe('composition')
  })

  it('should have the correct initial locale', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.locale.value).toBe('en')
  })

  it('should have fallback locale configured', () => {
    expect(i18n.global.fallbackLocale.value).toBe('pt-BR')
  })

  it('should have all messages loaded', () => {
    Object.keys(localeFiles).forEach(code => {
      const messages = i18n.global.getLocaleMessage(code)
      expect(Object.keys(messages).length).toBeGreaterThan(0)
    })
  })
})

describe('Translation Functions', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'pt-BR',
    messages: localeFiles
  })

  it('should translate simple keys correctly in English', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('common.appName')).toBe('BhumiShop')
    expect(i18n.global.t('nav.home')).toBe('Home')
    expect(i18n.global.t('nav.products')).toBe('Products')
    expect(i18n.global.t('common.close')).toBe('Close')
  })

  it('should translate simple keys correctly in Portuguese', () => {
    i18n.global.locale.value = 'pt-BR'
    expect(i18n.global.t('common.appName')).toBe('BhumiShop')
    expect(i18n.global.t('nav.home')).toBe('Inicio')
    expect(i18n.global.t('nav.products')).toBe('Produtos')
    expect(i18n.global.t('common.close')).toBe('Fechar')
  })

  it('should translate simple keys correctly in Chinese', () => {
    i18n.global.locale.value = 'zh'
    expect(i18n.global.t('nav.home')).toBe('首页')
    expect(i18n.global.t('nav.products')).toBe('产品')
  })

  it('should translate simple keys correctly in Japanese', () => {
    i18n.global.locale.value = 'ja'
    expect(i18n.global.t('nav.home')).toBe('ホーム')
    expect(i18n.global.t('nav.products')).toBe('製品')
  })

  it('should translate simple keys correctly in Spanish', () => {
    i18n.global.locale.value = 'es'
    expect(i18n.global.t('nav.home')).toBe('Inicio')
    expect(i18n.global.t('nav.products')).toBe('Productos')
  })

  it('should handle interpolation correctly', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('common.copyright', { year: 2026 })).toContain('2026')
    expect(i18n.global.t('cart.cartCount', { count: 5 })).toContain('5')
    expect(i18n.global.t('productDetail.addedToCart', { name: 'Test Product' })).toContain('Test Product')
  })

  it('should handle pluralization correctly', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('products.productCount', { count: 1 })).toContain('1')
    expect(i18n.global.t('products.productCount', { count: 5 })).toContain('5')
  })
})

describe('Locale Detection', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should use stored locale from localStorage if available', () => {
    localStorage.setItem('locale', 'en')
    // Note: detectLocale reads from localStorage, but we can't mock navigator easily
    // This tests that the function runs without errors
    const detected = detectLocale()
    expect(typeof detected).toBe('string')
    expect(supportedLocales.map(l => l.code)).toContain(detected)
  })

  it('should return a valid locale even without localStorage', () => {
    localStorage.clear()
    const detected = detectLocale()
    expect(supportedLocales.map(l => l.code)).toContain(detected)
  })
})

describe('Language Switcher Component', () => {
  it('should import without errors', async () => {
    const { default: LanguageSwitcher } = await import('@/components/common/LanguageSwitcher.vue')
    expect(LanguageSwitcher).toBeDefined()
    expect(LanguageSwitcher.__name).toBe('LanguageSwitcher')
  })
})

describe('Nested Translation Keys', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'pt-BR',
    messages: localeFiles
  })

  it('should access checkout step labels', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('checkout.steps.cart')).toBe('Cart')
    expect(i18n.global.t('checkout.steps.info')).toBe('Information')
    expect(i18n.global.t('checkout.steps.payment')).toBe('Payment')
    expect(i18n.global.t('checkout.steps.confirmation')).toBe('Confirmation')
  })

  it('should access auth validation messages', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('auth.validation.phoneRequired')).toBe('Phone is required')
  })

  it('should access admin toast messages', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('admin.toast.productUpdated')).toBe('Product updated successfully')
    expect(i18n.global.t('admin.toast.productAdded')).toBe('Product added successfully')
  })

  it('should access store error messages', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('stores.products.loadError')).toBe('Error loading products')
    expect(i18n.global.t('stores.orders.createError')).toBe('Error creating order')
    expect(i18n.global.t('stores.checkout.paymentError')).toBe('Error processing payment')
  })
})

describe('Cross-locale Consistency', () => {
  it('should have the same number of keys in all locales', () => {
    const getKeysCount = (obj) => {
      let count = 0
      const traverse = (o) => {
        for (const key in o) {
          count++
          if (typeof o[key] === 'object' && o[key] !== null) {
            traverse(o[key])
          }
        }
      }
      traverse(obj)
      return count
    }

    const enCount = getKeysCount(en)
    Object.entries(localeFiles).forEach(([code, locale]) => {
      const localeCount = getKeysCount(locale)
      expect(localeCount).toBe(enCount)
    })
  })
})
