-- ============================================
-- FIX INFINITE RECURSION IN USERS TABLE RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view organization users" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can modify users" ON public.users;

-- Step 2: Create simple, non-recursive policies

-- Allow all authenticated users to SELECT users (no recursion)
CREATE POLICY "authenticated_users_select" ON public.users
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow all authenticated users to INSERT users
CREATE POLICY "authenticated_users_insert" ON public.users
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to UPDATE users
CREATE POLICY "authenticated_users_update" ON public.users
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all authenticated users to DELETE users
CREATE POLICY "authenticated_users_delete" ON public.users
  FOR DELETE 
  TO authenticated
  USING (true);

-- Step 3: Verify policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
