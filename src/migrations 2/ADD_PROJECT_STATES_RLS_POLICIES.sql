-- =====================================================
-- RLS POLICIES FOR PROJECT_STATES TABLE
-- =====================================================
-- This fixes the "new row violates row-level security policy" error
-- by adding proper policies for authenticated users

-- Drop existing policies if any (to make this script idempotent)
DROP POLICY IF EXISTS "Users can view their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Users can insert their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Users can update their own organization's project state" ON project_states;
DROP POLICY IF EXISTS "Users can delete their own organization's project state" ON project_states;

-- =====================================================
-- SELECT Policy (Read)
-- =====================================================
CREATE POLICY "Users can view their own organization's project state"
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

-- =====================================================
-- INSERT Policy (Create)
-- =====================================================
CREATE POLICY "Users can insert their own organization's project state"
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

-- =====================================================
-- UPDATE Policy (Modify)
-- =====================================================
CREATE POLICY "Users can update their own organization's project state"
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

-- =====================================================
-- DELETE Policy (Remove)
-- =====================================================
CREATE POLICY "Users can delete their own organization's project state"
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

-- =====================================================
-- Verify RLS is enabled
-- =====================================================
ALTER TABLE project_states ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the policies were created:
-- SELECT * FROM pg_policies WHERE tablename = 'project_states';

COMMENT ON POLICY "Users can view their own organization's project state" ON project_states 
IS 'Allows users to view project states for their organization only';

COMMENT ON POLICY "Users can insert their own organization's project state" ON project_states 
IS 'Allows users to create project states for their organization only';

COMMENT ON POLICY "Users can update their own organization's project state" ON project_states 
IS 'Allows users to update project states for their organization only';

COMMENT ON POLICY "Users can delete their own organization's project state" ON project_states 
IS 'Allows users to delete project states for their organization only';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies for project_states table created successfully!';
  RAISE NOTICE '✅ Users can now access their organization data';
  RAISE NOTICE '✅ Security: Users can only access data from their own organization';
END $$;
