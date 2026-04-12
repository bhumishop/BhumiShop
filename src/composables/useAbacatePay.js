import { supabase } from '../supabase'

const FUNCTION_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

function getAuthHeaders() {
  const session = supabase.auth.getSession()
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {}
}

async function callEdgeFunction(name, body) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders()
  }

  const response = await fetch(`${FUNCTION_BASE}/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Edge function ${name} failed: ${response.status}`)
  }

  return response.json()
}

export function useAbacatePay() {
  async function createCustomer({ name, email, cellphone, taxId }) {
    const result = await callEdgeFunction('create-billing', {
      action: 'create_customer',
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        cellphone: cellphone.trim(),
        taxId: taxId?.trim() || undefined
      }
    })
    return result.customer || result
  }

  async function createPixPayment({ amount, description, customer }) {
    const result = await callEdgeFunction('create-billing', {
      action: 'create_pix',
      data: {
        amount,
        expiresIn: 3600,
        description,
        customerId: customer.id || undefined,
        customer: customer.id ? undefined : {
          name: customer.name,
          cellphone: customer.cellphone,
          email: customer.email,
          taxId: customer.taxId
        }
      }
    })
    return result
  }

  async function createBilling({ products, customer, returnUrl, completionUrl }) {
    const result = await callEdgeFunction('create-billing', {
      action: 'create_billing',
      data: {
        frequency: 'ONE_TIME',
        methods: ['CREDIT_CARD', 'PIX'],
        products: products.map(p => ({
          name: p.name?.trim(),
          price: p.price,
          quantity: p.quantity,
          description: p.description?.trim() || undefined
        })),
        customerId: customer.id || undefined,
        customer: customer.id ? undefined : {
          name: customer.name,
          cellphone: customer.cellphone,
          email: customer.email,
          taxId: customer.taxId
        },
        returnUrl,
        completionUrl
      }
    })
    return result
  }

  async function checkPixStatus(pixId) {
    const result = await callEdgeFunction('check-pix-status', {
      pixId
    })
    return result.status
  }

  return {
    createCustomer,
    createPixPayment,
    createBilling,
    checkPixStatus
  }
}
