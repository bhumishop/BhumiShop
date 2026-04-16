<template>
  <div v-if="shouldShow" class="size-table-trigger">
    <button class="size-table-trigger__btn" @click="isOpen = true" :aria-label="$t('productDetail.showSizeTable')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.38 3.46L16 2 12 5.5 8 2 3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
      </svg>
      <span>{{ $t('productDetail.showSizeTable') }}</span>
    </button>

    <!-- Overlay -->
    <transition name="size-table__fade">
      <div v-if="isOpen" class="size-table__overlay" @click.self="isOpen = false">
        <div class="size-table__modal">
          <!-- Modal header -->
          <div class="size-table__header">
            <h3>{{ $t('productDetail.sizeTableTitle') }}</h3>
            <button class="size-table__close" @click="isOpen = false" :aria-label="$t('common.close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="size-table__tabs">
            <button
              :class="['size-table__tab', { 'size-table__tab--active': activeTab === 'normal' }]"
              @click="activeTab = 'normal'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {{ $t('productDetail.sizeTabNormal') }}
            </button>
            <button
              :class="['size-table__tab', { 'size-table__tab--active': activeTab === 'baby' }]"
              @click="activeTab = 'baby'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              {{ $t('productDetail.sizeTabBaby') }}
            </button>
          </div>

          <!-- Tab content -->
          <div class="size-table__body">
            <!-- NORMAL TAB -->
            <div v-show="activeTab === 'normal'" class="size-table__tab-content">
              <!-- Measurement diagram -->
              <div v-if="normalMeasureKeys.length" class="size-table__diagram">
                <div class="size-table__diagram-visual">
                  <div class="size-table__diagram-tshirt">
                    <!-- T-shirt outline SVG -->
                    <svg viewBox="0 0 200 160" fill="none" stroke="currentColor" stroke-width="1.5" class="size-table__diagram-svg">
                      <!-- T-shirt shape -->
                      <path d="M60 20 L40 30 L10 55 L30 75 L50 55 L50 140 L150 140 L150 55 L170 75 L190 55 L160 30 L140 20 L120 30 C110 40 90 40 80 30 Z" stroke="var(--text-muted)" stroke-width="1.5" fill="none"/>
                      <!-- Measurement lines -->
                      <!-- 1. Comprimento (length) - vertical line on left side -->
                      <g class="size-table__diagram-line" style="--diagram-color: var(--accent)">
                        <line x1="38" y1="35" x2="22" y2="140" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/>
                        <circle cx="38" cy="35" r="6" fill="var(--accent)"/>
                        <text x="38" y="35" fill="white" font-size="8" font-weight="700" text-anchor="middle" dominant-baseline="central">1</text>
                        <text x="12" y="88" fill="var(--accent)" font-size="9" font-weight="600" text-anchor="middle" transform="rotate(-90, 12, 88)">{{ $t('productDetail.sizeDiagram.comprimento') }}</text>
                      </g>
                      <!-- 2. Largura (width) - horizontal line across chest -->
                      <g class="size-table__diagram-line">
                        <line x1="52" y1="70" x2="148" y2="70" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/>
                        <circle cx="148" cy="70" r="6" fill="var(--accent)"/>
                        <text x="148" y="70" fill="white" font-size="8" font-weight="700" text-anchor="middle" dominant-baseline="central">2</text>
                        <text x="100" y="62" fill="var(--accent)" font-size="9" font-weight="600" text-anchor="middle">{{ $t('productDetail.sizeDiagram.largura') }}</text>
                      </g>
                      <!-- 3. Manga (sleeve) - line on sleeve -->
                      <g class="size-table__diagram-line">
                        <line x1="50" y1="52" x2="12" y2="62" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/>
                        <circle cx="12" cy="62" r="6" fill="var(--accent)"/>
                        <text x="12" y="62" fill="white" font-size="8" font-weight="700" text-anchor="middle" dominant-baseline="central">3</text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="size-table__scroll">
                <table class="size-table__table">
                  <thead>
                    <tr>
                      <th>{{ $t('productDetail.sizeTableSize') }}</th>
                      <th v-for="key in normalMeasureKeys" :key="key">
                        {{ $t(`productDetail.sizeDiagram.${key}`) }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in normalTable" :key="row.size">
                      <td class="size-table__size-cell">{{ row.size }}</td>
                      <td v-for="key in normalMeasureKeys" :key="key" class="size-table__measure-cell">
                        {{ row[key] }}<span class="size-table__unit">cm</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- BABY TAB -->
            <div v-show="activeTab === 'baby'" class="size-table__tab-content">
              <div class="size-table__baby-info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <div>
                  <h4>{{ $t('productDetail.sizeTabBaby') }}</h4>
                  <p>{{ $t('productDetail.sizeTableBabyDesc') }}</p>
                </div>
              </div>

              <div class="size-table__scroll">
                <table class="size-table__table">
                  <thead>
                    <tr>
                      <th>{{ $t('productDetail.sizeTableSize') }}</th>
                      <th>{{ $t('productDetail.sizeDiagram.idade') }}</th>
                      <th>{{ $t('productDetail.sizeDiagram.comprimento') }}</th>
                      <th>{{ $t('productDetail.sizeDiagram.largura') }}</th>
                      <th>{{ $t('productDetail.sizeDiagram.manga') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in babyTable" :key="row.size">
                      <td class="size-table__size-cell">{{ row.size }}</td>
                      <td>{{ row.idade }}</td>
                      <td>{{ row.comprimento }}<span class="size-table__unit">cm</span></td>
                      <td>{{ row.largura }}<span class="size-table__unit">cm</span></td>
                      <td>{{ row.manga }}<span class="size-table__unit">cm</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Notes (shared) -->
          <div class="size-table__notes">
            <p class="size-table__note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ $t('productDetail.sizeTableShrink') }}
            </p>
            <p class="size-table__note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              {{ $t('productDetail.sizeTableVariation') }}
            </p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  productCategory: { type: [String, Number], default: null },
  productType: { type: String, default: '' },
  categoryName: { type: String, default: '' }
})

const isOpen = ref(false)
const activeTab = ref('normal')

// ==================== NORMAL TABLE ====================
const normalTable = [
  { size: 'PP',  comprimento: 68, largura: 49, manga: 16 },
  { size: 'P',   comprimento: 71, largura: 52, manga: 17 },
  { size: 'M',   comprimento: 73, largura: 55, manga: 18 },
  { size: 'G',   comprimento: 76, largura: 58, manga: 19 },
  { size: 'GG',  comprimento: 79, largura: 61, manga: 20 },
  { size: '2GG', comprimento: 81, largura: 64, manga: 22 },
  { size: '3GG', comprimento: 84, largura: 68, manga: 23 },
  { size: '4GG', comprimento: 87, largura: 71, manga: 24 }
]

const normalMeasureKeys = computed(() => {
  if (normalTable.length === 0) return []
  return Object.keys(normalTable[0]).filter(k => k !== 'size')
})

// ==================== BABY TABLE ====================
const babyTable = [
  { size: '1',   idade: '1-2 anos',  comprimento: 40, largura: 30, manga: 10 },
  { size: '2',   idade: '3-4 anos',  comprimento: 45, largura: 33, manga: 11 },
  { size: '3',   idade: '5-6 anos',  comprimento: 50, largura: 36, manga: 12 },
  { size: '4',   idade: '7-8 anos',  comprimento: 55, largura: 39, manga: 13 },
  { size: '5',   idade: '9-10 anos', comprimento: 60, largura: 42, manga: 14 },
  { size: '6',   idade: '11-12 anos', comprimento: 65, largura: 45, manga: 15 }
]

// ==================== DETECTION ====================
const isCamiseta = computed(() => {
  const cat = String(props.categoryName || '').toLowerCase()
  const type = String(props.productType || '').toLowerCase()
  const catId = Number(props.productCategory)
  return cat.includes('camiseta') || cat.includes('t-shirt') || cat.includes('tshirt') || type.includes('camiseta') || catId === 1
})

const shouldShow = computed(() => isCamiseta.value)
</script>

<style scoped>
/* ========== TRIGGER BUTTON ========== */
.size-table-trigger {
  margin-top: clamp(0.75rem, 1.5vh, 1rem);
}

.size-table-trigger__btn {
  display: inline-flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.625rem);
  padding: clamp(0.5rem, 1vh, 0.625rem) clamp(0.875rem, 2vw, 1.125rem);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.size-table-trigger__btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-light);
}

.size-table-trigger__btn svg {
  color: var(--accent);
  flex-shrink: 0;
}

/* ========== OVERLAY ========== */
.size-table__fade-enter-active,
.size-table__fade-leave-active {
  transition: opacity var(--transition-smooth);
}

.size-table__fade-enter-from,
.size-table__fade-leave-to {
  opacity: 0;
}

.size-table__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(0.5rem);
  -webkit-backdrop-filter: blur(0.5rem);
  padding: clamp(1rem, 3vw, 2rem);
  animation: size-table__overlay-in var(--transition-smooth);
}

@keyframes size-table__overlay-in {
  from { background: rgba(0, 0, 0, 0); }
  to { background: rgba(0, 0, 0, 0.7); }
}

/* ========== MODAL ========== */
.size-table__modal {
  width: 100%;
  max-width: 40rem;
  max-height: 90vh;
  background: var(--surface-2);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: size-table__modal-in 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes size-table__modal-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal header */
.size-table__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(1rem, 2vh, 1.25rem) clamp(1.25rem, 3vw, 1.5rem);
  border-bottom: 1px solid var(--border);
}

.size-table__header h3 {
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.size-table__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.size-table__close:hover {
  color: var(--text-primary);
  background: var(--surface-3);
}

/* Tabs */
.size-table__tabs {
  display: flex;
  gap: 0;
  padding: clamp(0.75rem, 1.5vh, 1rem) clamp(1.25rem, 3vw, 1.5rem) 0;
  border-bottom: 2px solid var(--border);
}

.size-table__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: clamp(0.5rem, 1vh, 0.625rem) clamp(0.75rem, 1.5vw, 1rem);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  font-weight: 600;
  color: var(--text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.size-table__tab:hover {
  color: var(--text-secondary);
}

.size-table__tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.size-table__tab svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.size-table__tab--active svg {
  opacity: 1;
}

/* Body */
.size-table__body {
  padding: clamp(1rem, 2vh, 1.25rem) clamp(1.25rem, 3vw, 1.5rem);
  overflow-y: auto;
  flex: 1;
}

/* T-shirt diagram */
.size-table__diagram {
  margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
}

.size-table__diagram-visual {
  display: flex;
  justify-content: center;
  padding: clamp(0.5rem, 1vw, 0.75rem);
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.size-table__diagram-tshirt {
  width: clamp(11.25rem, 50vw, 15rem);
  height: clamp(8.75rem, 38vw, 11.5625rem);
}

.size-table__diagram-svg {
  width: 100%;
  height: 100%;
}

/* Scrollable table */
.size-table__scroll {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.size-table__table {
  width: 100%;
  min-width: 300px;
  border-collapse: collapse;
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
}

.size-table__table th {
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.75rem);
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--surface-1);
  border-bottom: 2px solid var(--border);
  white-space: nowrap;
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.size-table__table th:first-child {
  text-align: left;
}

.size-table__table td {
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.75rem);
  text-align: center;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
}

.size-table__size-cell {
  text-align: left !important;
  font-weight: 700;
  color: var(--accent) !important;
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
}

.size-table__measure-cell {
  font-family: var(--font-mono);
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
}

.size-table__unit {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-left: 0.0625rem;
}

.size-table__table tbody tr:last-child td {
  border-bottom: none;
}

.size-table__table tbody tr:hover {
  background: var(--surface-1);
}

/* Baby tab info */
.size-table__baby-info {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.625rem, 1.25vw, 0.875rem);
  padding: clamp(0.625rem, 1.25vh, 0.875rem);
  margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.size-table__baby-info svg {
  flex-shrink: 0;
  color: var(--accent);
  margin-top: 0.125rem;
}

.size-table__baby-info h4 {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 600;
  margin-bottom: 0.125rem;
}

.size-table__baby-info p {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-muted);
  line-height: 1.5;
}

/* Notes */
.size-table__notes {
  padding: clamp(0.75rem, 1.5vh, 1rem) clamp(1.25rem, 3vw, 1.5rem);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vh, 0.5rem);
  background: var(--surface-1);
}

.size-table__note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  color: var(--text-muted);
  line-height: 1.5;
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.75rem);
  background: var(--surface-2);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--warning);
}

.size-table__note svg {
  flex-shrink: 0;
  margin-top: 0.0625rem;
  color: var(--warning);
}

/* Responsive */
@media (max-width: 480px) {
  .size-table__modal {
    max-height: 95vh;
  }

  .size-table__tabs {
    padding: 0.75rem 1rem 0;
  }

  .size-table__tab {
    font-size: 0.7rem;
  }

  .size-table__body {
    padding: 0.75rem 1rem;
  }

  .size-table__diagram-tshirt {
    width: 10rem;
    height: 7.8125rem;
  }

  .size-table__notes {
    padding: 0.75rem 1rem;
  }
}
</style>
