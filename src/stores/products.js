import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import { i18n } from '../i18n'

const PAGE_SIZE = 20
const t = (key) => i18n.global.t(key)

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const activeCategory = ref('')
  const currentPage = ref(1)
  const totalCount = ref(0)

  const getProductById = computed(() => {
    return (id) => products.value.find(p => p.id === parseInt(id))
  })

  const getProductsByCategory = computed(() => {
    return (category) => {
      if (category === 'todos' || !category) return products.value
      return products.value.filter(p => p.category && p.category.toString() === category.toString())
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
    error.value = null
    try {
      const productData = {
        name: (product.name || '').trim(),
        category: product.category,
        price: parseFloat(product.price) || 0,
        description: (product.description || '').trim(),
        stock: product.stock || 'print-on-demand',
        image: product.image || '',
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
    error.value = null
    try {
      const productData = {
        name: (updates.name || '').trim(),
        category: updates.category,
        price: parseFloat(updates.price) || 0,
        description: (updates.description || '').trim(),
        stock: updates.stock || 'print-on-demand',
        image: updates.image || '',
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
    setPage
  }
})
