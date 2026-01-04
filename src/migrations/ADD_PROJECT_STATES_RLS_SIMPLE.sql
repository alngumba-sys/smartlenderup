-- =====================================================
-- SIMPLE RLS POLICIES FOR PROJECT_STATES TABLE
-- =====================================================
-- If the main RLS policy file doesn't work due to users table issues,
-- use this simpler version that allows all authenticated users

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON project_states;

-- =====================================================
-- SIMPLE POLICY: All Authenticated Users
-- =====================================================
-- This allows any authenticated user to do everything
-- (Use this as a temporary fix if the organization-based policy fails)

CREATE POLICY "Enable all access for authenticated users"
ON project_states
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE project_states ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Simple RLS Policy created for project_states table';
  RAISE NOTICE '⚠️ WARNING: This allows ALL authenticated users access';
  RAISE NOTICE '⚠️ For production, use organization-scoped policies instead';
END $$;
