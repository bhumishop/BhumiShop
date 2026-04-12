import { serve } from 'https://deno.land/std@0.168.0/http/function.ts'

const ABACATEPAY_API = 'https://api.abacatepay.com'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const { pixId } = await req.json()

    if (!pixId) {
      return new Response(
        JSON.stringify({ error: 'pixId is required' }),
        { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('ABACATEPAY_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(
      `${ABACATEPAY_API}/v1/pixQrCode/check?id=${encodeURIComponent(pixId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `AbacatePay API error: ${response.status}`)
    }

    const data = await response.json()

    const status = data.data?.status || data.status || 'pending'

    return new Response(
      JSON.stringify({ status }),
      { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('check-pix-status error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    )
  }
})
