<template>
  <!-- Embedded product page for umapenca/uiclap products -->
  <div v-if="product && isThirdParty" class="product-detail container">
    <nav class="product-detail__breadcrumb">
      <router-link to="/">{{ $t('productDetail.breadcrumbHome') }}</router-link>
      <span class="product-detail__sep">/</span>
      <router-link to="/produtos">{{ $t('productDetail.breadcrumbProducts') }}</router-link>
      <span class="product-detail__sep">/</span>
      <span>{{ product.name }}</span>
    </nav>

    <!-- Product image -->
    <div class="product-detail__third-party-layout">
      <div class="product-detail__image-wrapper">
        <img
          v-if="thirdPartyDisplayImage && !imageError"
          :src="thirdPartyDisplayImage"
          :alt="product.name"
          class="product-detail__image"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-else class="product-detail__image-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      </div>

      <!-- Product info + button -->
      <div class="product-detail__embedded-info">
        <div class="product-detail__header">
          <BaseBadge :variant="isUmaPenca ? 'accent' : 'success'" size="sm">
            {{ isUmaPenca ? 'Uma Penca' : 'UICLAP' }}
          </BaseBadge>
          <span class="product-detail__store-label">Sold by {{ isUmaPenca ? 'Uma Penca' : 'UICLAP' }}</span>
        </div>
        <h1 class="product-detail__name">{{ product.name }}</h1>
        <div class="product-detail__price-row">
          <p class="product-detail__price">R$ {{ formatPrice(product.price) }}</p>
        </div>
        <p v-if="product.description" class="product-detail__desc">{{ truncatedDescription }}</p>
        <a
          :href="productUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="product-detail__external-link-large"
        >
          <span>{{ isUmaPenca ? 'Comprar na Uma Penca' : 'Comprar na UICLAP' }}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Other in-stock products below -->
    <section v-if="inStockProducts.length > 0" class="product-detail__section product-detail__related">
      <h2 class="product-detail__section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        {{ $t('productDetail.inStockProducts', 'In-stock products') }}
      </h2>
      <div class="product-detail__masonry">
        <Masonry
          :items="inStockProducts"
          :gap="16"
          :show-info="true"
          :on-item-click="openRelatedProduct"
        />
      </div>
    </section>
  </div>

  <!-- Normal product detail page for in-stock/digital products -->
  <div v-else-if="product" class="product-detail container">
    <nav class="product-detail__breadcrumb">
      <router-link to="/">{{ $t('productDetail.breadcrumbHome') }}</router-link>
      <span class="product-detail__sep">/</span>
      <router-link to="/produtos">{{ $t('productDetail.breadcrumbProducts') }}</router-link>
      <span class="product-detail__sep">/</span>
      <span>{{ product.name }}</span>
    </nav>

    <div class="product-detail__layout">
      <!-- Left: Gallery column -->
      <div class="product-detail__gallery">
        <ProductGallery
          :images="productImages"
          :product-name="product.name"
          :selected-color-image-index="selectedColorImageIndex"
        />
      </div>

      <!-- Right: Info column -->
      <div class="product-detail__info">
        <div class="product-detail__header">
          <BaseBadge :variant="isUmaPenca ? 'accent' : isDigital ? 'success' : 'default'" size="sm">
            {{ categoryBadgeLabel }}
          </BaseBadge>
          <BaseBadge v-if="isDigital" variant="success" size="xs">
            {{ $t('productCard.badges.digital') }}
          </BaseBadge>
        </div>

        <h1 class="product-detail__name">{{ product.name }}</h1>
        <p v-if="product.artist" class="product-detail__artist">{{ $t('productDetail.by') }} {{ product.artist }}</p>

        <div class="product-detail__price-row">
          <p class="product-detail__price">R$ {{ formatPrice(product.price) }}</p>
          <BaseBadge :variant="product.stock_type === 'print-on-demand' ? 'default' : 'success'" size="xs">
            {{ product.stock_type === 'print-on-demand' ? $t('productDetail.onDemand') : product.stock_type === 'digital' ? $t('productDetail.digital') : $t('productDetail.inStock') }}
          </BaseBadge>
        </div>

        <p v-if="shouldShowDescription" class="product-detail__desc">{{ product.description }}</p>

        <!-- Size selector -->
        <div v-if="product.sizes && product.sizes.length" class="product-detail__variants">
          <ProductVariants v-model="selectedSize" :sizes="product.sizes" />
        </div>

        <!-- Color swatches selector -->
        <div v-if="colorSwatches.length > 1" class="product-detail__colors">
          <ProductColorSwatches v-model="selectedColor" :color-swatches="colorSwatches" />
        </div>

        <!-- Size table (camisetas) -->
        <ProductSizeTable
          v-if="isCamiseta"
          :product-category="product.category"
          :product-type="product.type || ''"
          :category-name="categoryName"
        />

        <!-- Quantity -->
        <div class="product-detail__qty">
          <span class="product-detail__qty-label">{{ $t('productDetail.quantity') }}</span>
          <div class="product-detail__qty-controls">
            <button @click="decrementQty" :disabled="quantity <= 1" :aria-label="$t('productDetail.decrease')">&minus;</button>
            <span class="product-detail__qty-value">{{ quantity }}</span>
            <button @click="incrementQty" :disabled="quantity >= 99" :aria-label="$t('productDetail.increase')">+</button>
          </div>
        </div>

        <!-- Detalhes do produto - inline in right column -->
        <section v-if="productDetails.length > 0" class="product-detail__inline-section">
          <h3 class="product-detail__inline-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            {{ $t('productDetail.productDetails') }}
          </h3>
          <ul class="product-detail__inline-list">
            <li v-for="(detail, i) in productDetails" :key="i" class="product-detail__inline-item">
              <span class="product-detail__inline-bullet"></span>
              <span class="product-detail__inline-text">{{ detail }}</span>
            </li>
          </ul>
        </section>

        <!-- Add to cart -->
        <div class="product-detail__actions">
          <BaseButton variant="primary" size="lg" full :loading="addingToCart" @click="addToCart">
            {{ $t('productDetail.addToCart') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- ========== FULL-WIDTH SECTIONS BELOW GALLERY ========== -->

    <!-- Cuidados com a sua camiseta (only for camisetas) -->
    <section v-if="careInstructions.length > 0" class="product-detail__section product-detail__care">
      <h2 class="product-detail__section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22c4-3 8-7 8-12a8 8 0 10-16 0c0 5 4 9 8 12z"/>
          <path d="M12 8v4"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
        </svg>
        {{ $t('productDetail.careInstructions') }}
      </h2>
      <div class="product-detail__care-cards">
        <div v-for="(care, i) in careInstructions" :key="i" class="product-detail__care-card">
          <span class="product-detail__care-num">{{ i + 1 }}</span>
          <p class="product-detail__care-text">{{ care }}</p>
        </div>
      </div>
    </section>

    <!-- Additional specs (dimensions, weight) -->
    <section v-if="hasPhysicalSpecs" class="product-detail__section product-detail__specs">
      <h2 class="product-detail__section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        </svg>
        {{ $t('productDetail.specifications') }}
      </h2>
      <div class="product-detail__specs-grid">
        <div v-if="product.weight" class="product-detail__spec">
          <span class="product-detail__spec-label">{{ $t('productDetail.weight') }}</span>
          <span class="product-detail__spec-value">{{ product.weight }} kg</span>
        </div>
        <div v-if="product.dimensions" class="product-detail__spec">
          <span class="product-detail__spec-label">{{ $t('productDetail.dimensions') }}</span>
          <span class="product-detail__spec-value">{{ product.dimensions.width }} x {{ product.dimensions.height }} x {{ product.dimensions.depth }} cm</span>
        </div>
        <div v-if="product.fulfillment_type" class="product-detail__spec">
          <span class="product-detail__spec-label">{{ $t('productDetail.fulfillment') }}</span>
          <span class="product-detail__spec-value">{{ fulfillmentLabel }}</span>
        </div>
      </div>
    </section>

    <!-- Related products - Masonry layout -->
    <section v-if="relatedProducts.length > 0" class="product-detail__section product-detail__related">
      <h2 class="product-detail__section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        {{ $t('productDetail.relatedItems') }}
      </h2>
      <div class="product-detail__masonry">
        <Masonry
          :items="relatedProducts"
          :gap="16"
          :show-info="true"
          :on-item-click="openRelatedProduct"
        />
      </div>
    </section>
  </div>

  <!-- Loading state -->
  <div v-else-if="isLoading" class="product-detail container">
    <div class="product-detail__layout">
      <div class="product-detail__skeleton-gallery">
        <div class="skeleton product-detail__skeleton-img"></div>
      </div>
      <div class="product-detail__skeleton-info">
        <div class="skeleton" style="width: 30%; height: clamp(1rem, 2vh, 1.25rem);"></div>
        <div class="skeleton" style="width: 80%; height: clamp(1.5rem, 3vh, 1.75rem); margin-top: 0.75rem;"></div>
        <div class="skeleton" style="width: 40%; height: clamp(0.875rem, 1.5vh, 1rem); margin-top: 0.5rem;"></div>
        <div class="skeleton" style="width: 25%; height: clamp(1.75rem, 3vh, 2rem); margin-top: 1rem;"></div>
        <div class="skeleton" style="width: 100%; height: clamp(3rem, 6vh, 3.75rem); margin-top: 1rem;"></div>
        <div class="skeleton" style="width: 60%; height: clamp(2rem, 4vh, 2.5rem); margin-top: 1.5rem;"></div>
        <div class="skeleton" style="width: 100%; height: clamp(2.5rem, 5vh, 3rem); margin-top: 1.5rem;"></div>
      </div>
    </div>
    <!-- Skeleton detail sections -->
    <div class="skeleton" style="width: 100%; height: clamp(6rem, 12vh, 7.5rem); margin-top: 2rem; border-radius: var(--radius-lg);"></div>
    <div class="skeleton" style="width: 100%; height: clamp(5rem, 10vh, 6.25rem); margin-top: 1rem; border-radius: var(--radius-lg);"></div>
  </div>

  <!-- Not found -->
  <div v-else class="product-detail container">
    <div class="product-detail__notfound">
      <h2>{{ $t('productDetail.notFound') }}</h2>
      <BaseButton variant="secondary" @click="$router.push('/produtos')">{{ $t('productDetail.viewProducts') }}</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isLikelyBrokenCdnUrl, markImageUrlAsBroken } from '../utils/brokenImages'
import { useProductStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import { findProductBySlug, generateSlug } from '../utils/slug'
import ProductGallery from '../components/product/ProductGallery.vue'
import ProductVariants from '../components/product/ProductVariants.vue'
import ProductColorSwatches from '../components/product/ProductColorSwatches.vue'

// Lazy load heavy components
const ProductSizeTable = defineAsyncComponent(() => import('../components/product/ProductSizeTable.vue'))
const Masonry = defineAsyncComponent(() => import('../components/common/Masonry.vue'))
const BaseBadge = defineAsyncComponent(() => import('../components/common/BaseBadge.vue'))
const BaseButton = defineAsyncComponent(() => import('../components/common/BaseButton.vue'))

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const toast = useToastStore()
const { t } = useI18n()

const selectedSize = ref(null)
const selectedColor = ref(null)
const quantity = ref(1)
const addingToCart = ref(false)
const imageError = ref(false)

function handleImageError() {
  imageError.value = true
  if (thirdPartyDisplayImage.value) {
    markImageUrlAsBroken(thirdPartyDisplayImage.value)
  }
}

const product = computed(() => findProductBySlug(productStore.products, route.params.slug))
const isLoading = computed(() => productStore.products.length === 0 && productStore.categories.length === 0)

/**
 * Parse product description once and cache the results.
 * This avoids redundant string operations across multiple computed properties.
 */
const parsedProductContent = computed(() => {
  const desc = product.value?.description || ''
  const info = product.value?.info || ''
  
  if (!desc && !info) {
    return {
      hasSectionHeaders: false,
      productDetailLines: [],
      careInstructionLines: [],
      additionalInfoLines: []
    }
  }
  
  const lowerDesc = desc.toLowerCase()
  const hasSectionHeaders = 
    lowerDesc.includes('detalhes do produto') ||
    lowerDesc.includes('cuidados com a sua camiseta') ||
    lowerDesc.includes('informações adicionais') ||
    lowerDesc.includes('care instructions') ||
    lowerDesc.includes('additional info')
  
  // Helper to parse sectioned text
  const parseSectionedText = (text, excludeKeywords) => {
    if (!text) return []
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
    const excludeLower = excludeKeywords.map(k => k.toLowerCase())
    
    return lines.filter(line => {
      const lowerLine = line.toLowerCase()
      const isSectionHeader = 
        lowerLine.includes('detalhes do produto') ||
        lowerLine.includes('cuidados com a sua camiseta') ||
        lowerLine.includes('informações adicionais') ||
        lowerLine.includes('care instructions') ||
        lowerLine.includes('additional info')
      
      const isExcluded = excludeLower.some(keyword => lowerLine.includes(keyword))
      return !isSectionHeader && !isExcluded
    })
  }
  
  const careKeywords = ['passar do avesso', 'pano protetor', 'evitar vapor', 'cuidados', 'passadoria']
  const additionalInfoKeywords = ['medidas podem variar', 'pode encolher']
  const productDetailKeywords = [...careKeywords, ...additionalInfoKeywords]
  
  // Parse info field first (preferred source)
  let productDetailLines = []
  let careInstructionLines = []
  
  if (info) {
    productDetailLines = parseSectionedText(info, productDetailKeywords)
    careInstructionLines = parseSectionedText(info, careKeywords)
  }
  
  // Fallback to description if info didn't yield results and has section headers
  if (productDetailLines.length === 0 && hasSectionHeaders) {
    productDetailLines = parseSectionedText(desc, productDetailKeywords)
    careInstructionLines = parseSectionedText(desc, careKeywords)
  }
  
  return {
    hasSectionHeaders,
    productDetailLines,
    careInstructionLines,
    additionalInfoLines: parseSectionedText(desc, additionalInfoKeywords)
  }
})

/**
 * Check if we should show the description field.
 * Hide it if it contains structured detail sections.
 */
const shouldShowDescription = computed(() => {
  if (!product.value?.description) return false
  if (parsedProductContent.value.hasSectionHeaders) return false
  if (product.value.description.length > 300) return false
  return true
})

/**
 * Extract the image sequence number from the URL
 * Examples:
 * - 000_image.jpg -> 0
 * - 001_image.jpg -> 1
 * - 003_image.jpg -> 3
 * - 012_image.png -> 12
 */
function extractImageNumber(url) {
  if (!url) return null
  const match = url.match(/\/(\d+)_image\./i)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Check if an image is a FULLCOLOR swatch based on its sequence number
 * FULLCOLOR images are at positions: 0, 3, 6, 9, 12, 15... (every 3rd starting from 0)
 */
function isFullColorImage(url, index) {
  const imgNum = extractImageNumber(url)
  
  // If we can extract the number, use it for accurate detection
  if (imgNum !== null) {
    return imgNum % 3 === 0
  }
  
  // Fallback to URL keyword detection
  if (url && (
    url.toLowerCase().includes('fullcolor') ||
    url.toLowerCase().includes('full_image') ||
    url.toLowerCase().includes('colorfull')
  )) {
    return true
  }
  
  // Last resort: use array index (less reliable)
  return index % 3 === 0
}

const productImages = computed(() => {
  if (!product.value) return []
  const images = []

  // If product has color_swatches, the images array should already contain only tshirt images
  // from the sync script. Otherwise, we need to filter out FULLCOLOR images.
  if (Array.isArray(product.value.images) && product.value.images.length > 0) {
    // Check if this product has color_swatches (meaning images are already filtered)
    const hasColorSwatches = Array.isArray(product.value.color_swatches) && product.value.color_swatches.length > 0

    if (hasColorSwatches) {
      // Images are already filtered by sync script - use them as is
      product.value.images.forEach(img => {
        if (img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/'))) {
          // Transform old jsDelivr URLs to raw GitHub URLs
          if (img.includes('cdn.jsdelivr.net/gh')) {
            img = img.replace(
              /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\//,
              'https://raw.githubusercontent.com/$1/$2/$3/'
            )
          }
          images.push(img)
        }
      })
    } else {
      // Legacy products: filter out FULLCOLOR images
      // Extract image number from URL and check if it's divisible by 3
      product.value.images.forEach((img, index) => {
        const isFullColor = isFullColorImage(img, index)
        if (!isFullColor && img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/'))) {
          // Transform old jsDelivr URLs to raw GitHub URLs
          if (img.includes('cdn.jsdelivr.net/gh')) {
            img = img.replace(
              /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\//,
              'https://raw.githubusercontent.com/$1/$2/$3/'
            )
          }
          images.push(img)
        }
      })
    }
  }

  // Fallback to single image
  if (images.length === 0) {
    let img = product.value.image
    if (img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/'))) {
      // Transform old jsDelivr URLs to raw GitHub URLs
      if (img.includes('cdn.jsdelivr.net/gh')) {
        img = img.replace(
          /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\//,
          'https://raw.githubusercontent.com/$1/$2/$3/'
        )
      }
      images.push(img)
    }
  }

  return images
})

// Color swatches for the product
const colorSwatches = computed(() => {
  if (!product.value) return []

  // Check if product has color_swatches field (from new sync script)
  if (Array.isArray(product.value.color_swatches) && product.value.color_swatches.length > 0) {
    return product.value.color_swatches
  }

  // Legacy products: extract FULLCOLOR images from images array
  // Extract image number from URL and check if it's divisible by 3
  if (Array.isArray(product.value.images) && product.value.images.length > 0) {
    const swatches = []
    product.value.images.forEach((img, index) => {
      const isFullColor = isFullColorImage(img, index)
      if (isFullColor && img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/'))) {
        swatches.push(img)
      }
    })
    return swatches
  }

  return []
})

// Map from color index to the first tshirt image index for that color
const colorToImageIndex = computed(() => {
  const mapping = {}
  const swatches = colorSwatches.value
  const images = productImages.value

  if (swatches.length === 0 || images.length === 0) return mapping

  // Each color has 1-2 images (normal tshirt + optional baby look)
  // Calculate how many images per color
  const imagesPerColor = Math.floor(images.length / swatches.length)
  const remainder = images.length % swatches.length

  let imageIndex = 0
  for (let colorIndex = 0; colorIndex < swatches.length; colorIndex++) {
    mapping[colorIndex] = imageIndex
    // Most colors have 2 images (normal + baby look), but some may have only 1
    imageIndex += imagesPerColor + (colorIndex < remainder ? 1 : 0)
  }

  return mapping
})

// The image index to show when a color is selected
const selectedColorImageIndex = computed(() => {
  if (selectedColor.value === null) return null
  return colorToImageIndex.value[selectedColor.value] ?? null
})

const categoryName = computed(() => {
  if (!product.value) return ''
  const cat = productStore.categories.find(c => c.id === product.value.category)
  return cat?.name || product.value.category || ''
})

// Product type flags - handle both 'uma_penca' (underscore, legacy) and 'uma penca' (space, new)
const isUmaPenca = computed(() => {
  const ft = product.value?.fulfillment_type
  return ft === 'uma_penca' || ft === 'uma penca'
})
const isUiclap = computed(() => product.value?.fulfillment_type === 'uiclap')
const isThirdParty = computed(() => isUmaPenca.value || isUiclap.value)
const isDigital = computed(() => product.value?.fulfillment_type === 'digital')
const isOnDemand = computed(() => product.value?.stock === 'print-on-demand')

// Check if category is camiseta (category ID 1 or name includes "camiseta")
const isCamiseta = computed(() => {
  const cat = categoryName.value.toLowerCase()
  return cat.includes('camiseta') || cat.includes('t-shirt') || product.value?.category === 1
})

const isCaneca = computed(() => {
  const cat = categoryName.value.toLowerCase()
  return cat.includes('caneca') || cat.includes('mug')
})

const isLivro = computed(() => {
  const cat = categoryName.value.toLowerCase()
  return cat.includes('livro') || cat.includes('book') || cat.includes('uiclap')
})

// Category badge label
const categoryBadgeLabel = computed(() => {
  if (isUmaPenca.value) return 'Uma Penca'
  if (isUiclap.value) return 'UICLAP'
  if (isDigital.value) return 'Digital'
  if (isOnDemand.value) return t('productCard.badges.printOnDemand')
  return categoryName.value
})

// Fulfillment labels
const fulfillmentLabel = computed(() => {
  const ft = product.value?.fulfillment_type
  if (ft === 'uma_penca' || ft === 'uma penca') return 'Uma Penca'
  if (ft === 'uiclap') return 'UICLAP'
  if (ft === 'digital') return t('productDetail.digitalDelivery')
  if (ft === 'own') return t('productDetail.ownFulfillment')
  return ft || ''
})

// Dynamic product details based on product type
const productDetails = computed(() => {
  if (!product.value) return []
  
  // If product has a details array, use it
  if (Array.isArray(product.value.details) && product.value.details.length > 0) {
    return product.value.details
  }

  // If product has a details object, use it
  if (product.value.details && typeof product.value.details === 'object' && !Array.isArray(product.value.details)) {
    return Object.values(product.value.details).filter(Boolean)
  }

  // Use parsed content if available
  if (parsedProductContent.value.productDetailLines.length > 0) {
    return parsedProductContent.value.productDetailLines
  }

  // Default details based on product type (only if no structured data found)
  const details = []
  if (isCamiseta.value) {
    details.push(t('productDetail.defaultCamisetaMaterial'))
    details.push(t('productDetail.defaultCamisetaPrint'))
    if (product.value.vegan) {
      details.push(t('productDetail.defaultCamisetaVegan'))
    }
  } else if (isCaneca.value) {
    details.push(t('productDetail.defaultCanecaMaterial'))
    details.push(t('productDetail.defaultCanecaPrint'))
    details.push(t('productDetail.defaultCanecaMicrowave'))
    details.push(t('productDetail.defaultCanecaDishwasher'))
  } else if (isLivro.value) {
    if (product.value.pages) {
      details.push(`${t('productDetail.defaultLivroPages')} ${product.value.pages}`)
    }
    if (product.value.isbn) {
      details.push(`${t('productDetail.defaultLivroIsbn')}: ${product.value.isbn}`)
    }
    details.push(t('productDetail.defaultLivroPrint'))
  } else {
    // Generic fallback - use short description only
    if (product.value.short_description) {
      details.push(product.value.short_description)
    } else if (product.value.description && product.value.description.length <= 300) {
      details.push(product.value.description)
    }
  }

  return details
})

// Care instructions for camisetas
const careInstructions = computed(() => {
  if (!product.value) return []

  // If product has care_instructions array, use it
  if (Array.isArray(product.value.care_instructions) && product.value.care_instructions.length > 0) {
    return product.value.care_instructions
  }

  // Use parsed content if available
  if (parsedProductContent.value.careInstructionLines.length > 0) {
    return parsedProductContent.value.careInstructionLines
  }

  // Try to parse care instructions from description field (legacy fallback)
  if (product.value.description && typeof product.value.description === 'string') {
    const desc = product.value.description
    const hasCareSection = desc.toLowerCase().includes('cuidados com a sua camiseta')
    
    if (hasCareSection) {
      // Extract the care section
      const lines = desc.split('\n').map(line => line.trim()).filter(Boolean)
      const careLines = []
      let inCareSection = false
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase()
        
        if (lowerLine.includes('cuidados com a sua camiseta') || lowerLine.includes('care instructions')) {
          inCareSection = true
          continue
        }
        
        if (inCareSection) {
          // Stop if we hit the next section
          if (lowerLine.includes('informações adicionais') || lowerLine.includes('additional info')) {
            break
          }
          // Include lines that look like care instructions
          if (line.length > 10 && !lowerLine.includes('detalhes do produto')) {
            careLines.push(line)
          }
        }
      }
      
      if (careLines.length > 0) {
        return careLines
      }
    }
  }

  // Default care instructions for camisetas
  if (isCamiseta.value) {
    return [
      t('productDetail.defaultCarePassInside'),
      t('productDetail.defaultCareProtectiveCloth'),
      t('productDetail.defaultCareAvoidSteam')
    ]
  }

  return []
})

// Physical specs
const hasPhysicalSpecs = computed(() => {
  if (!product.value) return false
  return product.value.weight || product.value.dimensions || product.value.fulfillment_type
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  const related = productStore.getRelatedProducts(product.value.id, 12)

  // Define stable heights based on product category for consistent layout
  const categoryHeightMap = {
    camiseta: 280,
    caneca: 240,
    livro: 320,
    default: 260,
  }

  return related.map(p => {
    // Determine a stable height based on product category
    const cat = productStore.categories.find(c => c.id === p.category)?.name?.toLowerCase() || ''
    let height = categoryHeightMap.default
    for (const [key, h] of Object.entries(categoryHeightMap)) {
      if (cat.includes(key)) {
        height = h
        break
      }
    }
    // Add slight deterministic variation based on product ID (no randomness)
    const variation = ((p.id * 13) % 60) - 30
    height += variation

    // Get the correct display image: for t-shirts, product.image points to
    // a 000 FULLCOLOR swatch. Replace 000_image with 001_image in the URL.
    // Only transform for t-shirts, not mugs/canecas
    let displayImg = p.image || ''
    const isTshirt = cat.includes('camiseta') || cat.includes('t-shirt') || cat.includes('tshirt') || cat.includes('shirt')
    const isMug = cat.includes('caneca') || cat.includes('mug') || cat.includes('copo')
    if (displayImg && displayImg.includes('000_image') && isTshirt && !isMug) {
      displayImg = displayImg.replace('000_image', '001_image')
    }

    return {
      id: String(p.id),
      img: displayImg,
      url: `/produtos/${generateSlug(p.name, p.id)}`,
      name: p.name || '',
      price: p.price || 0,
      height,
      aspectRatio: '3/4',
    }
  })
})

/** URL to embed for third-party products */
const productUrl = computed(() => {
  if (!product.value) return ''
  // Use product_url field if available, fallback to third_party_product_url
  return product.value.product_url || product.value.third_party_product_url || ''
})

/** Display image for third-party products */
const thirdPartyDisplayImage = computed(() => {
  const p = product.value
  if (!p) return ''
  let img = p.image || ''
  if (!img) return ''
  // Transform old jsDelivr URLs to raw GitHub URLs
  if (img.includes('cdn.jsdelivr.net/gh')) {
    img = img.replace(
      /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\//,
      'https://raw.githubusercontent.com/$1/$2/$3/'
    )
  }
  // Only transform for t-shirts, not mugs/canecas
  const cat = (p.category || '').toLowerCase()
  const isTshirt = cat.includes('camiseta') || cat.includes('t-shirt') || cat.includes('tshirt') || cat.includes('shirt')
  const isMug = cat.includes('caneca') || cat.includes('mug') || cat.includes('copo')
  // For t-shirts: replace 000_image with 001_image to show actual tshirt
  if (img.includes('000_image') && isTshirt && !isMug) {
    img = img.replace('000_image', '001_image')
  }
  // Skip broken CDN URLs
  if (img.startsWith('http') && isLikelyBrokenCdnUrl(img)) {
    return ''
  }
  return img
})

/** Truncated description for the embedded sidebar */
const truncatedDescription = computed(() => {
  const desc = product.value?.description || ''
  if (desc.length <= 200) return desc
  return desc.substring(0, 200) + '...'
})

/** In-stock products (non-third-party) for the "also available" section */
const inStockProducts = computed(() => {
  const allProducts = productStore.products.filter(p => {
    const ft = p.fulfillment_type
    const isThird = ft === 'uma_penca' || ft === 'uma penca' || ft === 'uiclap' || ft === 'third_party'
    return !isThird && p.is_active !== false
  })
  // Take up to 12 random in-stock products, excluding current
  const filtered = allProducts.filter(p => String(p.id) !== String(product.value?.id))
  // Fisher-Yates shuffle for uniform random distribution
  const shuffled = [...filtered]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const selected = shuffled.slice(0, 12)

  const categoryHeightMap = {
    camiseta: 280,
    caneca: 240,
    livro: 320,
    default: 260,
  }

  return selected.map(p => {
    const cat = productStore.categories.find(c => c.id === p.category)?.name?.toLowerCase() || ''
    let height = categoryHeightMap.default
    for (const [key, h] of Object.entries(categoryHeightMap)) {
      if (cat.includes(key)) {
        height = h
        break
      }
    }
    const variation = ((p.id * 13) % 60) - 30
    height += variation

    let displayImg = p.image || ''
    const imgCat = (p.category || '').toLowerCase()
    const imgIsTshirt = imgCat.includes('camiseta') || imgCat.includes('t-shirt') || imgCat.includes('tshirt') || imgCat.includes('shirt')
    const imgIsMug = imgCat.includes('caneca') || imgCat.includes('mug') || imgCat.includes('copo')
    if (displayImg && displayImg.includes('000_image') && imgIsTshirt && !imgIsMug) {
      displayImg = displayImg.replace('000_image', '001_image')
    }

    return {
      id: String(p.id),
      img: displayImg,
      url: `/produtos/${generateSlug(p.name, p.id)}`,
      name: p.name || '',
      price: p.price || 0,
      height,
      aspectRatio: '3/4',
    }
  })
})

function openRelatedProduct(item) {
  router.push(item.url)
  window.scrollTo({ top: 0, behavior: 'instant' })
}

onMounted(async () => {
  // Fetch products and categories in parallel only if needed
  // These use edge function caching so they're fast on subsequent calls
  const fetches = []
  if (productStore.products.length === 0) {
    fetches.push(productStore.fetchProducts())
  }
  if (productStore.categories.length === 0) {
    fetches.push(productStore.fetchCategories())
  }
  if (fetches.length > 0) {
    await Promise.all(fetches)
  }
})

watch(() => route.params.slug, () => {
  selectedSize.value = null
  selectedColor.value = null
  quantity.value = 1
})

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

function incrementQty() {
  if (quantity.value < 99) quantity.value++
}

function decrementQty() {
  if (quantity.value > 1) quantity.value--
}

async function addToCart() {
  if (!product.value) return
  if (product.value.sizes?.length && !selectedSize.value) {
    toast.warning(t('productDetail.selectSize'))
    return
  }

  addingToCart.value = true
  try {
    cartStore.addItem({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      category: product.value.category,
      size: selectedSize.value,
      quantity: quantity.value,
      fulfillment_type: product.value.fulfillment_type || 'own',
      weight: product.value.weight || 0.3,
      dimensions: product.value.dimensions,
      shipping_zones: product.value.shipping_zones
    })
    toast.success(t('productDetail.addedToCart', { name: product.value.name }))
    cartStore.openDrawer()
  } finally {
    addingToCart.value = false
  }
}
</script>

<style scoped>
.product-detail {
  padding: clamp(1rem, 2.5vh, 1.5rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vh, 4rem);
}

/* Breadcrumb */
.product-detail__breadcrumb {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-muted);
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.product-detail__breadcrumb a {
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.product-detail__breadcrumb a:hover {
  color: var(--accent);
}

.product-detail__sep {
  color: var(--text-muted);
}

/* Layout */
.product-detail__layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: start;
}

.product-detail__gallery {
  position: sticky;
  top: calc(var(--header-height) + clamp(1rem, 2.5vh, 2rem));
}

/* Header */
.product-detail__header {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  margin-bottom: clamp(0.5rem, 1vh, 0.75rem);
}

/* Name */
.product-detail__name {
  font-size: clamp(1.375rem, 3.5vw, 1.75rem);
  font-weight: 700;
  margin: clamp(0.25rem, 0.6vh, 0.5rem) 0 clamp(0.125rem, 0.3vh, 0.25rem);
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.product-detail__artist {
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  color: var(--text-secondary);
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
}

/* Price */
.product-detail__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.product-detail__price {
  font-family: var(--font-mono);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
}

.product-detail__price::after {
  content: '';
  display: inline-block;
  width: clamp(0.375rem, 0.75vw, 0.5rem);
  height: clamp(0.375rem, 0.75vw, 0.5rem);
  background: var(--green-adorn);
  border-radius: var(--radius-full);
  box-shadow: 0 0 clamp(0.375rem, 1vw, 0.625rem) var(--green-adorn-glow);
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Description */
.product-detail__desc {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
}

/* Variants */
.product-detail__variants {
  margin-bottom: clamp(0.5rem, 1.2vh, 0.75rem);
}

/* Colors */
.product-detail__colors {
  margin-bottom: clamp(0.5rem, 1.2vh, 0.75rem);
  padding: clamp(0.5rem, 1vh, 0.75rem);
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 0.0625rem solid var(--border);
}

/* Inline details section (in right column) */
.product-detail__inline-section {
  margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
  padding: clamp(0.625rem, 1.2vh, 0.875rem);
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 0.0625rem solid var(--border);
}

.product-detail__inline-title {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 clamp(0.5rem, 1vh, 0.625rem) 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.product-detail__inline-title svg {
  color: var(--accent);
  flex-shrink: 0;
}

.product-detail__inline-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vh, 0.5rem);
}

.product-detail__inline-item {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
  line-height: 1.5;
}

.product-detail__inline-bullet {
  display: inline-block;
  width: 0.3125rem;
  height: 0.3125rem;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 0.4em;
  flex-shrink: 0;
  box-shadow: 0 0 0.25rem var(--accent-subtle);
}

.product-detail__inline-text {
  flex: 1;
}

/* Quantity */
.product-detail__qty {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.product-detail__qty-label {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 500;
  color: var(--text-secondary);
}

.product-detail__qty-controls {
  display: flex;
  align-items: center;
  border: 0.0625rem solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.product-detail__qty-controls button {
  width: clamp(2rem, 4vw, 2.25rem);
  height: clamp(2rem, 4vw, 2.25rem);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.product-detail__qty-controls button:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text-primary);
}

.product-detail__qty-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.product-detail__qty-value {
  width: clamp(2.25rem, 4vw, 2.5rem);
  text-align: center;
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 600;
  border-left: 0.0625rem solid var(--border);
  border-right: 0.0625rem solid var(--border);
  line-height: clamp(2rem, 4vw, 2.25rem);
}

/* Actions */
.product-detail__actions {
  margin-top: clamp(0.375rem, 1vh, 0.5rem);
}

/* Skeleton */
.product-detail__skeleton-gallery {
  flex: 1;
}

.product-detail__skeleton-img {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
}

.product-detail__skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(0.625rem, 1.5vh, 1rem);
}

/* ========== SECTIONS ========== */
.product-detail__section {
  margin-top: clamp(1.5rem, 3.5vh, 2.5rem);
  padding: clamp(1.25rem, 3vw, 2rem);
  background: var(--surface-2);
  border-radius: var(--radius-xl);
  border: 0.0625rem solid var(--border);
}

.product-detail__section-title {
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 700;
  margin-bottom: clamp(0.875rem, 2vh, 1.25rem);
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  letter-spacing: -0.01em;
}

.product-detail__section-title svg {
  color: var(--accent);
  flex-shrink: 0;
}

/* Product details list */
.product-detail__details-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: clamp(0.625rem, 1.2vh, 0.875rem);
}

.product-detail__detail-item {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-secondary);
  line-height: 1.6;
  padding-left: clamp(0.25rem, 0.5vw, 0.5rem);
}

.product-detail__detail-bullet {
  display: inline-block;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 0.5em;
  flex-shrink: 0;
  box-shadow: 0 0 0.375rem var(--accent-subtle);
}

/* Info card (legacy) */
.product-detail__info-card {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-secondary);
  line-height: 1.7;
}

.product-detail__info-card svg {
  color: var(--accent);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* Care instructions */
.product-detail__care-cards {
  display: flex;
  flex-direction: column;
  gap: clamp(0.625rem, 1.2vh, 0.875rem);
}

.product-detail__care-card {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  padding: clamp(0.75rem, 1.5vh, 1rem) clamp(0.875rem, 2vw, 1.25rem);
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  border-left: 0.1875rem solid var(--accent);
  transition: all var(--transition-fast);
}

.product-detail__care-card:hover {
  background: var(--surface-3);
  transform: translateX(0.25rem);
}

.product-detail__care-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(1.5rem, 3vw, 1.75rem);
  height: clamp(1.5rem, 3vw, 1.75rem);
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 700;
  flex-shrink: 0;
}

.product-detail__care-text {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Specifications */
.product-detail__specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(8rem, 15vw, 10rem), 1fr));
  gap: clamp(0.75rem, 1.5vw, 1rem);
}

.product-detail__spec {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: clamp(0.75rem, 1.5vh, 1rem);
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 0.0625rem solid var(--border);
}

.product-detail__spec-label {
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.product-detail__spec-value {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  color: var(--text-primary);
  font-weight: 500;
}

/* Related - Masonry wrapper (no height constraint, Masonry component handles it) */
.product-detail__masonry {
  width: 100%;
}

/* ========== THIRD-PARTY PRODUCT PAGE (umapenca/uiclap) ========== */
.product-detail__third-party-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: start;
}

@media (min-width: 768px) {
  .product-detail__third-party-layout {
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 5vw, 4rem);
  }
}

.product-detail__image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-1);
  border: 0.0625rem solid var(--border);
}

.product-detail__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-detail__image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.product-detail__embedded-iframe {
  position: relative;
  width: 100%;
  min-height: 70vh;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 0.0625rem solid var(--border);
  background: var(--surface-1);
}

.product-detail__iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-1);
  z-index: 1;
}

.product-detail__loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-muted);
}

.product-detail__spinner {
  position: relative;
  width: clamp(2rem, 4vw, 2.5rem);
  height: clamp(2rem, 4vw, 2.5rem);
}

.product-detail__spinner-track {
  stroke: var(--surface-3);
}

.product-detail__spinner-path {
  stroke: var(--accent);
  stroke-dasharray: 100;
  stroke-dashoffset: 75;
  animation: product-detail-spin 1.2s linear infinite;
  transform-origin: center;
}

@keyframes product-detail-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.product-detail__iframe {
  width: 100%;
  height: 70vh;
  min-height: clamp(25rem, 50vh, 31.25rem);
  border: none;
  display: block;
  position: relative;
  z-index: 2;
}

.product-detail__embedded-info {
  position: sticky;
  top: calc(var(--header-height) + clamp(1rem, 2.5vh, 2rem));
  padding: clamp(1rem, 2vh, 1.5rem);
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  border: 0.0625rem solid var(--border);
}

.product-detail__store-label {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
}

.product-detail__external-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: clamp(0.75rem, 1.5vh, 1rem);
  padding: clamp(0.5rem, 1vh, 0.75rem) clamp(0.75rem, 1.5vw, 1rem);
  font-size: clamp(0.8rem, 1.3vw, 0.9rem);
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-subtle);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.product-detail__external-link:hover {
  background: var(--accent-subtle-hover, rgba(139, 92, 246, 0.15));
  transform: translateY(-0.0625rem);
}

.product-detail__external-store-cta {
  margin: clamp(1rem, 3vh, 2rem) 0;
}

.product-detail__external-link-large {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 28rem;
  padding: clamp(1rem, 2vw, 1.25rem) clamp(1.5rem, 3vw, 2rem);
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  font-weight: 600;
  color: white;
  background: var(--accent);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.product-detail__external-link-large:hover {
  background: var(--accent-hover, #7c3aed);
  transform: translateY(-0.125rem);
  box-shadow: 0 0.5rem 1rem rgba(139, 92, 246, 0.3);
}

/* Not found */
.product-detail__notfound {
  text-align: center;
  padding: clamp(2.5rem, 8vh, 4rem) 0;
}

.product-detail__notfound h2 {
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .product-detail__layout {
    grid-template-columns: 1fr;
  }

  .product-detail__gallery {
    position: static;
  }

  .product-detail__price {
    font-size: clamp(1.25rem, 4vw, 1.5rem);
  }

  .product-detail__specs-grid {
    grid-template-columns: 1fr;
  }

  /* Embedded layout - stack on mobile */
  .product-detail__embedded-layout {
    grid-template-columns: 1fr;
  }

  .product-detail__embedded-info {
    position: static;
  }

  .product-detail__iframe {
    height: 60vh;
    min-height: clamp(20rem, 40vh, 25rem);
  }

  .product-detail__store-label {
    display: block;
    margin-left: 0;
    margin-top: 0.5rem;
  }
}
</style>
