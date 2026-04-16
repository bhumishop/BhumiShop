-- =====================================================
-- BhumiShop - Fix Row Level Security Policies
-- =====================================================
-- This script creates RLS policies that allow:
-- 1. Anonymous (public) READ access to products, categories, and collections
-- 2. Full access for authenticated admin users
-- =====================================================
-- Run this in your Supabase Dashboard: https://app.supabase.com
-- Go to: SQL Editor > New Query > Paste this entire file > Run
-- =====================================================

-- Enable RLS on tables (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCTS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow admin full access to products" ON products;

-- Policy 1: Allow anyone to READ active, non-archived products
CREATE POLICY "Allow public read access to products"
ON products
FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND is_archived = false
);

-- Policy 2: Allow authenticated users (admins) full access
CREATE POLICY "Allow admin full access to products"
ON products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- CATEGORIES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow admin full access to categories" ON categories;

-- Policy 1: Allow anyone to READ active categories
CREATE POLICY "Allow public read access to categories"
ON categories
FOR SELECT
TO anon, authenticated
USING (is_active = true OR is_active IS NULL);

-- Policy 2: Allow authenticated users (admins) full access
CREATE POLICY "Allow admin full access to categories"
ON categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- COLLECTIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to collections" ON collections;
DROP POLICY IF EXISTS "Allow admin full access to collections" ON collections;

-- Policy 1: Allow anyone to READ active collections
CREATE POLICY "Allow public read access to collections"
ON collections
FOR SELECT
TO anon, authenticated
USING (is_active = true OR is_active IS NULL);

-- Policy 2: Allow authenticated users (admins) full access
CREATE POLICY "Allow admin full access to collections"
ON collections
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that policies were created successfully
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'categories', 'collections')
ORDER BY tablename, policyname;

-- =====================================================
-- TEST QUERIES (run these to verify policies work)
-- =====================================================

-- Test 1: Count products (as anonymous user)
-- SELECT COUNT(*) as product_count FROM products WHERE is_active = true AND is_archived = false;

-- Test 2: Count categories (as anonymous user)
-- SELECT COUNT(*) as category_count FROM categories WHERE is_active = true OR is_active IS NULL;

-- Test 3: Count collections (as anonymous user)
-- SELECT COUNT(*) as collection_count FROM collections WHERE is_active = true OR is_active IS NULL;
