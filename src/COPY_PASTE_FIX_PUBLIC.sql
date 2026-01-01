-- ============================================
-- FIX RLS FOR PUBLIC ACCESS (NO AUTH REQUIRED)
-- ============================================
-- This allows the app to save to Supabase without user authentication
-- Perfect for development and single-tenant applications

-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users full access" ON project_states;
DROP POLICY IF EXISTS "Users can delete their own organization's state" ON project_states;
DROP POLICY IF EXISTS "Users can insert their own organization's state" ON project_states;
DROP POLICY IF EXISTS "Users can update their own organization's state" ON project_states;
DROP POLICY IF EXISTS "Users can view their own organization's state" ON project_states;

-- Enable RLS on the table
ALTER TABLE project_states ENABLE ROW LEVEL SECURITY;

-- Create PUBLIC policies that allow ALL operations without authentication
CREATE POLICY "Public can view all states"
ON project_states
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can insert all states"
ON project_states
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can update all states"
ON project_states
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete all states"
ON project_states
FOR DELETE
TO public
USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, your app should be able to:
-- ✅ Read from project_states
-- ✅ Write to project_states
-- ✅ Update existing records
-- ✅ Delete records
-- All without requiring user authentication!
