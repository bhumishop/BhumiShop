<template>
  <div class="admin-page container">
    <div class="admin-page__header">
      <h1 class="admin-page__title">{{ $t('admin.title') }}</h1>
      <BaseButton variant="primary" @click="openAddModal">{{ $t('admin.addProduct') }}</BaseButton>
    </div>

    <div class="admin-page__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['admin-page__tab', { 'admin-page__tab--active': activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Products Tab -->
    <div v-if="activeTab === 'products'" class="admin-section">
      <div class="admin-section__filters">
        <select v-model="filterCategory" class="admin-select">
          <option value="">{{ $t('admin.filters.allCategories') }}</option>
          <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <input v-model="searchQuery" type="text" :placeholder="$t('admin.filters.searchProduct')" class="admin-input" />
      </div>

      <div v-if="productStore.loading" class="admin-section__loading">
        <BaseSkeleton variant="text" />
        <BaseSkeleton variant="text" />
        <BaseSkeleton variant="text" />
      </div>

      <div v-else-if="filteredProducts.length === 0" class="admin-section__empty">
        <p>{{ $t('admin.empty') }}</p>
      </div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ $t('admin.table.name') }}</th>
              <th>{{ $t('admin.table.category') }}</th>
              <th>{{ $t('admin.table.price') }}</th>
              <th>{{ $t('admin.table.stock') }}</th>
              <th>{{ $t('admin.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>
                <div class="admin-product-cell">
                  <div class="admin-product-cell__img">
                    <img v-if="product.image && (product.image.startsWith('data:') || product.image.startsWith('http'))" :src="product.image" :alt="product.name" />
                    <span v-else>{{ product.name?.charAt(0) || '?' }}</span>
                  </div>
                  <span class="admin-product-cell__name">{{ product.name }}</span>
                </div>
              </td>
              <td><BaseBadge variant="accent" size="xs">{{ getCategoryName(product.category) }}</BaseBadge></td>
              <td class="admin-mono">R$ {{ formatPrice(product.price) }}</td>
              <td>
                <BaseBadge :variant="product.stock_type === 'print-on-demand' ? 'default' : 'success'" size="xs">
                  {{ product.stock_type === 'print-on-demand' ? $t('admin.stock.onDemand') : $t('admin.stock.inStock') }}
                </BaseBadge>
              </td>
              <td>
                <div class="admin-actions">
                  <button class="admin-actions__btn admin-actions__btn--edit" @click="editProduct(product)" :title="$t('common.edit')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="admin-actions__btn admin-actions__btn--delete" @click="deleteProduct(product.id)" :title="$t('common.delete')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Categories Tab -->
    <div v-if="activeTab === 'categories'" class="admin-section">
      <div class="admin-categories">
        <div v-for="cat in productStore.categories" :key="cat.id" class="admin-category-card">
          <span>{{ cat.icon }} {{ cat.name }}</span>
          <button class="admin-actions__btn admin-actions__btn--delete" @click="handleDeleteCategory(cat.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="admin-category-card admin-category-card--add">
          <input v-model="newCategoryName" :placeholder="$t('admin.modal.newCategory')" @keyup.enter="handleAddCategory" />
          <BaseButton variant="secondary" size="sm" @click="handleAddCategory">{{ $t('common.add') }}</BaseButton>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <BaseModal v-model="showModal" :title="editingProduct ? $t('admin.modal.editProduct') : $t('admin.modal.newProduct')" size="lg">
      <form class="admin-form" @submit.prevent="handleSaveProduct">
        <BaseInput v-model="productForm.name" :label="$t('admin.modal.productName')" required />
        <div class="admin-form__row">
          <div class="admin-form__field">
            <label class="admin-form__label">{{ $t('admin.modal.category') }}</label>
            <select v-model="productForm.category" required class="admin-select">
              <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <BaseInput v-model.number="productForm.price" :label="$t('admin.modal.price')" type="number" step="0.01" required />
        </div>
        <div class="admin-form__row">
          <div class="admin-form__field">
            <label class="admin-form__label">{{ $t('admin.modal.stockType') }}</label>
            <select v-model="productForm.stock_type" class="admin-select">
              <option value="print-on-demand">{{ $t('admin.stock.onDemand') }}</option>
              <option value="in-stock">{{ $t('admin.stock.inStock') }}</option>
              <option value="digital">{{ $t('productDetail.digital') }}</option>
            </select>
          </div>
        </div>
        <div class="admin-form__row">
          <div class="admin-form__field">
            <label class="admin-form__label">{{ $t('admin.modal.description') }}</label>
            <textarea v-model="productForm.description" rows="3" class="admin-textarea"></textarea>
          </div>
        </div>
        <div class="admin-form__row">
          <div class="admin-form__field">
            <label class="admin-form__label">{{ $t('admin.modal.image') }}</label>
            <input type="file" accept="image/*" @change="handleImageUpload" class="admin-file" />
            <input v-model="productForm.image" :placeholder="$t('admin.modal.imagePlaceholder')" class="admin-input" />
          </div>
        </div>
        <BaseInput v-model="productForm.artist" :label="$t('admin.modal.artist')" :placeholder="$t('admin.modal.artistPlaceholder')" />
        <BaseInput v-model="productForm.info" :label="$t('admin.modal.additionalInfo')" />
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ $t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="handleSaveProduct">
          {{ editingProduct ? $t('common.save') : $t('common.add') }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '../stores/products'
import { useToastStore } from '../stores/toast'
import BaseButton from '../components/common/BaseButton.vue'
import BaseBadge from '../components/common/BaseBadge.vue'
import BaseModal from '../components/common/BaseModal.vue'
import BaseInput from '../components/common/BaseInput.vue'
import BaseSkeleton from '../components/common/BaseSkeleton.vue'

const productStore = useProductStore()
const toast = useToastStore()
const { t } = useI18n()

const activeTab = ref('products')
const searchQuery = ref('')
const filterCategory = ref('')
const showModal = ref(false)
const editingProduct = ref(null)
const saving = ref(false)
const newCategoryName = ref('')

const tabs = computed(() => [
  { key: 'products', label: t('admin.tabs.products') },
  { key: 'categories', label: t('admin.tabs.categories') }
])

const defaultForm = {
  name: '',
  category: '',
  price: '',
  description: '',
  stock_type: 'print-on-demand',
  image: '',
  artist: '',
  info: ''
}

const productForm = reactive({ ...defaultForm })

const filteredProducts = computed(() => {
  let result = productStore.products
  if (filterCategory.value) {
    result = result.filter(p => p.category === filterCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.artist?.toLowerCase().includes(q)
    )
  }
  return result
})

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])
})

function getCategoryName(catId) {
  const cat = productStore.categories.find(c => c.id === catId)
  return cat?.name || catId || ''
}

function formatPrice(val) {
  return Number(val).toFixed(2).replace('.', ',')
}

function openAddModal() {
  editingProduct.value = null
  Object.assign(productForm, defaultForm)
  showModal.value = true
}

function editProduct(product) {
  editingProduct.value = product
  Object.assign(productForm, {
    name: product.name || '',
    category: product.category || '',
    price: product.price || '',
    description: product.description || '',
    stock_type: product.stock_type || 'print-on-demand',
    image: product.image || '',
    artist: product.artist || '',
    info: product.info || ''
  })
  showModal.value = true
}

function closeModal() {
  if (editingProduct.value || showModal.value) {
    showModal.value = false
    editingProduct.value = null
    Object.assign(productForm, defaultForm)
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('admin.toast.imageTooLarge'))
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      productForm.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function handleSaveProduct() {
  if (!productForm.name.trim()) {
    toast.error(t('admin.toast.nameRequired'))
    return
  }

  saving.value = true
  try {
    const data = {
      name: productForm.name.trim(),
      category: productForm.category,
      price: parseFloat(productForm.price) || 0,
      description: productForm.description.trim(),
      stock_type: productForm.stock_type,
      image: productForm.image.trim(),
      artist: productForm.artist.trim(),
      info: productForm.info.trim()
    }

    if (editingProduct.value) {
      await productStore.updateProduct(editingProduct.value.id, data)
      toast.success(t('admin.toast.productUpdated'))
    } else {
      await productStore.addProduct(data)
      toast.success(t('admin.toast.productAdded'))
    }

    closeModal()
  } catch (err) {
    toast.error(err.message || t('admin.toast.saveError'))
  } finally {
    saving.value = false
  }
}

async function deleteProduct(id) {
  if (!confirm(t('admin.confirmations.deleteProduct'))) return
  try {
    await productStore.deleteProduct(id)
    toast.success(t('admin.toast.productDeleted'))
  } catch (err) {
    toast.error(err.message || t('admin.toast.deleteError'))
  }
}

async function handleAddCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return

  try {
    const id = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '-')
    await productStore.addCategory({ id, name, icon: '📦' })
    newCategoryName.value = ''
    toast.success(t('admin.toast.categoryAdded'))
  } catch (err) {
    toast.error(err.message || t('admin.toast.addCategoryError'))
  }
}

async function handleDeleteCategory(id) {
  if (!confirm(t('admin.confirmations.deleteCategory'))) return
  try {
    await productStore.deleteCategory(id)
    toast.success(t('admin.toast.categoryDeleted'))
  } catch (err) {
    toast.error(err.message || t('admin.toast.deleteCategoryError'))
  }
}
</script>

<style scoped>
.admin-page {
  padding: clamp(1.5rem, 4vh, 2rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vh, 4rem);
}

.admin-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.admin-page__title {
  font-size: clamp(1.375rem, 3.5vw, 1.75rem);
  font-weight: 700;
}

.admin-page__tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--border);
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.admin-page__tab {
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(1rem, 2vw, 1.5rem);
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all var(--transition-fast);
}

.admin-page__tab:hover {
  color: var(--text-primary);
}

.admin-page__tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}

.admin-section__filters {
  display: flex;
  gap: clamp(0.625rem, 1.5vw, 1rem);
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.admin-select,
.admin-input {
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.75rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  background: var(--surface-0);
  color: var(--text-primary);
  outline: none;
  transition: all var(--transition-fast);
}

.admin-select:focus,
.admin-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 clamp(0.125rem, 0.3vw, 0.1875rem) var(--accent-light);
}

.admin-input {
  flex: 1;
  max-width: min(18.75rem, 90%);
}

.admin-section__loading,
.admin-section__empty {
  padding: clamp(1.25rem, 4vh, 2rem) 0;
  color: var(--text-muted);
  text-align: center;
}

.admin-table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  text-align: left;
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.625rem, 1.2vw, 1rem);
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--border);
}

.admin-table td {
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.625rem, 1.2vw, 1rem);
  border-bottom: 1px solid var(--surface-2);
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
}

.admin-product-cell {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
}

.admin-product-cell__img {
  width: clamp(2.25rem, 4.5vw, 2.5rem);
  height: clamp(2.25rem, 4.5vw, 2.5rem);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--surface-2);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-muted);
}

.admin-product-cell__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-product-cell__name {
  font-weight: 500;
}

.admin-mono {
  font-family: var(--font-mono);
  font-weight: 500;
}

.admin-actions {
  display: flex;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.admin-actions__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(2rem, 4vw, 2.25rem);
  height: clamp(2rem, 4vw, 2.25rem);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.admin-actions__btn--edit {
  color: var(--text-secondary);
}

.admin-actions__btn--edit:hover {
  background: var(--accent-light);
  color: var(--accent);
}

.admin-actions__btn--delete {
  color: var(--text-muted);
}

.admin-actions__btn--delete:hover {
  background: var(--danger-light);
  color: var(--danger);
}

.admin-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(clamp(12rem, 25vw, 14rem), 100%), 1fr));
  gap: clamp(0.625rem, 1.5vw, 1rem);
}

.admin-category-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.625rem, 1.2vw, 1rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  transition: all var(--transition-fast);
}

.admin-category-card:hover {
  border-color: var(--accent-subtle);
  box-shadow: var(--shadow-sm);
}

.admin-category-card--add {
  display: flex;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.admin-category-card--add input {
  flex: 1;
  padding: clamp(0.25rem, 0.6vw, 0.375rem) clamp(0.375rem, 0.75vw, 0.5rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  outline: none;
  transition: all var(--transition-fast);
}

.admin-category-card--add input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 clamp(0.125rem, 0.3vw, 0.1875rem) var(--accent-light);
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vh, 1rem);
}

.admin-form__row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(0.625rem, 1.5vw, 1rem);
}

.admin-form__field {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 0.5vh, 0.375rem);
}

.admin-form__label {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 500;
  color: var(--text-primary);
}

.admin-textarea {
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.75rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  resize: vertical;
  outline: none;
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.admin-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 clamp(0.125rem, 0.3vw, 0.1875rem) var(--accent-light);
}

.admin-file {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  margin-bottom: clamp(0.375rem, 0.75vh, 0.5rem);
}

/* ============================================
   TABLET - 1024px
   ============================================ */
@media (max-width: 1024px) {
  .admin-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .admin-page__title {
    font-size: clamp(1.25rem, 3vw, 1.5rem);
  }

  .admin-table th,
  .admin-table td {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .admin-product-cell__img {
    width: 2rem;
    height: 2rem;
  }

  .admin-categories {
    grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr));
  }
}

/* ============================================
   MOBILE LARGE - 768px (existing + refinements)
   ============================================ */
@media (max-width: 768px) {
  .admin-form__row {
    grid-template-columns: 1fr;
  }

  .admin-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .admin-page__tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .admin-page__tabs::-webkit-scrollbar {
    display: none;
  }

  .admin-page__tab {
    white-space: nowrap;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .admin-section__filters {
    flex-direction: column;
  }

  .admin-select,
  .admin-input {
    width: 100%;
    max-width: 100%;
    font-size: 0.8rem;
  }

  .admin-input {
    max-width: 100%;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }

  .admin-product-cell {
    gap: 0.375rem;
  }

  .admin-product-cell__img {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.7rem;
  }

  .admin-actions__btn {
    width: 2rem;
    height: 2rem;
  }

  .admin-categories {
    grid-template-columns: repeat(auto-fill, minmax(min(10rem, 100%), 1fr));
    gap: 0.75rem;
  }

  .admin-category-card {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .admin-category-card--add {
    flex-direction: column;
    gap: 0.375rem;
  }

  .admin-category-card--add input {
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
  }
}

/* ============================================
   MOBILE - 640px
   ============================================ */
@media (max-width: 640px) {
  .admin-page {
    padding: 2rem 1rem 2.5rem;
  }

  .admin-page__title {
    font-size: 1.25rem;
  }

  .admin-page__tab {
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }

  /* Make tables horizontally scrollable with better UX */
  .admin-table-wrap {
    margin-left: calc(1rem * -1);
    margin-right: calc(1rem * -1);
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .admin-table {
    min-width: 500px; /* Force horizontal scroll for readability */
  }

  .admin-table th,
  .admin-table td {
    padding: 0.375rem;
    font-size: 0.75rem;
  }

  .admin-product-cell__name {
    font-size: 0.8rem;
  }

  .admin-actions {
    flex-direction: column;
    gap: 0.25rem;
  }

  .admin-actions__btn {
    width: 2.25rem;
    height: 2.25rem;
  }

  .admin-categories {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .admin-category-card {
    padding: 0.5rem 0.75rem;
    font-size: 0.7rem;
  }

  .admin-select,
  .admin-input,
  .admin-textarea {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }

  .admin-file {
    font-size: 0.7rem;
  }
}

/* ============================================
   MOBILE SMALL - 480px
   ============================================ */
@media (max-width: 480px) {
  .admin-page {
    padding: 1.25rem 0.75rem 2rem;
  }

  .admin-page__title {
    font-size: 1.125rem;
  }

  .admin-page__tabs {
    margin-bottom: 1.25rem;
  }

  .admin-page__tab {
    padding: 0.25rem 0.375rem;
    font-size: 0.7rem;
  }

  .admin-section__filters {
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .admin-select,
  .admin-input {
    padding: 0.5rem;
    font-size: 0.7rem;
  }

  /* Collapse table into card-like layout for very small screens */
  .admin-table-wrap {
    margin-left: calc(0.75rem * -1);
    margin-right: calc(0.75rem * -1);
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .admin-table {
    min-width: 450px;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.25rem 0.375rem;
    font-size: 0.7rem;
  }

  .admin-product-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .admin-product-cell__img {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.65rem;
  }

  .admin-product-cell__name {
    font-size: 0.7rem;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-actions__btn {
    width: 2rem;
    height: 2rem;
  }

  .admin-actions__btn svg {
    width: 14px;
    height: 14px;
  }

  .admin-category-card {
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }

  .admin-category-card--add input {
    padding: 0.375rem;
    font-size: 0.7rem;
  }

  .admin-form {
    gap: 0.75rem;
  }

  .admin-form__label {
    font-size: 0.7rem;
  }

  .admin-textarea {
    padding: 0.5rem;
    font-size: 0.7rem;
  }

  .admin-file {
    font-size: 0.7rem;
    margin-bottom: 0.375rem;
  }
}

/* ============================================
   MOBILE XS - 360px
   ============================================ */
@media (max-width: 360px) {
  .admin-page {
    padding: 0.75rem 0.5rem 1.25rem;
  }

  .admin-page__title {
    font-size: 1rem;
  }

  .admin-page__tab {
    padding: 0.375rem 0.375rem;
    font-size: 0.65rem;
  }

  .admin-section__filters {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .admin-select,
  .admin-input {
    padding: 0.375rem;
    font-size: 0.7rem;
  }

  .admin-table-wrap {
    margin-left: calc(0.5rem * -1);
    margin-right: calc(0.5rem * -1);
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .admin-table {
    min-width: 400px;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.25rem 0.25rem;
    font-size: 0.65rem;
  }

  .admin-product-cell__img {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.6rem;
  }

  .admin-product-cell__name {
    font-size: 0.65rem;
    max-width: 80px;
  }

  .admin-mono {
    font-size: 0.65rem;
  }

  .admin-actions__btn {
    width: 1.75rem;
    height: 1.75rem;
  }

  .admin-actions__btn svg {
    width: 12px;
    height: 12px;
  }

  .admin-category-card {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }

  .admin-category-card--add {
    gap: 0.25rem;
  }

  .admin-category-card--add input {
    padding: 0.25rem 0.375rem;
    font-size: 0.65rem;
  }

  .admin-form {
    gap: 0.5rem;
  }

  .admin-form__label {
    font-size: 0.65rem;
  }

  .admin-textarea {
    padding: 0.375rem;
    font-size: 0.65rem;
  }

  .admin-file {
    font-size: 0.65rem;
    margin-bottom: 0.25rem;
  }
}
</style>
