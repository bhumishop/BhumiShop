-- Tabelas para sistema de pedidos profissionais

-- 1. Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  pix_key VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  size VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de histórico de status
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 4. Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Policies para usuários verem apenas seus próprios pedidos
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own status history" ON order_status_history
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

-- Policy para inserir pedidos (usuário logado ou guest com email)
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid() OR user_id IS NULL)
  );

-- Função para gerar número do pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  order_num VARCHAR(20);
  year_num VARCHAR(4);
  seq_num INTEGER;
BEGIN
  year_num := EXTRACT(YEAR FROM NOW())::VARCHAR;
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM orders
  WHERE SUBSTRING(order_number FROM 1 FOR 4) = 'BH' || year_num;
  
  order_num := 'BH' || year_num || LPAD(seq_num::VARCHAR, 6, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar status do pedido
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_status VARCHAR,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE orders SET status = p_status, updated_at = NOW()
  WHERE id = p_order_id;
  
  INSERT INTO order_status_history (order_id, status, description)
  VALUES (p_order_id, p_status, p_description);
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar status inicial
CREATE OR REPLACE FUNCTION set_initial_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO order_status_history (order_id, status, description)
    VALUES (NEW.id, 'pending', 'Pedido recebido, aguardando pagamento');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_initial_status
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_status();
