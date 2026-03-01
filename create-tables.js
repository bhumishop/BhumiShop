import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nuypyyxnacvglpqwqihx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXB5eXhuYWN2Z2xwcXdxaWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzI3MjgsImV4cCI6MjA4NzkwMzI3OH0.Kbs44uGzc0ti9JKZ5SOJRj_-9YTZG8V-rSwcHzGLtSs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTables() {
  console.log('Criando tabelas...')
  
  // Criar tabela orders
  const { error: ordersError } = await supabase.rpc('create_orders_table', {})
  if (ordersError) {
    console.log('Criando orders manualmente...')
  }

  // Criar tabela orders manualmente via SQL
  const sql = `
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      order_number VARCHAR(20) UNIQUE NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      total DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      payment_status VARCHAR(50) DEFAULT 'pending',
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      shipping_address TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  console.log('SQL gerado. Execute no painel do Supabase:')
  console.log(sql)
}

createTables()
