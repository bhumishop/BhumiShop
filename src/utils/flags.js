// Country flag SVG paths (simplified flag icons)
// Using emoji flags as fallback, but with proper country code mappings
export const countryFlags = {
  'en': { emoji: '🇺🇸', country: 'US', name: 'English' },
  'pt-BR': { emoji: '🇧🇷', country: 'BR', name: 'Português (BR)' },
  'zh': { emoji: '🇨🇳', country: 'CN', name: '中文' },
  'ja': { emoji: '🇯🇵', country: 'JP', name: '日本語' },
  'es': { emoji: '🇪🇸', country: 'ES', name: 'Español' },
  'th': { emoji: '🇹🇭', country: 'TH', name: 'ไทย' },
  'ne': { emoji: '🇳🇵', country: 'NP', name: 'नेपाली' },
  'hi': { emoji: '🇮🇳', country: 'IN', name: 'हिन्दी' }
}

// Get flag image from flagcdn.com CDN
export function getFlagUrl(countryCode, size = 'w40') {
  return `https://flagcdn.com/${size}/${countryCode.toLowerCase()}.png`
}

// Get 2x flag for retina displays
export function getFlagUrl2x(countryCode, size = 'w80') {
  return `https://flagcdn.com/${size}/${countryCode.toLowerCase()}.png`
}
