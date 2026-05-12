<template>
  <div class="auth-page">
    <!-- LetterGlitch background -->
    <div class="auth-page__letterglitch">
      <LetterGlitch
        :glitch-colors="['#2b4539', '#61dca3', '#61b3dc']"
        :glitch-speed="50"
        :center-vignette="false"
        :outer-vignette="false"
        :smooth="true"
      />
    </div>

    <div class="auth-card">
      <!-- DarkVeil background - absolutely positioned behind content -->
      <div class="auth-card__bg">
        <DarkVeil
          :hue-shift="120"
          :noise-intensity="0"
          :scanline-intensity="0"
          :speed="0.5"
          :scanline-frequency="0"
          :warp-amount="0"
          :resolution-scale="1"
        />
      </div>

      <div class="auth-card__content">
        <div class="auth-card__header">
          <router-link to="/" class="auth-card__logo">
            <span class="auth-card__logo-text">Bhumi</span><span class="auth-card__logo-accent">Shop</span>
          </router-link>
        </div>

        <!-- Auth Stepper: Login -> Location -> Welcome -->
        <Stepper
          ref="stepperRef"
          :initial-step="1"
          :next-button-text="$t('auth.continue')"
          :back-button-text="$t('auth.back')"
          :complete-button-text="$t('auth.exploreNow')"
          :loading="authStore.loading"
          :on-complete="onAuthComplete"
          @step-change="onStepChange"
        >
          <!-- Step 1: Login (with terms acceptance + social login) -->
          <div>
            <h2 class="auth-step__title">{{ $t('auth.login') }}</h2>
            <p class="auth-step__subtitle">{{ $t('auth.termsSubtitle') }}</p>

            <!-- Terms checkbox -->
            <div class="auth-terms-box">
              <label class="auth-checkbox" for="terms-accept">
                <input
                  id="terms-accept"
                  v-model="acceptedTerms"
                  type="checkbox"
                  class="auth-checkbox__input"
                />
                <span class="auth-checkbox__checkmark"></span>
                <span class="auth-checkbox__label">
                  {{ $t('auth.acceptTerms') }}
                  <a href="#privacy" class="auth-link">{{ $t('auth.privacyPolicy') }}</a>
                  {{ $t('auth.and') }}
                  <a href="#terms" class="auth-link">{{ $t('auth.termsOfService') }}</a>
                </span>
              </label>
            </div>

            <!-- Social login buttons -->
            <div class="auth-social-buttons">
              <BaseButton variant="secondary" full :disabled="!acceptedTerms" @click="handleGoogleLogin" class="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {{ $t('auth.google') }}
              </BaseButton>

              <BaseButton variant="secondary" full :disabled="!acceptedTerms" @click="handleWechatLogin" class="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.438 1.703-1.407 3.882-1.986 6.3-1.626-.424-3.592-4.311-6.397-8.843-6.397zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.046c.133 0 .241-.11.241-.245 0-.06-.023-.118-.038-.177l-.326-1.233a.492.492 0 0 1 .177-.554C23.028 18.572 24 16.89 24 14.916c0-3.257-3.095-6.034-7.062-6.058zM14.87 13.3c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z"/></svg>
                {{ $t('auth.wechat') }}
              </BaseButton>

              <BaseButton variant="secondary" full :disabled="!acceptedTerms" @click="togglePhoneForm" class="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                {{ $t('auth.sms') }}
              </BaseButton>
            </div>

            <!-- Phone OTP form -->
            <div v-if="showPhoneForm" class="auth-phone-form">
              <form class="auth-form" @submit.prevent="handlePhoneSubmit">
                <BaseInput
                  v-model="phoneForm.phone"
                  :label="$t('auth.phone')"
                  type="tel"
                  :placeholder="$t('auth.phonePlaceholder')"
                  required
                  :error="errors.phone"
                />
                <BaseButton variant="primary" full :loading="authStore.loading" type="submit">
                  {{ $t('auth.sendSmsCode') }}
                </BaseButton>
                <div v-if="phoneSuccess" class="auth-form__success">
                  {{ $t('auth.codeSent') }}
                </div>
              </form>
            </div>
          </div>

          <!-- Step 2: Location Configuration -->
          <div>
            <h2 class="auth-step__title">{{ $t('auth.setLocation') }}</h2>
            <p class="auth-step__subtitle">{{ $t('auth.setLocationSubtitle') }}</p>

            <!-- Detect my location button -->
            <BaseButton variant="secondary" full :loading="geoDetecting" @click="detectMyLocation" class="auth-geo-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
              </svg>
              {{ geoDetecting ? $t('auth.detectingLocation') : $t('auth.detectMyLocation') }}
            </BaseButton>
            <div v-if="geoError" class="auth-form__error">{{ geoError }}</div>

            <!-- Search location -->
            <div class="location-search">
              <div class="location-search__input-wrapper">
                <svg class="location-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  v-model="locationQuery"
                  type="text"
                  class="location-search__input"
                  :placeholder="$t('auth.searchLocation')"
                  @input="debouncedSearch"
                  @focus="showSuggestions = true"
                  @blur="hideSuggestionsDelayed"
                />
                <button
                  v-if="locationQuery"
                  type="button"
                  class="location-search__clear"
                  @click="clearSearch"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <!-- Loading state -->
              <div v-if="locationLoading" class="location-search__loading">
                <span class="location-search__spinner"></span>
                <span>{{ $t('auth.searching') }}</span>
              </div>

              <!-- Suggestions dropdown -->
              <Transition name="suggestions-fade">
                <ul v-if="showSuggestions && locationSuggestions.length > 0" class="location-search__suggestions">
                  <li
                    v-for="(suggestion, index) in locationSuggestions"
                    :key="suggestion.place_id"
                    :class="['location-search__suggestion', { 'location-search__suggestion--active': activeSuggestionIndex === index }]"
                    @mousedown.prevent="selectSuggestion(suggestion)"
                  >
                    <svg class="location-search__suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span class="location-search__suggestion-text">{{ suggestion.display_name }}</span>
                  </li>
                </ul>
              </Transition>
            </div>

            <!-- Selected location display -->
            <div v-if="selectedLocation" class="location-selected">
              <svg class="location-selected__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div class="location-selected__info">
                <p class="location-selected__name">{{ selectedLocation.name }}</p>
                <p v-if="selectedLocation.street" class="location-selected__detail">{{ selectedLocation.street }}<template v-if="selectedLocation.number">, {{ selectedLocation.number }}</template></p>
                <p v-if="selectedLocation.neighborhood" class="location-selected__detail">{{ selectedLocation.neighborhood }}</p>
                <p class="location-selected__city-state">
                  <template v-if="selectedLocation.city">{{ selectedLocation.city }}</template>
                  <template v-if="selectedLocation.state">, {{ selectedLocation.state }}</template>
                  <template v-if="selectedLocation.postalCode"> - {{ selectedLocation.postalCode }}</template>
                </p>
                <p v-if="selectedLocation.country" class="location-selected__country">{{ selectedLocation.country }}</p>
              </div>
              <button type="button" class="location-selected__change" @click="changeLocation">
                {{ $t('auth.changeLocation') }}
              </button>
            </div>

            <!-- Mini map preview -->
            <div v-if="selectedLocation && selectedLocation.lat && selectedLocation.lon" class="location-map-preview">
              <img
                :src="getMapImageUrl(selectedLocation.lat, selectedLocation.lon)"
                :alt="selectedLocation.name"
                class="location-map-preview__image"
                loading="lazy"
              />
              <div class="location-map-preview__overlay">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Step 3: Welcome -->
          <div>
            <div class="auth-stepper__welcome">
              <svg class="auth-stepper__success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3 class="auth-stepper__title">{{ $t('auth.welcome') }}</h3>
              <p class="auth-stepper__text">{{ $t('auth.welcomeMessage') }}</p>
              <p v-if="selectedLocation" class="auth-stepper__location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ selectedLocation.name }}
              </p>
            </div>
          </div>
        </Stepper>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import DarkVeil from '../components/common/DarkVeil.vue'
import LetterGlitch from '../components/common/LetterGlitch.vue'
import Stepper from '../components/common/Stepper.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()

const stepperRef = ref(null)
const acceptedTerms = ref(false)
const showPhoneForm = ref(false)
const phoneSuccess = ref(false)

// Phone form
const phoneForm = reactive({
  phone: ''
})

const errors = reactive({
  phone: ''
})

// Location state
const locationQuery = ref('')
const locationSuggestions = ref([])
const locationLoading = ref(false)
const selectedLocation = ref(null)
const showSuggestions = ref(false)
const activeSuggestionIndex = ref(-1)
const geoDetecting = ref(false)
const geoError = ref('')
let searchTimeout = null
let hideTimeout = null

// Nominatim API (OpenStreetMap - free, no API key)
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

// Country code to country name mapping for common countries
const COUNTRY_NAMES = {
  'BR': 'Brazil', 'US': 'United States', 'CN': 'China', 'JP': 'Japan',
  'GB': 'United Kingdom', 'DE': 'Germany', 'FR': 'France', 'IT': 'Italy',
  'ES': 'Spain', 'PT': 'Portugal', 'CA': 'Canada', 'AU': 'Australia',
  'IN': 'India', 'KR': 'South Korea', 'MX': 'Mexico', 'AR': 'Argentina',
  'TH': 'Thailand', 'VN': 'Vietnam', 'ID': 'Indonesia', 'PH': 'Philippines',
  'MY': 'Malaysia', 'SG': 'Singapore', 'NZ': 'New Zealand', 'ZA': 'South Africa',
  'AE': 'UAE', 'SA': 'Saudi Arabia', 'RU': 'Russia', 'TR': 'Turkey',
  'NL': 'Netherlands', 'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria',
  'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
  'PL': 'Poland', 'CZ': 'Czech Republic', 'IE': 'Ireland', 'IL': 'Israel',
  'CO': 'Colombia', 'CL': 'Chile', 'PE': 'Peru', 'UY': 'Uruguay',
  'NE': 'Nepal',
}

async function searchLocation(query) {
  if (!query || query.length < 3) {
    locationSuggestions.value = []
    return
  }

  locationLoading.value = true
  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&accept-language=${getLocaleCode()}`
    )
    if (!response.ok) throw new Error('Search failed')
    const data = await response.json()
    locationSuggestions.value = data.map(item => parseNominatimResult(item))
  } catch (err) {
    console.error('Location search error:', err)
    locationSuggestions.value = []
  } finally {
    locationLoading.value = false
  }
}

// Parse Nominatim result into structured address
function parseNominatimResult(item) {
  const addr = item.address || {}
  const country = addr.country || ''
  const countryCode = addr.country_code?.toUpperCase() || ''

  // Brazil-specific: extract CEP if available
  const postcode = addr.postcode || ''

  return {
    place_id: item.place_id,
    display_name: item.display_name,
    lat: item.lat,
    lon: item.lon,
    // Detailed address fields
    street: addr.road || addr.pedestrian || addr.highway || '',
    number: addr.house_number || '',
    neighborhood: addr.suburb || addr.neighbourhood || addr.quarter || '',
    city: addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || '',
    state: addr.state || '',
    stateCode: addr.ISO31642 || '',
    country,
    countryCode,
    postalCode: postcode,
    name: addr.city || addr.town || addr.village || addr.hamlet || item.name || '',
    type: item.type
  }
}

// Reverse geocoding from lat/lon
async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=${getLocaleCode()}`
    )
    if (!response.ok) throw new Error('Reverse geocode failed')
    const data = await response.json()
    return parseNominatimResult(data)
  } catch (err) {
    console.error('Reverse geocode error:', err)
    return null
  }
}

// Browser geolocation detection
async function detectMyLocation() {
  if (!navigator.geolocation) {
    geoError.value = t('auth.errors.geoNotSupported')
    return
  }

  geoDetecting.value = true
  geoError.value = ''

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes cache
      })
    })

    const { latitude, longitude } = position.coords
    const address = await reverseGeocode(latitude, longitude)

    if (address) {
      selectSuggestion(address)
    } else {
      geoError.value = t('auth.errors.geoLookupFailed')
    }
  } catch (err) {
    console.error('Geolocation error:', err)
    if (err.code === 1) {
      geoError.value = t('auth.errors.geoPermissionDenied')
    } else if (err.code === 3) {
      geoError.value = t('auth.errors.geoTimeout')
    } else {
      geoError.value = t('auth.errors.geoUnknown')
    }
  } finally {
    geoDetecting.value = false
  }
}

function getLocaleCode() {
  const locale = document.documentElement.lang || 'en'
  return locale.split('-')[0]
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchLocation(locationQuery.value)
  }, 400)
}

function selectSuggestion(suggestion) {
  selectedLocation.value = suggestion
  locationQuery.value = suggestion.name
  locationSuggestions.value = []
  showSuggestions.value = false
  activeSuggestionIndex.value = -1

  // Save to auth store for downstream use
  authStore.setLocation(suggestion)

  // Mark step as valid
  if (stepperRef.value) {
    stepperRef.value.markStepValid(2)
  }
}

function clearSearch() {
  locationQuery.value = ''
  locationSuggestions.value = []
  selectedLocation.value = null
  showSuggestions.value = false
  activeSuggestionIndex.value = -1
  authStore.clearLocation()
}

function changeLocation() {
  selectedLocation.value = null
  locationQuery.value = ''
  locationSuggestions.value = []
  showSuggestions.value = true
  authStore.clearLocation()
}

function hideSuggestionsDelayed() {
  hideTimeout = setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function getMapImageUrl(lat, lon) {
  // OpenStreetMap static map image (free, no API key)
  const zoom = 13
  const width = 400
  const height = 200
  return `${NOMINATIM_BASE}/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`
}

// Cleanup timeouts
onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (hideTimeout) clearTimeout(hideTimeout)
})

// ---- Validation functions ----

// Watch terms acceptance
watch(acceptedTerms, () => {
  if (acceptedTerms.value && stepperRef.value) {
    stepperRef.value.markStepValid(1)
  }
})

function togglePhoneForm() {
  showPhoneForm.value = !showPhoneForm.value
  if (!showPhoneForm.value) {
    phoneSuccess.value = false
    errors.phone = ''
  }
}

// ---- Form handlers ----

async function handleGoogleLogin() {
  if (!acceptedTerms.value) {
    toast.error(t('auth.errors.termsRequired'))
    return
  }
  try {
    await authStore.signInWithGoogle()
  } catch (err) {
    toast.error(t('auth.errors.processRequest'))
  }
}

async function handleWechatLogin() {
  if (!acceptedTerms.value) {
    toast.error(t('auth.errors.termsRequired'))
    return
  }
  try {
    await authStore.signInWithWechat()
  } catch (err) {
    toast.error(t('auth.errors.wechatLogin'))
  }
}

async function handlePhoneSubmit() {
  errors.phone = ''
  if (!acceptedTerms.value) {
    toast.error(t('auth.errors.termsRequired'))
    return
  }
  if (!phoneForm.phone.trim()) {
    errors.phone = t('auth.errors.phoneRequired')
    return
  }

  try {
    await authStore.signInWithPhone(phoneForm.phone)
    phoneSuccess.value = true
    toast.success(t('auth.toast.smsCodeSent'))
  } catch (err) {
    errors.phone = err.message || t('auth.errors.smsCode')
  }
}

function onStepChange(step) {
  showPhoneForm.value = false

  if (step === 1) {
    // Login step
    if (acceptedTerms.value && stepperRef.value) {
      stepperRef.value.markStepValid(1)
    }
  } else if (step === 2) {
    // Location step - always valid (can be skipped)
    if (stepperRef.value) {
      stepperRef.value.markStepValid(2)
    }
  } else if (step === 3) {
    // Welcome step
    if (stepperRef.value) stepperRef.value.markStepValid(3)
  }
}

function onAuthComplete() {
  goHome()
}

function goHome() {
  const redirect = route.query.redirect || '/'
  // Only allow relative paths starting with /
  const target = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'
  // Use replace to avoid adding extra history entry when redirecting from login
  router.replace(target)
}

onMounted(async () => {
  // Wait for next tick to ensure component is fully mounted before navigating
  await nextTick()

  // Check if this is an OAuth callback - if so, wait for auth to be processed
  const isOAuthCallback = window.location.hash && (
    window.location.hash.includes('access_token') || 
    window.location.hash.includes('error')
  )

  if (isOAuthCallback) {
    // Wait for auth store to process the OAuth callback
    if (!authStore.initialized) {
      await authStore.initialize()
    }
    
    // If authentication succeeded, redirect
    if (authStore.isLoggedIn) {
      goHome()
      return
    }
  }

  if (authStore.isLoggedIn) {
    goHome()
    return
  }

  // Restore saved location if any
  if (authStore.userLocation) {
    selectedLocation.value = authStore.userLocation
    locationQuery.value = authStore.userLocation.name
  }
})
</script>

<style scoped>
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--surface-1);
  position: relative;
  overflow: hidden;
}

.auth-page__letterglitch {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.15;
  pointer-events: none;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: clamp(1.5rem, 4vw, 2.25rem);
  box-shadow: var(--shadow-md);
  animation: scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* DarkVeil container - fills the card background */
.auth-card__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.1;
  pointer-events: none;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.auth-card__bg :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.auth-card__content {
  position: relative;
  z-index: 1;
}

.auth-card__header {
  text-align: center;
  margin-bottom: clamp(1rem, 3vh, 1.75rem);
}

.auth-card__logo {
  font-size: clamp(1.125rem, 2.5vw, 1.35rem);
  font-weight: 700;
  text-decoration: none;
}

.auth-card__logo-text { color: var(--text-primary); }
.auth-card__logo-accent {
  color: var(--accent);
  text-shadow: 0 0 clamp(0.5rem, 1.5vw, 0.75rem) var(--accent-light);
}

/* Step titles */
.auth-step__title {
  font-size: clamp(1.125rem, 2.5vw, 1.35rem);
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  text-align: center;
}

.auth-step__subtitle {
  font-size: clamp(0.8rem, 1.3vw, 0.9rem);
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.25rem;
}

/* Terms box */
.auth-terms-box {
  margin-bottom: 1.25rem;
  padding: 0.875rem 1rem;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.auth-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
}

.auth-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.auth-checkbox__checkmark {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  border: 0.125rem solid var(--border);
  border-radius: clamp(0.125rem, 0.5vw, 0.25rem);
  background: var(--surface-2);
  transition: all 0.2s ease;
  position: relative;
  margin-top: 0.125rem;
}

.auth-checkbox__input:checked + .auth-checkbox__checkmark {
  background: var(--accent);
  border-color: var(--accent);
}

.auth-checkbox__input:checked + .auth-checkbox__checkmark::after {
  content: '';
  position: absolute;
  left: 0.25rem;
  top: 0.05rem;
  width: 0.35rem;
  height: 0.65rem;
  border: solid var(--accent-foreground, #000);
  border-width: 0 0.125rem 0.125rem 0;
  transform: rotate(45deg);
}

.auth-checkbox__input:focus-visible + .auth-checkbox__checkmark {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.auth-checkbox__label {
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  color: var(--text-secondary);
  line-height: 1.5;
}

.auth-link {
  color: var(--accent);
  text-decoration: underline;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: var(--accent-hover);
}

/* Location search */
.location-search {
  position: relative;
  margin-bottom: 1rem;
}

.location-search__input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.location-search__icon {
  position: absolute;
  left: 0.75rem;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--text-muted);
  pointer-events: none;
}

.location-search__input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.location-search__input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.location-search__input::placeholder {
  color: var(--text-muted);
}

.location-search__clear {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.location-search__clear:hover {
  color: var(--text-primary);
}

.location-search__clear svg {
  width: 1rem;
  height: 1rem;
}

.location-search__loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.location-search__spinner {
  width: 1rem;
  height: 1rem;
  border: 0.125rem solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.location-search__suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: var(--surface-0);
  border: 0.0625rem solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 12rem;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
}

.location-search__suggestion {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.location-search__suggestion:first-child {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.location-search__suggestion:last-child {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.location-search__suggestion:hover,
.location-search__suggestion--active {
  background: var(--surface-1);
}

.location-search__suggestion-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: var(--accent);
  margin-top: 0.125rem;
}

.location-search__suggestion-text {
  flex: 1;
  font-size: 0.825rem;
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-word;
}

/* Selected location */
.location-selected {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--accent-light);
  border: 0.0625rem solid var(--accent);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.location-selected__icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent);
  margin-top: 0.125rem;
}

.location-selected__info {
  flex: 1;
  min-width: 0;
}

.location-selected__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.location-selected__detail {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-selected__city-state {
  font-size: 0.75rem;
  color: var(--text-primary);
  font-weight: 500;
}

.location-selected__country {
  font-size: 0.7rem;
  color: var(--accent);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.location-selected__address {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-selected__change {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

.location-selected__change:hover {
  color: var(--accent-hover);
}

/* Map preview */
.location-map-preview {
  position: relative;
  width: 100%;
  height: 10rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 1rem;
  border: 0.0625rem solid var(--border);
}

.location-map-preview__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.location-map-preview__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  color: var(--accent);
}

/* Welcome step */
.auth-stepper__welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.auth-stepper__success-icon {
  width: 4rem;
  height: 4rem;
  color: var(--accent);
  animation: pulse-success 0.6s ease-out;
}

@keyframes pulse-success {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.auth-stepper__title {
  font-size: clamp(1.125rem, 2.5vw, 1.35rem);
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  text-align: center;
}

.auth-stepper__text {
  font-size: clamp(0.85rem, 1.4vw, 0.95rem);
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 0.5rem;
}

.auth-stepper__location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: clamp(0.8rem, 1.3vw, 0.9rem);
  color: var(--accent);
  margin-bottom: 1.5rem;
}

.auth-stepper__location svg {
  flex-shrink: 0;
}

/* Forms */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.auth-form__error {
  padding: 0.625rem 0.875rem;
  background: var(--danger-light);
  color: var(--danger);
  border-radius: var(--radius-md);
  font-size: 0.825rem;
}

.auth-form__success {
  padding: 0.625rem 0.875rem;
  background: var(--success-light);
  color: var(--success);
  border-radius: var(--radius-md);
  font-size: 0.825rem;
}

.auth-phone-form {
  margin-top: 1rem;
}

/* Divider */
.auth-card__divider {
  text-align: center;
  margin: 1rem 0;
  position: relative;
}

.auth-card__divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 0.0625rem;
  background: var(--border);
}

.auth-card__divider span {
  position: relative;
  padding: 0 0.75rem;
  background: var(--surface-0);
  font-size: 0.775rem;
  color: var(--text-muted);
}

/* Social buttons */
.auth-social-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.auth-social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Geo detect button */
.auth-geo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

/* Switch links */
.auth-switch-link {
  text-align: center;
  margin-top: 0.875rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.auth-link-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  transition: color 0.2s ease;
}

.auth-link-btn:hover {
  color: var(--accent-hover);
}

/* Stepper overrides */
:deep(.stepper) {
  background: transparent;
  box-shadow: none;
  border: none;
  padding: 0;
  max-width: 100%;
}

:deep(.stepper__dot--inactive) {
  background: var(--surface-2) !important;
}

:deep(.stepper__dot--active),
:deep(.stepper__dot--complete) {
  background: var(--accent) !important;
  color: var(--accent-foreground, #000) !important;
}

:deep(.stepper__connector) {
  background: var(--border) !important;
}

:deep(.stepper__connector-fill) {
  background: var(--accent) !important;
}

:deep(.stepper__btn-next) {
  background: var(--accent) !important;
  color: var(--accent-foreground, #000) !important;
}

:deep(.stepper__btn-next:hover:not(:disabled)) {
  background: var(--accent-hover) !important;
}

:deep(.stepper__btn-back) {
  color: var(--text-secondary) !important;
  border-color: var(--border) !important;
}

:deep(.stepper__btn-back:hover:not(:disabled)) {
  color: var(--text-primary) !important;
}

/* Suggestions transition */
.suggestions-fade-enter-active,
.suggestions-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.suggestions-fade-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.suggestions-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
