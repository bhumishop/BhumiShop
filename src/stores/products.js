import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isDemo } from '../supabase'
import { t } from '../utils/storeI18n'

const PAGE_SIZE = 20

// Cache TTL: 5 minutes for product data
const CACHE_TTL = 5 * 60 * 1000
let productsCache = null
let categoriesCache = null
let cacheTimestamp = 0

/**
 * Normalize category matching to handle singular/plural inconsistencies.
 * Products may have category='camiseta' while categories table has id='camisetas'.
 */
function normalizeCategoryMatch(productCat, categoryId) {
  if (productCat === categoryId) return true
  const normalize = (s) => String(s).toLowerCase()
    .replace(/s$/, '')
    .replace(/es$/, 'e')
  return normalize(productCat) === normalize(categoryId)
}

/**
 * Check if cache is still valid
 */
function isCacheValid() {
  return productsCache && categoriesCache && (Date.now() - cacheTimestamp) < CACHE_TTL
}

/**
 * Clear the data cache
 */
function clearCache() {
  productsCache = null
  categoriesCache = null
  cacheTimestamp = 0
}

// Mock data for demo mode
const mockCategories = [
  { id: 1, name: 'Camisetas' },
  { id: 2, name: 'Acessórios' },
  { id: 3, name: 'Arte' }
]

const mockProducts = [
  {
    id: 1,
    name: 'Camiseta Bhumisparsha - Buddha Touching Earth',
    category: 1,
    price: 79.90,
    description: 'Camiseta premium com a icônica imagem do Buddha Bhumisparsha. Algodão orgânico 180g, estampa em serigrafia de alta qualidade.',
    stock_type: 'print-on-demand',
    stock_quantity: 0,
    image: '/mock/tshirt-bhumisparsha.jpg',
    artist: 'Bhumisparsha Design',
    info: '100% algodão orgânico\nEstampa em serigrafia\nDisponível em P, M, G, GG',
    materials: ['algodão'],
    tags: ['buddha', 'camiseta'],
    fulfillment_type: 'own',
    weight: 0.3,
    dimensions: { width: 30, height: 40, depth: 2 },
    shipping_zones: ['BR'],
    compare_at_price: null,
    short_description: null,
    brand: null,
    slug: 'camiseta-bhumisparsha',
    is_featured: false
  },
  {
    id: 2,
    name: 'Caneca Meditação Zen',
    category: 2,
    price: 49.90,
    description: 'Caneca de cerâmica artesanal com design zen de meditação. Capacidade 350ml.',
    stock_type: 'in-stock',
    stock_quantity: 50,
    image: '/mock/mug-zen.jpg',
    artist: 'Studio Cerâmica',
    info: 'Cerâmica artesanal\nCapacidade 350ml\nPode ir ao micro-ondas',
    materials: ['cerâmica'],
    tags: ['zen', 'caneca'],
    fulfillment_type: 'own',
    weight: 0.4,
    dimensions: { width: 12, height: 15, depth: 12 },
    shipping_zones: ['BR'],
    compare_at_price: null,
    short_description: null,
    brand: null,
    slug: 'caneca-meditacao-zen',
    is_featured: false
  },
  {
    id: 3,
    name: 'Poster Mandala Dharma Wheel',
    category: 3,
    price: 39.90,
    description: 'Poster artístico com a Roda do Dharma em estilo mandala. Impressão em papel couchê 250g.',
    stock_type: 'print-on-demand',
    stock_quantity: 0,
    image: '/mock/poster-dharma.jpg',
    artist: 'Bhumisparsha Art',
    info: 'Papel couchê 250g\nImpressão HD\nTamanho A3 (297x420mm)',
    materials: ['papel'],
    tags: ['mandala', 'poster'],
    fulfillment_type: 'own',
    weight: 0.1,
    dimensions: { width: 32, height: 45, depth: 1 },
    shipping_zones: ['BR'],
    compare_at_price: null,
    short_description: null,
    brand: null,
    slug: 'poster-mandala-dharma-wheel',
    is_featured: false
  },
  {
    id: 4,
    name: 'Camiseta Lotus Sutra',
    category: 1,
    price: 84.90,
    description: 'Camiseta com estampa do Sutra de Lótus em caligrafia tradicional. Design exclusivo.',
    stock_type: 'print-on-demand',
    stock_quantity: 0,
    image: '/mock/tshirt-lotus.jpg',
    artist: 'Calligraphy Studio',
    info: 'Algodão premium 180g\nEstampa DTG\nP, M, G, GG, XGG',
    materials: ['algodão'],
    tags: ['lotus', 'camiseta'],
    fulfillment_type: 'own',
    weight: 0.3,
    dimensions: { width: 30, height: 40, depth: 2 },
    shipping_zones: ['BR'],
    compare_at_price: null,
    short_description: null,
    brand: null,
    slug: 'camiseta-lotus-sutra',
    is_featured: false
  },
  {
    id: 5,
    name: 'Ecobag Eightfold Path',
    category: 2,
    price: 34.90,
    description: 'Ecobag de algodão cru com o Nobre Caminho Óctuplo. Resistente e sustentável.',
    stock_type: 'in-stock',
    stock_quantity: 100,
    image: '/mock/ecobag-eightfold.jpg',
    artist: 'Bhumisparsha Design',
    info: 'Algodão cru 300g\nAlças reforçadas\n40x35cm',
    materials: ['algodão'],
    tags: ['ecobag', 'eightfold'],
    fulfillment_type: 'own',
    weight: 0.15,
    dimensions: { width: 40, height: 35, depth: 1 },
    shipping_zones: ['BR'],
    compare_at_price: null,
    short_description: null,
    brand: null,
    slug: 'ecobag-eightfold-path',
    is_featured: false
  },
  {
    id: 6,
    name: 'Print Digital - Buddha Art',
    category: 3,
    price: 19.90,
    description: 'Arte digital em alta resolução para impressão pessoal. Formato PNG 300dpi.',
    stock_type: 'digital',
    stock_quantity: 999,
    image: '/mock/digital-buddha.jpg',
    artist: 'Digital Art Studio',
    info: 'Arquivo digital PNG\n300dpi\nTamanho A4',
    materials: [],
    tags: ['digital', 'buddha'],
    fulfillment_type: 'digital',
    weight: 0,
    dimensions: null,
    shipping_zones: null,
    compare_at_price: null,
    short_description: null,
    brand: null,
    slug: 'print-digital-buddha-art',
    is_featured: false
  }
]

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const categories = ref([])
  const collections = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const activeCategory = ref('')
  const currentPage = ref(1)
  const totalCount = ref(0)
  const maxPrice = ref(null) // null means no price filter
  const minPrice = ref(null) // null means no minimum price filter
  const activeCollections = ref([]) // array of collection IDs to filter by

  // Cache for related products to avoid recomputation
  const relatedProductsCache = new Map()
  let cacheVersion = 0

  // These are regular functions, not computed, since they return functions
  // Using computed for function-returning is an anti-pattern
  function getProductById(id) {
    return products.value.find(p => p.id === parseInt(id))
  }

  function getProductsByCategory(category) {
    if (category === 'todos' || !category) return products.value
    return products.value.filter(p => p.category && normalizeCategoryMatch(p.category, category))
  }

  // Invalidate cache when products change
  function invalidateRelatedCache() {
    cacheVersion++
    relatedProductsCache.clear()
  }

  // Optimized related products with caching (regular function, not computed)
  function getRelatedProducts(productId, limit = 8) {
    const cacheKey = `${productId}-${limit}-v${cacheVersion}`
    if (relatedProductsCache.has(cacheKey)) {
      return relatedProductsCache.get(cacheKey)
    }

    const product = products.value.find(p => p.id === parseInt(productId))
    if (!product) return []

    const otherProducts = products.value.filter(p => p.id !== parseInt(productId))

    // Pre-compute product words once to avoid recomputation per product
    const productWords = product.name
      ? new Set(product.name.toLowerCase().split(/\s+/).filter(w => w.length > 2))
      : new Set()

    // Score each product based on matching criteria
    const scored = otherProducts.map(p => {
      let score = 0

      // Tags match (highest priority)
      if (product.tags && p.tags && Array.isArray(product.tags) && Array.isArray(p.tags)) {
        const commonTags = product.tags.filter(tag => p.tags.includes(tag))
        score += commonTags.length * 10
      }

      // Same collection
      if (product.collection_id && p.collection_id && product.collection_id === p.collection_id) {
        score += 15
      }

      // Same subcollection
      if (product.subcollection_id && p.subcollection_id && product.subcollection_id === p.subcollection_id) {
        score += 20
      }

      // Same category (legacy)
      if (product.category && p.category && product.category === p.category) {
        score += 5
      }

      // Similar name (word overlap) - use pre-computed words
      if (p.name && productWords.size > 0) {
        const otherWords = p.name.toLowerCase().split(/\s+/).filter(w => productWords.has(w))
        score += otherWords.length * 3
      }

      // Similar price range (within 30%) - use ratio instead of division
      if (product.price && p.price) {
        const priceRatio = p.price / product.price
        if (priceRatio >= 0.7 && priceRatio <= 1.3) {
          score += 4
        } else if (priceRatio >= 0.5 && priceRatio <= 1.5) {
          score += 2
        }
      }

      // Same artist
      if (product.artist && p.artist && product.artist === p.artist) {
        score += 6
      }

      return { product: p, score }
    })

    // Sort by score descending and return top N
    const result = scored
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0)
      .slice(0, limit)
      .map(item => item.product)

    relatedProductsCache.set(cacheKey, result)
    return result
  }

  const filteredProducts = computed(() => {
    let result = products.value.filter(p => p.is_active !== false && p.is_archived !== true)

    if (activeCategory.value && activeCategory.value !== 'todos') {
      result = result.filter(p => p.category && normalizeCategoryMatch(p.category, activeCategory.value))
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.artist?.toLowerCase().includes(query)
      )
    }

    // Apply price filter if set
    if (minPrice.value !== null && minPrice.value !== undefined) {
      result = result.filter(p => p.price >= minPrice.value)
    }
    if (maxPrice.value !== null && maxPrice.value !== undefined) {
      result = result.filter(p => p.price <= maxPrice.value)
    }

    // Apply collection filter if set
    if (activeCollections.value.length > 0) {
      result = result.filter(p =>
        p.collection_id && activeCollections.value.includes(p.collection_id)
      )
    }

    return result
  })

  const totalPages = computed(() => Math.ceil(filteredProducts.value.length / PAGE_SIZE))

  /** Categories that have at least one active, non-archived product, with product count */
  const categoriesWithProducts = computed(() => {
    const counts = {}
    products.value
      .filter(p => p.is_active !== false && p.is_archived !== true && p.category)
      .forEach(p => {
        // Normalize to match category IDs (try both singular and plural)
        const cat = p.category
        categories.value.forEach(c => {
          if (normalizeCategoryMatch(cat, c.id)) {
            counts[c.id] = (counts[c.id] || 0) + 1
          }
        })
      })

    return categories.value
      .filter(c => c.is_active !== false && counts[c.id] > 0)
      .map(c => ({ ...c, productCount: counts[c.id] || 0 }))
      .sort((a, b) => a.sort_order - b.sort_order)
  })

  /** Get product count for a specific category ID */
  function getCategoryProductCount(catId) {
    return products.value
      .filter(p => p.is_active !== false && p.is_archived !== true && p.category && normalizeCategoryMatch(p.category, catId))
      .length
  }

  /** Collections that have at least one active, non-archived product, with product count */
  const collectionsWithProducts = computed(() => {
    const counts = {}
    products.value
      .filter(p => p.is_active !== false && p.is_archived !== true && p.collection_id)
      .forEach(p => {
        const collId = p.collection_id
        collections.value.forEach(c => {
          if (c.id === collId) {
            counts[c.id] = (counts[c.id] || 0) + 1
          }
        })
      })

    return collections.value
      .filter(c => c.is_active !== false && counts[c.id] > 0)
      .map(c => ({ ...c, productCount: counts[c.id] || 0 }))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  })

  /** Total count of active, non-archived products */
  const activeProductCount = computed(() =>
    products.value.filter(p => p.is_active !== false && p.is_archived !== true).length
  )

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredProducts.value.slice(start, start + PAGE_SIZE)
  })

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      if (isDemo) {
        // In demo mode, use mock data but log clearly
        console.warn('[Products] Running in demo mode - using mock data. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY for production.')
        products.value = mockProducts
        totalCount.value = mockProducts.length
        invalidateRelatedCache()
        return
      }

      // Check cache first
      if (isCacheValid() && productsCache) {
        products.value = productsCache
        totalCount.value = productsCache.length
        loading.value = false
        return
      }

      // Only select columns that actually exist in the database schema
      const { data, error: err } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          category,
          price,
          compare_at_price,
          description,
          short_description,
          stock_type,
          stock_quantity,
          fulfillment_type,
          image,
          images,
          color_swatches,
          artist,
          brand,
          info,
          materials,
          tags,
          weight,
          dimensions,
          shipping_zones,
          collection_id,
          subcollection_id,
          is_active,
          is_featured,
          is_archived,
          created_at
        `, { count: 'exact' })
        .order('id', { ascending: false })

      if (err) throw err
      products.value = data || []
      totalCount.value = data?.length || 0

      // Update cache
      productsCache = products.value
      cacheTimestamp = Date.now()
      invalidateRelatedCache()
    } catch (err) {
      error.value = err.message || t('stores.products.loadError')
      console.error('[Products] fetchProducts error:', err)
      // Only fall back to mock data if we have no products loaded yet
      if (products.value.length === 0) {
        console.warn('[Products] Falling back to mock data due to error')
        products.value = mockProducts
        totalCount.value = mockProducts.length
        invalidateRelatedCache()
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    error.value = null
    try {
      if (isDemo) {
        // Use mock categories in demo mode
        categories.value = mockCategories
        return
      }

      // Check cache first
      if (isCacheValid() && categoriesCache) {
        categories.value = categoriesCache
        return
      }

      // Only select columns that are actually used
      const { data, error: err } = await supabase
        .from('categories')
        .select('id, name, is_active, sort_order')
        .order('name')

      if (err) throw err
      categories.value = data || []

      // Update cache
      categoriesCache = categories.value
      cacheTimestamp = Date.now()
    } catch (err) {
      error.value = err.message || t('stores.products.loadCategoriesError')
      console.error('fetchCategories error:', err)
    }
  }

  async function fetchCollections() {
    error.value = null
    try {
      if (isDemo) {
        collections.value = []
        return
      }

      const { data, error: err } = await supabase
        .from('collections')
        .select('id, name, is_active, sort_order')
        .order('sort_order')

      if (err) throw err
      collections.value = data || []
    } catch (err) {
      console.error('fetchCollections error:', err)
      collections.value = []
    }
  }

  async function addProduct(product) {
    if (isDemo) {
      throw new Error('Adding products is not available in demo mode')
    }
    error.value = null
    try {
      const productData = {
        name: (product.name || '').trim(),
        category: product.category,
        price: parseFloat(product.price) || 0,
        description: (product.description || '').trim(),
        stock_type: product.stock_type || 'print-on-demand',
        stock_quantity: product.stock_quantity ?? 0,
        image: product.image || '',
        images: product.images || [],
        color_swatches: product.color_swatches || [],
        artist: (product.artist || '').trim(),
        info: (product.info || '').trim(),
        materials: product.materials || null,
        tags: product.tags || [],
        fulfillment_type: product.fulfillment_type || 'own',
        weight: parseFloat(product.weight) || 0.3,
        dimensions: product.dimensions || null,
        shipping_zones: product.shipping_zones || null
      }

      const { data, error: err } = await supabase
        .from('products')
        .insert([productData])
        .select()

      if (err) throw err
      if (data && data[0]) {
        products.value.unshift(data[0])
        clearCache()
        invalidateRelatedCache()
      }
      return data?.[0]
    } catch (err) {
      error.value = err.message || t('stores.products.addError')
      console.error('addProduct error:', err)
      throw err
    }
  }

  async function updateProduct(id, updates) {
    if (isDemo) {
      throw new Error('Updating products is not available in demo mode')
    }
    error.value = null
    try {
      const productData = {
        name: (updates.name || '').trim(),
        category: updates.category,
        price: parseFloat(updates.price) || 0,
        description: (updates.description || '').trim(),
        stock_type: updates.stock_type || 'print-on-demand',
        stock_quantity: updates.stock_quantity ?? 0,
        image: updates.image || '',
        images: updates.images || [],
        color_swatches: updates.color_swatches || [],
        artist: (updates.artist || '').trim(),
        info: (updates.info || '').trim(),
        materials: updates.materials || null,
        tags: updates.tags || [],
        fulfillment_type: updates.fulfillment_type || 'own',
        weight: parseFloat(updates.weight) || 0.3,
        dimensions: updates.dimensions || null,
        shipping_zones: updates.shipping_zones || null
      }

      const { data, error: err } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()

      if (err) throw err
      if (data && data[0]) {
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index] = data[0]
          invalidateRelatedCache()
        }
      }
      return data?.[0]
    } catch (err) {
      error.value = err.message || t('stores.products.updateError')
      console.error('updateProduct error:', err)
      throw err
    }
  }

  async function deleteProduct(id) {
    if (isDemo) {
      throw new Error('Deleting products is not available in demo mode')
    }
    error.value = null
    try {
      const { error: err } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (err) throw err
      products.value = products.value.filter(p => p.id !== id)
      invalidateRelatedCache()
    } catch (err) {
      error.value = err.message || t('stores.products.deleteError')
      console.error('deleteProduct error:', err)
      throw err
    }
  }

  async function addCategory(category) {
    if (isDemo) {
      throw new Error('Adding categories is not available in demo mode')
    }
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('categories')
        .insert([category])
        .select()

      if (err) throw err
      if (data && data[0]) {
        categories.value.push(data[0])
      }
      return data?.[0]
    } catch (err) {
      error.value = err.message || t('stores.products.addCategoryError')
      console.error('addCategory error:', err)
      throw err
    }
  }

  async function deleteCategory(id) {
    if (isDemo) {
      throw new Error('Deleting categories is not available in demo mode')
    }
    error.value = null
    try {
      const { error: err } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (err) throw err
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err.message || t('stores.products.deleteCategoryError')
      console.error('deleteCategory error:', err)
      throw err
    }
  }

  function setSearchQuery(query) {
    searchQuery.value = query
    currentPage.value = 1
  }

  function setActiveCategory(category) {
    activeCategory.value = category
    currentPage.value = 1
  }

  function setMaxPrice(price) {
    maxPrice.value = price
    currentPage.value = 1
  }

  function setMinPrice(price) {
    minPrice.value = price
    currentPage.value = 1
  }

  function setPriceRange(min, max) {
    minPrice.value = min
    maxPrice.value = max
    currentPage.value = 1
  }

  function setActiveCollections(collections) {
    activeCollections.value = Array.isArray(collections) ? collections : [collections]
    currentPage.value = 1
  }

  function toggleCollection(collectionId) {
    const idx = activeCollections.value.indexOf(collectionId)
    if (idx === -1) {
      activeCollections.value.push(collectionId)
    } else {
      activeCollections.value.splice(idx, 1)
    }
    currentPage.value = 1
  }

  function clearFilters() {
    minPrice.value = null
    maxPrice.value = null
    activeCollections.value = []
    activeCategory.value = ''
    searchQuery.value = ''
    currentPage.value = 1
  }

  function setPage(page) {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  return {
    products,
    categories,
    collections,
    loading,
    error,
    searchQuery,
    activeCategory,
    currentPage,
    totalCount,
    totalPages,
    minPrice,
    maxPrice,
    activeCollections,
    getProductById,
    getProductsByCategory,
    getRelatedProducts,
    filteredProducts,
    paginatedProducts,
    categoriesWithProducts,
    collectionsWithProducts,
    getCategoryProductCount,
    activeProductCount,
    fetchProducts,
    fetchCategories,
    fetchCollections,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    setSearchQuery,
    setActiveCategory,
    setMaxPrice,
    setMinPrice,
    setPriceRange,
    setActiveCollections,
    toggleCollection,
    clearFilters,
    setPage
  }
})
