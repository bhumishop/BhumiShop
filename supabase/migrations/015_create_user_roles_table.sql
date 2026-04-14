-- Migration: 015_create_user_roles_table
-- Description: Creates user_roles table for secure server-side admin role checking

CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Only admins can manage roles
CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Index for fast lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
