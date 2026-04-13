import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isDemo } from '../supabase'
import { i18n } from '../i18n'

const PAGE_SIZE = 20
const t = (key) => i18n.global.t(key)

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
    stock: 'print-on-demand',
    image: '/mock/tshirt-bhumisparsha.jpg',
    artist: 'Bhumisparsha Design',
    info: '100% algodão orgânico\nEstampa em serigrafia\nDisponível em P, M, G, GG',
    sizes: ['P', 'M', 'G', 'GG'],
    fulfillment_type: 'own',
    weight: 0.3,
    dimensions: { width: 30, height: 40, depth: 2 },
    shipping_zones: ['BR']
  },
  {
    id: 2,
    name: 'Caneca Meditação Zen',
    category: 2,
    price: 49.90,
    description: 'Caneca de cerâmica artesanal com design zen de meditação. Capacidade 350ml.',
    stock: 'in-stock',
    image: '/mock/mug-zen.jpg',
    artist: 'Studio Cerâmica',
    info: 'Cerâmica artesanal\nCapacidade 350ml\nPode ir ao micro-ondas',
    fulfillment_type: 'own',
    weight: 0.4,
    dimensions: { width: 12, height: 15, depth: 12 },
    shipping_zones: ['BR']
  },
  {
    id: 3,
    name: 'Poster Mandala Dharma Wheel',
    category: 3,
    price: 39.90,
    description: 'Poster artístico com a Roda do Dharma em estilo mandala. Impressão em papel couchê 250g.',
    stock: 'print-on-demand',
    image: '/mock/poster-dharma.jpg',
    artist: 'Bhumisparsha Art',
    info: 'Papel couchê 250g\nImpressão HD\nTamanho A3 (297x420mm)',
    fulfillment_type: 'own',
    weight: 0.1,
    dimensions: { width: 32, height: 45, depth: 1 },
    shipping_zones: ['BR']
  },
  {
    id: 4,
    name: 'Camiseta Lotus Sutra',
    category: 1,
    price: 84.90,
    description: 'Camiseta com estampa do Sutra de Lótus em caligrafia tradicional. Design exclusivo.',
    stock: 'print-on-demand',
    image: '/mock/tshirt-lotus.jpg',
    artist: 'Calligraphy Studio',
    info: 'Algodão premium 180g\nEstampa DTG\nP, M, G, GG, XGG',
    sizes: ['P', 'M', 'G', 'GG', 'XGG'],
    fulfillment_type: 'own',
    weight: 0.3,
    dimensions: { width: 30, height: 40, depth: 2 },
    shipping_zones: ['BR']
  },
  {
    id: 5,
    name: 'Ecobag Eightfold Path',
    category: 2,
    price: 34.90,
    description: 'Ecobag de algodão cru com o Nobre Caminho Óctuplo. Resistente e sustentável.',
    stock: 'in-stock',
    image: '/mock/ecobag-eightfold.jpg',
    artist: 'Bhumisparsha Design',
    info: 'Algodão cru 300g\nAlças reforçadas\n40x35cm',
    fulfillment_type: 'own',
    weight: 0.15,
    dimensions: { width: 40, height: 35, depth: 1 },
    shipping_zones: ['BR']
  },
  {
    id: 6,
    name: 'Print Digital - Buddha Art',
    category: 3,
    price: 19.90,
    description: 'Arte digital em alta resolução para impressão pessoal. Formato PNG 300dpi.',
    stock: 'digital',
    image: '/mock/digital-buddha.jpg',
    artist: 'Digital Art Studio',
    info: 'Arquivo digital PNG\n300dpi\nTamanho A4',
    fulfillment_type: 'digital',
    weight: 0,
    dimensions: null,
    shipping_zones: null
  }
]

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const activeCategory = ref('')
  const currentPage = ref(1)
  const totalCount = ref(0)
  const maxPrice = ref(null) // null means no price filter

  const getProductById = computed(() => {
    return (id) => products.value.find(p => p.id === parseInt(id))
  })

  const getProductsByCategory = computed(() => {
    return (category) => {
      if (category === 'todos' || !category) return products.value
      return products.value.filter(p => p.category && p.category.toString() === category.toString())
    }
  })

  const getRelatedProducts = computed(() => {
    return (productId, limit = 8) => {
      const product = products.value.find(p => p.id === parseInt(productId))
      if (!product) return []

      const otherProducts = products.value.filter(p => p.id !== parseInt(productId))

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

        // Similar name (word overlap)
        if (product.name && p.name) {
          const productWords = new Set(product.name.toLowerCase().split(/\s+/).filter(w => w.length > 2))
          const otherWords = p.name.toLowerCase().split(/\s+/).filter(w => productWords.has(w))
          score += otherWords.length * 3
        }

        // Similar price range (within 30%)
        if (product.price && p.price) {
          const priceDiff = Math.abs(product.price - p.price) / product.price
          if (priceDiff <= 0.3) {
            score += 4
          } else if (priceDiff <= 0.5) {
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
      return scored
        .sort((a, b) => b.score - a.score)
        .filter(item => item.score > 0)
        .slice(0, limit)
        .map(item => item.product)
    }
  })

  const filteredProducts = computed(() => {
    let result = products.value

    if (activeCategory.value && activeCategory.value !== 'todos') {
      result = result.filter(p => p.category && p.category.toString() === activeCategory.value.toString())
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
    if (maxPrice.value !== null && maxPrice.value !== undefined) {
      result = result.filter(p => p.price <= maxPrice.value)
    }

    return result
  })

  const totalPages = computed(() => Math.ceil(filteredProducts.value.length / PAGE_SIZE))

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredProducts.value.slice(start, start + PAGE_SIZE)
  })

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      if (isDemo) {
        // Use mock data in demo mode
        products.value = mockProducts
        totalCount.value = mockProducts.length
        return
      }

      const { data, error: err } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })

      if (err) throw err
      products.value = data || []
      totalCount.value = data?.length || 0
    } catch (err) {
      error.value = err.message || t('stores.products.loadError')
      console.error('fetchProducts error:', err)
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

      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (err) throw err
      categories.value = data || []
    } catch (err) {
      error.value = err.message || t('stores.products.loadCategoriesError')
      console.error('fetchCategories error:', err)
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
        stock: product.stock || 'print-on-demand',
        image: product.image || '',
        images: product.images || [],
        color_swatches: product.color_swatches || [],
        artist: (product.artist || '').trim(),
        info: (product.info || '').trim(),
        sizes: product.sizes || null,
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
        stock: updates.stock || 'print-on-demand',
        image: updates.image || '',
        images: updates.images || [],
        color_swatches: updates.color_swatches || [],
        artist: (updates.artist || '').trim(),
        info: (updates.info || '').trim(),
        sizes: updates.sizes || null,
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

  function setPage(page) {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  return {
    products,
    categories,
    loading,
    error,
    searchQuery,
    activeCategory,
    currentPage,
    totalCount,
    totalPages,
    getProductById,
    getProductsByCategory,
    getRelatedProducts,
    filteredProducts,
    paginatedProducts,
    fetchProducts,
    fetchCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    setSearchQuery,
    setActiveCategory,
    setMaxPrice,
    setPage
  }
})
