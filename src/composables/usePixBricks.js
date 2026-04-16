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
  let isRendered = false

  async function loadSDK(publicKey) {
    const key = publicKey || import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
    if (!key) {
      throw new Error('MercadoPago public key not configured. Set VITE_MERCADOPAGO_PUBLIC_KEY in .env')
    }

    if (window.MercadoPago) {
      mpInstance = new window.MercadoPago(key, { locale: 'pt-BR' })
      bricksBuilder = mpInstance.bricks()
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = MP_SDK_URL
      script.onload = () => {
        mpInstance = new window.MercadoPago(key, { locale: 'pt-BR' })
        bricksBuilder = mpInstance.bricks()
        resolve()
      }
      script.onerror = () => reject(new Error('Failed to load MercadoPago SDK. Check your internet connection.'))
      document.head.appendChild(script)
    })
  }

  async function renderPaymentBrick(containerId, { amount, onSubmit, onError, onReady }) {
    if (!bricksBuilder) throw new Error('SDK not loaded. Call loadSDK() first.')
    if (isRendered) throw new Error('Payment brick already rendered')

    const settings = {
      initialization: { amount: String(amount) },
      customization: {
        paymentMethods: {
          pix: { show: true, maxInstallments: 1 },
          ticket: { show: false },
          bankTransfer: { show: false },
          creditCard: { show: true, maxInstallments: 12 },
          debitCard: { show: true },
          prepaidCard: { show: false }
        },
        visual: { style: { theme: 'default' } }
      },
      callbacks: {
        onReady: () => {
          isRendered = true
          if (onReady) onReady()
        },
        onSubmit: async (formData) => {
          if (onSubmit) await onSubmit(formData)
        },
        onError: (error) => {
          console.error('Payment brick error:', error)
          if (onError) onError(error)
        }
      }
    }

    await bricksBuilder.create('payment', containerId, settings)
  }

  async function renderPixBrick(containerId, { amount, email, onSubmit, onError, onReady }) {
    if (!bricksBuilder) throw new Error('SDK not loaded. Call loadSDK() first.')
    if (isRendered) throw new Error('PIX brick already rendered')

    const settings = {
      initialization: {
        amount: String(amount),
        payer: {
          email: email || ''
        }
      },
      customization: {
        texts: { valueProp: 'payment_complete' },
        paymentMethods: {
          pix: { show: true },
          ticket: { show: false },
          bankTransfer: { show: false },
          creditCard: { show: false },
          debitCard: { show: false },
          prepaidCard: { show: false }
        }
      },
      callbacks: {
        onReady: () => {
          isRendered = true
          if (onReady) onReady()
        },
        onSubmit: async (formData) => {
          if (onSubmit) await onSubmit(formData)
        },
        onError: (error) => {
          console.error('PIX brick error:', error)
          if (onError) onError(error)
        }
      }
    }

    await bricksBuilder.create('pix', containerId, settings)
  }

  async function unmount() {
    if (mpInstance && bricksBuilder) {
      try {
        await bricksBuilder.unmount()
      } catch (err) {
        console.warn('Error unmounting bricks:', err)
      }
    }
    destroy()
  }

  function destroy() {
    mpInstance = null
    bricksBuilder = null
    isRendered = false
  }

  return { loadSDK, renderPaymentBrick, renderPixBrick, unmount, destroy, isRendered: () => isRendered }
}
