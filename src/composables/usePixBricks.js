// Mercado Pago SDK integration for PIX Bricks
// Loads sdk.mercadopago.com JS SDK
// Creates payment brick widget
// Supports: PIX (Brazil), UPI (India), Alipay (China), WeChat Pay (China)

import { i18n } from '../i18n'
const t = (key) => i18n.global.t(key)

const MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2'

export function usePixBricks() {
  let mpInstance = null
  let bricksBuilder = null

  async function loadSDK(publicKey) {
    const key = publicKey || import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
    if (!key) {
      throw new Error(t('stores.products.loadError'))
    }

    if (window.MercadoPago) {
      mpInstance = new window.MercadoPago(key)
      bricksBuilder = mpInstance.bricks()
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = MP_SDK_URL
      script.onload = () => {
        mpInstance = new window.MercadoPago(key)
        bricksBuilder = mpInstance.bricks()
        resolve()
      }
      script.onerror = () => reject(new Error(t('stores.products.loadError')))
      document.head.appendChild(script)
    })
  }

  async function renderPaymentBrick(containerId, { amount, onSubmit }) {
    if (!bricksBuilder) throw new Error('SDK not loaded. Call loadSDK() first.')

    const settings = {
      initialization: { amount: String(amount) },
      customization: {
        paymentMethods: {
          pix: { show: true },
          ticket: { show: false },
          bankTransfer: { show: false },
          creditCard: { show: true },
          debitCard: { show: true },
          prepaidCard: { show: false }
        },
        visual: { style: { theme: 'default' } }
      },
      callbacks: {
        onSubmit: async (formData) => {
          if (onSubmit) await onSubmit(formData)
        },
        onError: (error) => {
          console.error('Payment brick error:', error)
        }
      }
    }

    await bricksBuilder.create('payment', containerId, settings)
  }

  async function renderPixBrick(containerId, { amount, email }) {
    if (!bricksBuilder) throw new Error('SDK not loaded. Call loadSDK() first.')

    const settings = {
      initialization: {
        amount: String(amount),
        payer: {
          email: email || ''
        }
      },
      customization: {
        texts: { valueProp: 'payment_complete' }
      },
      callbacks: {
        onSubmit: () => {},
        onError: () => {}
      }
    }

    await bricksBuilder.create('pix', containerId, settings)
  }

  function destroy() {
    mpInstance = null
    bricksBuilder = null
  }

  return { loadSDK, renderPaymentBrick, renderPixBrick, destroy }
}
