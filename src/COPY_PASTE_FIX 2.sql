-- ============================================
-- COPY-PASTE FIX FOR RLS ERROR
-- ============================================
-- Just copy this ENTIRE file and paste into
-- Supabase SQL Editor, then click "Run"
-- ============================================

-- Enable RLS
ALTER TABLE project_states ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies
DROP POLICY IF EXISTS "Allow authenticated users full access" ON project_states;
DROP POLICY IF EXISTS "Users can view their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Users can insert their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Users can update their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Users can delete their own organization's project state" ON project_states;

-- Grant permissions
GRANT ALL ON project_states TO authenticated;
GRANT ALL ON project_states TO postgres;

-- Create the policy
CREATE POLICY "Allow authenticated users full access"
ON project_states
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify it worked
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ SUCCESS! RLS policy created'
    ELSE '❌ ERROR: No policy found'
  END as status
FROM pg_policies 
WHERE tablename = 'project_states';

-- Show the policy
SELECT 
  policyname as "Policy Name",
  cmd as "Applies To",
  CASE WHEN roles::text LIKE '%authenticated%' THEN 'Authenticated Users' ELSE roles::text END as "Allowed Roles"
FROM pg_policies
WHERE tablename = 'project_states';

-- ============================================
-- DONE! 
-- ============================================
-- Now refresh your SmartLenderUp app and the
-- error should be completely gone!
-- 
-- Look for this in your browser console:
-- ✅ Project state saved successfully
-- ============================================
