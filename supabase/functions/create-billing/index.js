import { serve } from 'https://deno.land/std@0.168.0/http/function.ts'

const ABACATEPAY_API = 'https://api.abacatepay.com'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

async function callAbacatePay(endpoint, method, body) {
  const apiKey = Deno.env.get('ABACATEPAY_API_KEY')
  if (!apiKey) throw new Error('ABACATEPAY_API_KEY not configured')

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${ABACATEPAY_API}${endpoint}`, options)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `AbacatePay API error: ${response.status}`)
  }

  return response.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const { action, data } = await req.json()

    let result

    switch (action) {
      case 'create_customer': {
        const customerData = {
          name: data.name,
          cellphone: data.cellphone,
          email: data.email,
        }
        if (data.taxId) {
          customerData.taxId = data.taxId
        }
        result = await callAbacatePay('/v1/customer/create', 'POST', customerData)
        break
      }

      case 'create_pix': {
        const pixData = {
          amount: data.amount,
          expiresIn: data.expiresIn || 3600,
          description: data.description || 'Pagamento BhumiShop',
        }

        if (data.customerId) {
          pixData.customerId = data.customerId
        } else if (data.customer) {
          pixData.customer = data.customer
        }

        result = await callAbacatePay('/v1/pixQrCode/create', 'POST', pixData)

        // Normalize response
        if (result.data) {
          result = {
            id: result.data.id,
            pixCode: result.data.payload || result.data.pixCode || result.data.qrCodePayload,
            qrCode: result.data.qrCodeBase64 || result.data.brCodeBase64 || null,
            status: result.data.status || 'pending',
          }
        }
        break
      }

      case 'create_billing': {
        const billingData = {
          frequency: data.frequency || 'ONE_TIME',
          methods: data.methods || ['CREDIT_CARD', 'PIX'],
          products: data.products,
          returnUrl: data.returnUrl,
          completionUrl: data.completionUrl,
        }

        if (data.customerId) {
          billingData.customerId = data.customerId
        } else if (data.customer) {
          billingData.customer = data.customer
        }

        result = await callAbacatePay('/v1/billing/create', 'POST', billingData)

        // Normalize response
        if (result.data) {
          result = {
            id: result.data.id,
            url: result.data.url || result.data.checkoutUrl || null,
            status: result.data.status || 'pending',
          }
        }
        break
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('create-billing error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    )
  }
})
