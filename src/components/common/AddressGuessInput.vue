<template>
  <div class="address-guess" :class="{ 'address-guess--focused': isFocused, 'address-guess--has-results': showSuggestions && suggestions.length > 0 }">
    <!-- Postal code input (first step) -->
    <div class="address-guess__postal" v-if="!postalCodeConfirmed">
      <label class="address-guess__label">{{ postalCodeLabel }}</label>
      <div class="address-guess__input-wrap" :class="{ 'address-guess__input-wrap--loading': loading }">
        <input
          v-model="postalInput"
          :placeholder="postalCodePlaceholder"
          :maxlength="country === 'BR' ? 9 : 20"
          @input="onPostalInput"
          @blur="onPostalBlur"
          @focus="isFocused = true"
          @keydown.enter.prevent="searchPostalCode"
          class="address-guess__input"
        />
        <div v-if="loading" class="address-guess__spinner" aria-hidden="true"></div>
        <button v-else @mousedown.prevent="searchPostalCode" class="address-guess__search-btn" aria-label="Search address">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>
      <p v-if="postalError" class="address-guess__error">{{ postalError }}</p>
    </div>

    <!-- Address suggestions (after postal code lookup) -->
    <template v-if="postalCodeConfirmed">
      <!-- Full address display with edit capability -->
      <div class="address-guess__resolved" v-if="resolvedAddress && !editingMode">
        <div class="address-guess__resolved-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ $t('checkout.addressGuessed') }}</span>
        </div>
        <p class="address-guess__resolved-address">{{ formattedAddress }}</p>
        <button @click="startEditing" class="address-guess__edit-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          {{ $t('checkout.editAddress') }}
        </button>
      </div>

      <!-- Manual editing mode with suggestions -->
      <div v-else class="address-guess__edit-mode">
        <div class="address-guess__fields" :class="country === 'BR' ? 'address-guess__fields--br' : ''">
          <!-- Street -->
          <div class="address-guess__field address-guess__field--full">
            <label class="address-guess__label">{{ $t('checkout.step2.street') }}</label>
            <div class="address-guess__input-wrap">
              <input
                v-model="editFields.address"
                :placeholder="$t('checkout.step2.placeholders.street')"
                @input="onAddressInput"
                @focus="isFocused = true"
                @blur="onFieldBlur"
                class="address-guess__input"
              />
            </div>
          </div>

          <!-- Number + Complement -->
          <div class="address-guess__row">
            <div class="address-guess__field">
              <label class="address-guess__label">{{ $t('checkout.step2.number') }}</label>
              <div class="address-guess__input-wrap">
                <input
                  v-model="editFields.number"
                  :placeholder="$t('checkout.step2.placeholders.number')"
                  @focus="isFocused = true"
                  class="address-guess__input"
                />
              </div>
            </div>
            <div class="address-guess__field">
              <label class="address-guess__label">{{ $t('checkout.step2.complement') }}</label>
              <div class="address-guess__input-wrap">
                <input
                  v-model="editFields.complement"
                  :placeholder="$t('checkout.step2.placeholders.complement')"
                  @focus="isFocused = true"
                  class="address-guess__input"
                />
              </div>
            </div>
          </div>

          <!-- Neighborhood (Brazil only) -->
          <div v-if="country === 'BR'" class="address-guess__field address-guess__field--full">
            <label class="address-guess__label">{{ $t('checkout.step2.neighborhood') }}</label>
            <div class="address-guess__input-wrap">
              <input
                v-model="editFields.neighborhood"
                :placeholder="$t('checkout.step2.placeholders.neighborhood')"
                @focus="isFocused = true"
                class="address-guess__input"
              />
            </div>
          </div>

          <!-- City + State -->
          <div class="address-guess__row">
            <div class="address-guess__field">
              <label class="address-guess__label">{{ $t('checkout.step2.city') }}</label>
              <div class="address-guess__input-wrap">
                <input
                  v-model="editFields.city"
                  :placeholder="$t('checkout.step2.placeholders.city')"
                  @focus="isFocused = true"
                  @input="onCityStateInput"
                  class="address-guess__input"
                />
              </div>
            </div>
            <div class="address-guess__field">
              <label class="address-guess__label">{{ $t('checkout.step2.state') }}</label>
              <div class="address-guess__input-wrap">
                <input
                  v-model="editFields.state"
                  :placeholder="$t('checkout.step2.placeholders.state')"
                  :maxlength="country === 'BR' ? 2 : 40"
                  @focus="isFocused = true"
                  @input="onCityStateInput"
                  class="address-guess__input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Suggestions dropdown -->
        <transition name="suggestions-fade">
          <div v-if="showSuggestions && suggestions.length > 0" class="address-guess__suggestions">
            <button
              v-for="(suggestion, index) in suggestions"
              :key="index"
              @click="selectSuggestion(suggestion)"
              class="address-guess__suggestion-item"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{{ suggestion.display_name }}</span>
            </button>
          </div>
        </transition>

        <!-- Accept / Override toggle -->
        <div class="address-guess__actions">
          <button v-if="!addressConfirmed" @click="confirmAddress" class="address-guess__confirm-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ $t('checkout.useThisAddress') }}
          </button>
          <button v-if="!addressConfirmed" @click="fallbackManualEntry" class="address-guess__fallback-btn">
            {{ $t('checkout.enterManually') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { lookupCEP, getStateFromCEP } from '../../stores/shipping'

const props = defineProps({
  country: { type: String, default: 'BR' },
  initialPostalCode: { type: String, default: '' },
  initialAddress: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['address-resolved', 'address-updated'])

// State
const isFocused = ref(false)
const loading = ref(false)
const postalCodeConfirmed = ref(false)
const editingMode = ref(false)
const addressConfirmed = ref(false)
const showSuggestions = ref(false)
const suggestions = ref([])
const postalError = ref('')

const postalInput = ref(props.initialPostalCode || '')
const resolvedAddress = ref(null)

const editFields = reactive({
  address: props.initialAddress.address || '',
  number: props.initialAddress.number || '',
  complement: props.initialAddress.complement || '',
  neighborhood: props.initialAddress.neighborhood || '',
  city: props.initialAddress.city || '',
  state: props.initialAddress.state || ''
})

let debounceTimer = null
let searchAbortController = null

// Computed
const postalCodeLabel = computed(() => {
  if (props.country === 'BR') return 'CEP'
  if (props.country === 'US') return 'ZIP Code'
  return 'Postal Code'
})

const postalCodePlaceholder = computed(() => {
  if (props.country === 'BR') return '00000-000'
  if (props.country === 'US') return '10001'
  return 'Enter postal code'
})

const formattedAddress = computed(() => {
  if (!resolvedAddress.value) return ''
  const a = resolvedAddress.value
  const parts = [
    a.address,
    a.number ? `nº ${a.number}` : '',
    a.complement || '',
    a.neighborhood ? `- ${a.neighborhood}` : '',
    a.city,
    a.state ? ` - ${a.state}` : '',
    `CEP: ${postalInput.value}`
  ].filter(Boolean)
  return parts.join(', ')
})

// Functions
function onPostalInput() {
  postalError.value = ''
}

function onPostalBlur() {
  const code = postalInput.value.replace(/\D/g, '')
  if (props.country === 'BR' && code.length === 8) {
    searchPostalCode()
  }
}

async function searchPostalCode() {
  postalError.value = ''
  suggestions.value = []
  showSuggestions.value = false

  if (props.country === 'BR') {
    await searchBrazilianCEP()
  } else {
    await searchOpenStreetMap()
  }
}

async function searchBrazilianCEP() {
  const code = postalInput.value.replace(/\D/g, '')
  if (code.length !== 8) {
    postalError.value = 'CEP deve ter 8 dígitos'
    return
  }

  loading.value = true
  try {
    const data = await lookupCEP(code)
    if (data && !data.erro) {
      resolvedAddress.value = {
        address: data.logradouro || '',
        number: '',
        complement: data.complemento || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      }
      postalCodeConfirmed.value = true
      editingMode.value = true
      addressConfirmed.value = false

      // Populate edit fields
      Object.assign(editFields, resolvedAddress.value)

      emit('address-resolved', {
        postalCode: postalInput.value,
        ...resolvedAddress.value
      })
    } else {
      // Fallback: CEP not found on ViaCEP, try OpenStreetMap
      await searchOpenStreetMapForCEP(code)
    }
  } catch (err) {
    console.error('ViaCEP lookup error:', err)
    postalError.value = 'Erro ao buscar CEP'
    // Fallback to OpenStreetMap
    await searchOpenStreetMapForCEP(code)
  } finally {
    loading.value = false
  }
}

async function searchOpenStreetMapForCEP(cep) {
  try {
    const params = new URLSearchParams({
      postalcode: cep,
      countrycodes: 'br',
      format: 'json',
      addressdetails: '1',
      limit: '3'
    })
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BhumiShop/1.0' }
    })
    if (!response.ok) {
      postalError.value = 'Erro ao buscar endereço. Preencha manualmente.'
      postalCodeConfirmed.value = true
      editingMode.value = true
      return
    }
    const data = await response.json()
    if (data.length > 0) {
      processOSMResults(data)
    } else {
      postalError.value = 'CEP não encontrado. Preencha manualmente.'
      // Still allow manual entry - set postal code confirmed with empty address
      postalCodeConfirmed.value = true
      editingMode.value = true
    }
  } catch {
    postalError.value = 'Erro ao buscar endereço. Preencha manualmente.'
    postalCodeConfirmed.value = true
    editingMode.value = true
  }
}

async function searchOpenStreetMap() {
  const code = postalInput.value.trim()
  if (!code) {
    postalError.value = 'Postal code is required'
    return
  }

  loading.value = true
  try {
    const countryCode = props.country.toLowerCase()
    const params = new URLSearchParams({
      postalcode: code,
      countrycodes: countryCode,
      format: 'json',
      addressdetails: '1',
      limit: '3'
    })
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BhumiShop/1.0' }
    })
    if (!response.ok) {
      postalError.value = 'Error searching address. Please enter manually.'
      postalCodeConfirmed.value = true
      editingMode.value = true
      loading.value = false
      return
    }
    const data = await response.json()
    if (data.length > 0) {
      processOSMResults(data)
    } else {
      postalError.value = 'Postal code not found. Please enter address manually.'
      postalCodeConfirmed.value = true
      editingMode.value = true
    }
  } catch (err) {
    console.error('OpenStreetMap lookup error:', err)
    postalError.value = 'Error searching address. Please enter manually.'
    postalCodeConfirmed.value = true
    editingMode.value = true
  } finally {
    loading.value = false
  }
}

function processOSMResults(results) {
  suggestions.value = results.map(r => ({
    display_name: r.display_name,
    lat: r.lat,
    lon: r.lon,
    address: r.address
  }))

  if (results.length === 1) {
    // Auto-select single result
    selectSuggestion(suggestions.value[0])
  } else {
    // Show suggestions for user to pick
    showSuggestions.value = true
    postalCodeConfirmed.value = true
    editingMode.value = true
  }
}

function selectSuggestion(suggestion) {
  showSuggestions.value = false
  const addr = suggestion.address || {}

  resolvedAddress.value = {
    address: addr.road || addr.street || addr.pedestrian || '',
    number: addr.house_number || '',
    complement: '',
    neighborhood: addr.suburb || addr.neighborhood || addr.quarter || '',
    city: addr.city || addr.town || addr.municipality || addr.village || '',
    state: addr.state || ''
  }

  Object.assign(editFields, resolvedAddress.value)
  addressConfirmed.value = false

  emit('address-resolved', {
    postalCode: postalInput.value,
    ...resolvedAddress.value
  })
}

function startEditing() {
  editingMode.value = true
  addressConfirmed.value = false
  Object.assign(editFields, resolvedAddress.value)
}

function confirmAddress() {
  addressConfirmed.value = true
  editingMode.value = false
  emit('address-updated', {
    postalCode: postalInput.value,
    ...editFields
  })
}

function fallbackManualEntry() {
  // Just clear resolved and keep fields empty for manual entry
  resolvedAddress.value = null
  editingMode.value = true
  addressConfirmed.value = false
  Object.keys(editFields).forEach(key => { editFields[key] = '' })
}

function onAddressInput() {
  // Debounced search for address suggestions
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (editFields.address.length >= 3 && editFields.city) {
      searchAddressSuggestions()
    } else {
      suggestions.value = []
      showSuggestions.value = false
    }
  }, 600)
}

function onCityStateInput() {
  // Also trigger suggestions when city changes
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (editFields.address.length >= 3 && editFields.city) {
      searchAddressSuggestions()
    } else {
      suggestions.value = []
      showSuggestions.value = false
    }
  }, 600)
}

async function searchAddressSuggestions() {
  if (searchAbortController) {
    searchAbortController.abort()
  }
  searchAbortController = new AbortController()

  const query = [editFields.address, editFields.city, editFields.state].filter(Boolean).join(', ')
  if (query.length < 5) return

  try {
    const countryCode = props.country.toLowerCase()
    const params = new URLSearchParams({
      q: query,
      countrycodes: countryCode,
      format: 'json',
      addressdetails: '1',
      limit: '5'
    })
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BhumiShop/1.0' },
      signal: searchAbortController.signal
    })
    if (!response.ok) {
      suggestions.value = []
      showSuggestions.value = false
      return
    }
    const data = await response.json()
    suggestions.value = data.map(r => ({
      display_name: r.display_name,
      lat: r.lat,
      lon: r.lon,
      address: r.address
    }))
    showSuggestions.value = data.length > 0
  } catch {
    // Aborted or failed - ignore
  }
}

function onFieldBlur() {
  // Delay hiding suggestions so click can register
  setTimeout(() => {
    if (!showSuggestions.value) return
    // Check if any suggestion is being hovered (not needed for click-based)
  }, 200)
}

// Watch for external changes
watch(() => props.initialPostalCode, (val) => {
  if (val && !postalCodeConfirmed.value) {
    postalInput.value = val
  }
})

onUnmounted(() => {
  clearTimeout(debounceTimer)
  if (searchAbortController) {
    searchAbortController.abort()
  }
})

// Expose method to get current address data
defineExpose({
  getAddressData: () => ({
    postalCode: postalInput.value,
    ...editFields,
    confirmed: addressConfirmed.value
  })
})
</script>

<style scoped>
.address-guess {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vh, 1rem);
}

.address-guess__label {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  font-weight: 500;
  color: var(--text-secondary);
  display: block;
  margin-bottom: clamp(0.25rem, 0.5vh, 0.375rem);
}

.address-guess__input-wrap {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-0);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.address-guess--focused .address-guess__input-wrap {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

.address-guess__input-wrap--loading {
  opacity: 0.7;
}

.address-guess__input {
  flex: 1;
  padding: clamp(0.5rem, 1vw, 0.625rem) clamp(0.75rem, 1.5vw, 0.875rem);
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  outline: none;
  font-family: inherit;
}

.address-guess__input::placeholder {
  color: var(--text-muted);
}

.address-guess__search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(2.5rem, 5vw, 2.75rem);
  height: 100%;
  min-height: clamp(2.5rem, 5vw, 2.75rem);
  border: none;
  background: var(--surface-1);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.address-guess__search-btn:hover {
  background: var(--surface-2);
  color: var(--accent);
}

.address-guess__spinner {
  width: clamp(1.25rem, 2.5vw, 1.5rem);
  height: clamp(1.25rem, 2.5vw, 1.5rem);
  border: 2px solid var(--surface-2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: clamp(0.5rem, 1vw, 0.625rem);
}

.address-guess__error {
  font-size: clamp(0.65rem, 1vw, 0.75rem);
  color: var(--danger);
  margin-top: clamp(0.125rem, 0.3vh, 0.25rem);
}

/* Resolved address */
.address-guess__resolved {
  padding: clamp(0.75rem, 1.5vw, 1rem);
  background: var(--surface-1);
  border: 1px solid var(--accent-subtle);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vh, 0.5rem);
}

.address-guess__resolved-header {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  font-weight: 600;
  color: var(--accent);
}

.address-guess__resolved-address {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
}

.address-guess__edit-btn {
  display: inline-flex;
  align-items: center;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.625rem, 1.2vw, 0.75rem);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  cursor: pointer;
  transition: all var(--transition-fast);
  align-self: flex-start;
}

.address-guess__edit-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* Edit mode */
.address-guess__edit-mode {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vh, 0.75rem);
}

.address-guess__fields {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vh, 0.75rem);
}

.address-guess__field {
  flex: 1;
  min-width: 0;
}

.address-guess__field--full {
  flex: unset;
  width: 100%;
}

.address-guess__row {
  display: flex;
  gap: clamp(0.5rem, 1vw, 0.75rem);
}

.address-guess__row .address-guess__field {
  flex: 1;
}

/* Suggestions dropdown */
.address-guess__suggestions {
  max-height: clamp(10rem, 30vh, 14rem);
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-0);
  -webkit-overflow-scrolling: touch;
}

.address-guess__suggestion-item {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.625rem);
  width: 100%;
  padding: clamp(0.625rem, 1.2vw, 0.75rem) clamp(0.75rem, 1.5vw, 0.875rem);
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: clamp(0.75rem, 1.3vw, 0.825rem);
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast);
  border-bottom: 1px solid var(--surface-1);
}

.address-guess__suggestion-item:last-child {
  border-bottom: none;
}

.address-guess__suggestion-item:hover {
  background: var(--surface-1);
}

.address-guess__suggestion-item svg {
  flex-shrink: 0;
  opacity: 0.6;
}

/* Actions */
.address-guess__actions {
  display: flex;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  align-items: center;
  margin-top: clamp(0.25rem, 0.5vh, 0.375rem);
}

.address-guess__confirm-btn {
  display: inline-flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  padding: clamp(0.5rem, 1vw, 0.625rem) clamp(1rem, 2vw, 1.25rem);
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.address-guess__confirm-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--glow-accent);
}

.address-guess__confirm-btn svg {
  flex-shrink: 0;
}

.address-guess__fallback-btn {
  padding: clamp(0.5rem, 1vw, 0.625rem) clamp(1rem, 2vw, 1.25rem);
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.address-guess__fallback-btn:hover {
  border-color: var(--text-secondary);
  color: var(--text-secondary);
}

/* Transition */
.suggestions-fade-enter-active,
.suggestions-fade-leave-active {
  transition: all 0.2s ease;
}

.suggestions-fade-enter-from,
.suggestions-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 560px) {
  .address-guess__row {
    flex-direction: column;
  }

  .address-guess__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .address-guess__confirm-btn,
  .address-guess__fallback-btn {
    justify-content: center;
  }
}
</style>
