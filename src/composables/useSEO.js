import { watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Composable for managing SEO meta tags dynamically in Vue components
 * Usage: call useSEO() in any component with route-specific meta data
 */
export function useSEO(options = {}) {
  const { t, locale } = useI18n()

  const defaultConfig = {
    title: 'BhumiShop - Bhumisparsha School Virtual Store',
    description: 'Virtual store of Bhumisparsha School. Products with meaning, art and purpose.',
    keywords: 'BhumiShop, Bhumisparsha School, handcrafted products, virtual store',
    image: '/images/og-image.png',
    type: 'website',
    ...options
  }

  function updateMetaTags(config = {}) {
    const merged = { ...defaultConfig, ...config }

    nextTick(() => {
      // Update title
      document.title = merged.title

      // Update meta description
      updateOrCreateMeta('name', 'description', merged.description)

      // Update keywords
      updateOrCreateMeta('name', 'keywords', merged.keywords)

      // Update Open Graph tags
      updateOrCreateMeta('property', 'og:title', merged.title)
      updateOrCreateMeta('property', 'og:description', merged.description)
      updateOrCreateMeta('property', 'og:type', merged.type)
      updateOrCreateMeta('property', 'og:image', merged.image)

      // Update Twitter Card tags
      updateOrCreateMeta('name', 'twitter:title', merged.title)
      updateOrCreateMeta('name', 'twitter:description', merged.description)

      // Update canonical URL if provided
      if (merged.canonical) {
        updateOrCreateLink('canonical', merged.canonical)
      }

      // Update structured data if provided
      if (merged.structuredData) {
        updateStructuredData(merged.structuredData)
      }
    })
  }

  function updateOrCreateMeta(attributeName, attributeValue, content) {
    let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attributeName, attributeValue)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }

  function updateOrCreateLink(rel, href) {
    let element = document.querySelector(`link[rel="${rel}"]`)
    if (!element) {
      element = document.createElement('link')
      element.setAttribute('rel', rel)
      document.head.appendChild(element)
    }
    element.setAttribute('href', href)
  }

  function updateStructuredData(data) {
    // Remove existing structured data scripts
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      if (script.dataset.dynamic === 'true') {
        script.remove()
      }
    })

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.dynamic = 'true'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  // Product-specific meta tags
  function updateProductMeta(product) {
    updateMetaTags({
      title: `${product.name} - BhumiShop | Bhumisparsha School`,
      description: product.description || `Buy ${product.name} at BhumiShop - Bhumisparsha School Virtual Store`,
      keywords: `${product.name}, ${product.category}, BhumiShop, Bhumisparsha School`,
      type: 'product',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image,
        brand: {
          '@type': 'Organization',
          name: 'Bhumisparsha School'
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'BRL',
          availability: product.stock_type === 'in_stock'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/PreOrder'
        }
      }
    })
  }

  // Category-specific meta tags
  function updateCategoryMeta(categoryName) {
    updateMetaTags({
      title: `${categoryName} - BhumiShop | Bhumisparsha School`,
      description: `Browse ${categoryName} products at BhumiShop. Unique handcrafted items from Bhumisparsha School.`,
      keywords: `${categoryName}, BhumiShop, Bhumisparsha School, handcrafted`,
      type: 'website'
    })
  }

  return {
    updateMetaTags,
    updateProductMeta,
    updateCategoryMeta
  }
}

/**
 * Route-based SEO configuration for all pages
 */
export const routeSEO = {
  home: {
    title: 'BhumiShop - Bhumisparsha School Virtual Store | Handcrafted Products',
    description: 'Discover unique handcrafted products from Bhumisparsha School. Books, art, t-shirts, mugs, bags and accessories. Products with meaning, art and purpose.',
    keywords: 'BhumiShop, Bhumisparsha School, handcrafted products, virtual store, art, books, t-shirts, mugs, bags',
    type: 'website'
  },
  products: {
    title: 'Products - BhumiShop | Browse Handcrafted Items',
    description: 'Browse our complete catalog of handcrafted products. Filter by category, search and find unique items from Bhumisparsha School.',
    keywords: 'products, catalog, handcrafted, BhumiShop, Bhumisparsha School',
    type: 'website'
  },
  cart: {
    title: 'Shopping Cart - BhumiShop',
    description: 'Review your cart and proceed to checkout at BhumiShop.',
    type: 'website',
    noindex: true
  },
  checkout: {
    title: 'Checkout - BhumiShop',
    description: 'Complete your purchase at BhumiShop.',
    type: 'website',
    noindex: true
  },
  login: {
    title: 'Login / Register - BhumiShop',
    description: 'Login or create an account at BhumiShop to access your orders and checkout.',
    type: 'website'
  },
  profile: {
    title: 'My Profile - BhumiShop',
    description: 'Manage your account settings at BhumiShop.',
    type: 'website',
    noindex: true
  },
  orders: {
    title: 'My Orders - BhumiShop',
    description: 'Track your orders and view order history at BhumiShop.',
    type: 'website',
    noindex: true
  },
  admin: {
    title: 'Admin Panel - BhumiShop',
    description: 'Administrative dashboard for managing BhumiShop products and categories.',
    type: 'website',
    noindex: true
  },
  'not-found': {
    title: 'Page Not Found - BhumiShop',
    description: 'The page you are looking for does not exist.',
    type: 'website',
    noindex: true
  }
}
