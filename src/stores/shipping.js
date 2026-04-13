// Shipping calculator based on fulfillment type and zones
// - uma_penca items: shipping calculated by Uma Penca (redirect to their checkout)
// - own items: calculated based on weight, dimensions, CEP destination
// - digital items: no shipping

import { t } from '../utils/storeI18n'

const SHIPPING_ZONES = {
  'southeast': { states: ['SP', 'RJ', 'MG', 'ES'], base: 12.90, perKg: 3.50, days: '3-5' },
  'south': { states: ['PR', 'SC', 'RS'], base: 15.90, perKg: 4.50, days: '4-6' },
  'northeast': { states: ['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA'], base: 22.90, perKg: 6.90, days: '6-10' },
  'north': { states: ['PA', 'AM', 'RR', 'AP', 'TO', 'RO', 'AC'], base: 28.90, perKg: 8.90, days: '8-14' },
  'midwest': { states: ['GO', 'MT', 'MS', 'DF'], base: 18.90, perKg: 5.50, days: '5-8' }
}

const FREE_SHIPPING_ABOVE = 200

// CEP ranges mapped to Brazilian states
// Format: [start, end, state]
const CEP_RANGES = [
  [1000000, 1999999, 'SP'],
  [2000000, 2899999, 'RJ'],
  [2900000, 3999999, 'MG'],
  [4000000, 4999999, 'BA'],
  [5000000, 5699999, 'PE'],
  [5700000, 5799999, 'SE'],
  [5800000, 5999999, 'PB'],
  [6000000, 6399999, 'CE'],
  [6400000, 6499999, 'PI'],
  [6500000, 6599999, 'MA'],
  [6600000, 6999999, 'PA'],
  [6900000, 6929999, 'AM'],
  [6930000, 6949999, 'RR'],
  [6940000, 6959999, 'AP'],
  [6960000, 6989999, 'AM'],
  [7680000, 7699999, 'RO'],
  [7700000, 7799999, 'TO'],
  [7800000, 7889999, 'MT'],
  [7890000, 7899999, 'MS'],
  [7900000, 7999999, 'MS'],
  [8000000, 8799999, 'PR'],
  [8800000, 8999999, 'SC'],
  [9000000, 9999999, 'RS'],
  [3000000, 3999999, 'MG'],
  [7000000, 7099999, 'DF'],
  [7100000, 7279999, 'DF'],
  [7280000, 7369999, 'GO'],
  [7370000, 7679999, 'GO'],
]

export function getStateFromCEP(cep) {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null
  const num = parseInt(digits, 10)
  for (const [start, end, state] of CEP_RANGES) {
    if (num >= start && num <= end) return state
  }
  return null
}

export function getZoneFromState(state) {
  if (!state) return null
  for (const [zone, config] of Object.entries(SHIPPING_ZONES)) {
    if (config.states.includes(state)) return zone
  }
  return null
}

export function calculateShipping(items, destinationCEP) {
  const state = getStateFromCEP(destinationCEP)
  const zone = getZoneFromState(state)

  if (!zone) {
    return {
      own: { cost: null, days: null, error: t('stores.shipping.invalidCEP') },
      uma_penca: { cost: null, days: null, note: t('stores.shipping.calculatedByUmaPenca') },
      digital: { cost: 0, days: null, note: t('stores.shipping.immediateDigitalDelivery') }
    }
  }

  const zoneConfig = SHIPPING_ZONES[zone]

  // Calculate own items shipping
  const ownItems = items.filter(item => !item.fulfillment_type || item.fulfillment_type === 'own')
  let ownCost = null
  let ownDays = null

  if (ownItems.length > 0) {
    const totalWeight = ownItems.reduce((sum, item) => sum + ((item.weight || 0.3) * item.quantity), 0)
    const ownSubtotal = ownItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    ownCost = zoneConfig.base + (Math.ceil(totalWeight) * zoneConfig.perKg)
    ownDays = zoneConfig.days

    // Apply free shipping threshold
    if (ownSubtotal >= FREE_SHIPPING_ABOVE) {
      ownCost = 0
    }
  }

  // Calculate uma_penca items shipping
  const umaPencaItems = items.filter(item => item.fulfillment_type === 'uma_penca')
  let umaPencaCost = null
  let umaPencaDays = null

  if (umaPencaItems.length > 0) {
    // Uma Penca calculates their own shipping — estimate based on zone
    const totalWeight = umaPencaItems.reduce((sum, item) => sum + ((item.weight || 0.2) * item.quantity), 0)
    umaPencaCost = zoneConfig.base + (Math.ceil(totalWeight) * zoneConfig.perKg)
    umaPencaDays = zoneConfig.days
  }

  // Digital items
  const digitalItems = items.filter(item => item.fulfillment_type === 'digital')
  let digitalCost = 0

  return {
    own: { cost: ownCost, days: ownDays },
    uma_penca: { cost: umaPencaCost, days: umaPencaDays, note: t('stores.shipping.calculatedByUmaPenca') },
    digital: { cost: digitalCost, days: null, note: t('stores.shipping.immediateDigitalDelivery') }
  }
}

export function getFreeShippingProgress(subtotal) {
  const progress = Math.min((subtotal / FREE_SHIPPING_ABOVE) * 100, 100)
  const remaining = Math.max(FREE_SHIPPING_ABOVE - subtotal, 0)
  return { progress, remaining, isFree: subtotal >= FREE_SHIPPING_ABOVE }
}

// ViaCEP API lookup for Brazilian addresses
export async function lookupCEP(cep) {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!response.ok) return null
    const data = await response.json()
    if (data.erro) return null // CEP not found
    return data
  } catch (err) {
    console.error('ViaCEP lookup failed:', err)
    return null
  }
}

export { SHIPPING_ZONES, FREE_SHIPPING_ABOVE }
