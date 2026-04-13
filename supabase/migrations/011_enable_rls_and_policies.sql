-- Migration: 011_enable_rls_and_policies
-- Description: Enables Row Level Security on all tables and creates access policies

-- ============================================
-- Enable RLS on all tables
-- ============================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcollections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cep_state_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE third_party_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE third_party_product_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper function to check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in user metadata or is in admins table
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'is_admin')::BOOLEAN = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Collections: Public read, admin write
-- ============================================
CREATE POLICY "Collections are viewable by everyone"
  ON collections FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage collections"
  ON collections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Subcollections: Public read, admin write
-- ============================================
CREATE POLICY "Subcollections are viewable by everyone"
  ON subcollections FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage subcollections"
  ON subcollections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Products: Public read active, admin full access
-- ============================================
CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT
  USING (
    is_active = true AND is_archived = false
    OR is_admin()
  );

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Product variants: Public read active, admin full access
-- ============================================
CREATE POLICY "Active variants are viewable by everyone"
  ON product_variants FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage variants"
  ON product_variants FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Product option values: Public read, admin write
-- ============================================
CREATE POLICY "Option values are viewable by everyone"
  ON product_option_values FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage option values"
  ON product_option_values FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Categories: Public read, admin write
-- ============================================
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Orders: Users see own orders, admins see all
-- ============================================
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL -- guest checkout
  );

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (
    user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Order items: Access through orders
-- ============================================
CREATE POLICY "Users can view order items from their orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid()
        OR orders.guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR is_admin()
      )
    )
  );

CREATE POLICY "Order items can be inserted with order creation"
  ON order_items FOR INSERT
  WITH CHECK (true); -- Inserted via order creation flow

CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Order status history: Read through orders
-- ============================================
CREATE POLICY "Users can view status history of their orders"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (
        orders.user_id = auth.uid()
        OR is_admin()
      )
    )
  );

CREATE POLICY "System and admins can insert status history"
  ON order_status_history FOR INSERT
  WITH CHECK (true); -- Inserted via triggers or admin actions

-- ============================================
-- Shipment tracking: Read through orders
-- ============================================
CREATE POLICY "Users can view tracking for their orders"
  ON shipment_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = shipment_tracking.order_id
      AND (
        orders.user_id = auth.uid()
        OR is_admin()
      )
    )
  );

CREATE POLICY "Admins can manage shipment tracking"
  ON shipment_tracking FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Delivery types: Public read
-- ============================================
CREATE POLICY "Delivery types are viewable by everyone"
  ON delivery_types FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage delivery types"
  ON delivery_types FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Shipping zones: Public read
-- ============================================
CREATE POLICY "Shipping zones are viewable by everyone"
  ON shipping_zones FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage shipping zones"
  ON shipping_zones FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- CEP state mapping: Public read
-- ============================================
CREATE POLICY "CEP mapping is viewable by everyone"
  ON cep_state_mapping FOR SELECT
  USING (true);

-- ============================================
-- Inventory movements: Admin only
-- ============================================
CREATE POLICY "Admins can view inventory movements"
  ON inventory_movements FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage inventory movements"
  ON inventory_movements FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Daily metrics: Admin only
-- ============================================
CREATE POLICY "Admins can view daily metrics"
  ON daily_metrics FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage daily metrics"
  ON daily_metrics FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Product analytics: Public insert (anonymous), admin read
-- ============================================
CREATE POLICY "Anyone can log product analytics"
  ON product_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON product_analytics FOR SELECT
  USING (is_admin());

-- ============================================
-- Fulfillment metrics: Admin only
-- ============================================
CREATE POLICY "Admins can view fulfillment metrics"
  ON fulfillment_metrics FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage fulfillment metrics"
  ON fulfillment_metrics FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Third-party sync log: Admin only
-- ============================================
CREATE POLICY "Admins can view sync logs"
  ON third_party_sync_log FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert sync logs"
  ON third_party_sync_log FOR INSERT
  WITH CHECK (true); -- Inserted by GitHub Actions

CREATE POLICY "Admins can update sync logs"
  ON third_party_sync_log FOR UPDATE
  USING (is_admin());

-- ============================================
-- Third-party product mapping: Public read, admin write
-- ============================================
CREATE POLICY "Product mappings are viewable by everyone"
  ON third_party_product_mapping FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product mappings"
  ON third_party_product_mapping FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Webhook endpoints: Admin only
-- ============================================
CREATE POLICY "Admins can view webhook endpoints"
  ON webhook_endpoints FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage webhook endpoints"
  ON webhook_endpoints FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- Webhook events: System insert, admin read
-- ============================================
CREATE POLICY "System can insert webhook events"
  ON webhook_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view webhook events"
  ON webhook_events FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update webhook events"
  ON webhook_events FOR UPDATE
  USING (is_admin());
