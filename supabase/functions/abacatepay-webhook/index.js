import { serve } from 'https://deno.land/std@0.168.0/http/function.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload = await req.json()
    const event = payload.event || payload.type

    console.log('Webhook received:', event, JSON.stringify(payload))

    if (event === 'billing.paid' || event === 'pix.paid') {
      // Extract payment reference
      const billingId = payload.data?.id || payload.data?.billing_id || payload.billing_id
      const pixId = payload.data?.id || payload.data?.pix_qr_code_id || payload.pix_qr_code_id
      const paymentRef = billingId || pixId

      if (!paymentRef) {
        console.error('No payment reference found in webhook payload')
        return new Response(
          JSON.stringify({ error: 'No payment reference' }),
          { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        )
      }

      // Find order by payment reference (stored in pix_key column)
      const { data: orders, error: findError } = await supabase
        .from('orders')
        .select('id, order_number, payment_status')
        .eq('pix_key', paymentRef)
        .limit(1)

      if (findError) {
        console.error('Error finding order:', findError)
        throw findError
      }

      if (!orders || orders.length === 0) {
        console.log('No order found for payment ref:', paymentRef)
        return new Response(
          JSON.stringify({ message: 'No matching order' }),
          { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        )
      }

      const order = orders[0]

      if (order.payment_status === 'paid') {
        console.log('Order already marked as paid:', order.order_number)
        return new Response(
          JSON.stringify({ message: 'Already processed' }),
          { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        )
      }

      // Update order payment status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)

      if (updateError) {
        console.error('Error updating order:', updateError)
        throw updateError
      }

      // Add status history entry
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: order.id,
          status: 'processing',
          description: 'Pagamento confirmado via AbacatePay'
        })

      if (historyError) {
        console.error('Error inserting status history:', historyError)
        // Don't throw — order is already updated
      }

      console.log('Order updated to paid:', order.order_number)
    }

    if (event === 'pix.expired') {
      const pixId = payload.data?.id || payload.data?.pix_qr_code_id

      if (pixId) {
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('pix_key', pixId)
          .eq('payment_status', 'pending')
          .limit(1)

        if (orders && orders.length > 0) {
          await supabase
            .from('orders')
            .update({ payment_status: 'expired', updated_at: new Date().toISOString() })
            .eq('id', orders[0].id)
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    )
  }
})
