-- =====================================================
-- ALL-IN-ONE RLS FIX FOR PROJECT_STATES
-- =====================================================
-- This script fixes the RLS policy error by:
-- 1. Ensuring the project_states table exists
-- 2. Adding organization-scoped RLS policies
-- 3. Granting necessary permissions
--
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- Step 1: Ensure table exists (should already exist from previous migration)
CREATE TABLE IF NOT EXISTS project_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  project_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_project_states_org_id ON project_states(organization_id);

-- Step 3: Drop any existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Users can insert their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Users can update their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Users can delete their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON project_states;

-- Step 4: Grant permissions to authenticated users
GRANT ALL ON project_states TO authenticated;
GRANT ALL ON project_states TO postgres;

-- Step 5: Enable RLS
ALTER TABLE project_states ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies
-- Try organization-based policy first
DO $$
BEGIN
  -- Check if users table has organization_id column
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'organization_id'
  ) THEN
    -- Create organization-scoped policies
    EXECUTE '
      CREATE POLICY "Users can view their own organization''s project state"
      ON project_states
      FOR SELECT
      TO authenticated
      USING (
        organization_id IN (
          SELECT organization_id 
          FROM users 
          WHERE id = auth.uid()
        )
      );
    ';
    
    EXECUTE '
      CREATE POLICY "Users can insert their own organization''s project state"
      ON project_states
      FOR INSERT
      TO authenticated
      WITH CHECK (
        organization_id IN (
          SELECT organization_id 
          FROM users 
          WHERE id = auth.uid()
        )
      );
    ';
    
    EXECUTE '
      CREATE POLICY "Users can update their own organization''s project state"
      ON project_states
      FOR UPDATE
      TO authenticated
      USING (
        organization_id IN (
          SELECT organization_id 
          FROM users 
          WHERE id = auth.uid()
        )
      )
      WITH CHECK (
        organization_id IN (
          SELECT organization_id 
          FROM users 
          WHERE id = auth.uid()
        )
      );
    ';
    
    EXECUTE '
      CREATE POLICY "Users can delete their own organization''s project state"
      ON project_states
      FOR DELETE
      TO authenticated
      USING (
        organization_id IN (
          SELECT organization_id 
          FROM users 
          WHERE id = auth.uid()
        )
      );
    ';
    
    RAISE NOTICE '✅ Organization-scoped RLS policies created successfully!';
    RAISE NOTICE '✅ Users can only access data from their own organization';
    
  ELSE
    -- Fallback: Create simple policy for all authenticated users
    EXECUTE '
      CREATE POLICY "Enable all access for authenticated users"
      ON project_states
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
    ';
    
    RAISE NOTICE '✅ Simple RLS policy created (users table has no organization_id)';
    RAISE NOTICE '⚠️ All authenticated users can access all data';
    RAISE NOTICE '⚠️ Consider adding organization_id to users table for better security';
  END IF;
END $$;

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_project_states_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_states_timestamp ON project_states;
CREATE TRIGGER update_project_states_timestamp
  BEFORE UPDATE ON project_states
  FOR EACH ROW
  EXECUTE FUNCTION update_project_states_updated_at();

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

-- Verify policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'project_states';
  
  IF policy_count > 0 THEN
    RAISE NOTICE '✅ SUCCESS! % RLS policies created for project_states', policy_count;
  ELSE
    RAISE WARNING '⚠️ No policies found. Please check for errors above.';
  END IF;
END $$;

-- Show all policies
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  CASE 
    WHEN qual IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as "Has USING",
  CASE 
    WHEN with_check IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as "Has WITH CHECK"
FROM pg_policies
WHERE tablename = 'project_states';

-- =====================================================
-- SUCCESS SUMMARY
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RLS SETUP COMPLETE FOR project_states';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your SmartLenderUp app';
  RAISE NOTICE '2. Try making changes (add client, etc.)';
  RAISE NOTICE '3. Check console for: "✅ Project state saved successfully"';
  RAISE NOTICE '';
  RAISE NOTICE 'The RLS error should now be fixed! 🎉';
  RAISE NOTICE '';
END $$;
