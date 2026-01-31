-- ============================================
-- FIND YOUR ORGANIZATION ID
-- ============================================
-- Run these queries to discover your organization ID
-- ============================================

-- ============================================
-- METHOD 1: Check auth.users metadata
-- ============================================

SELECT 
  id as user_id,
  email,
  raw_user_meta_data as metadata,
  raw_user_meta_data->>'organizationId' as organization_id,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- METHOD 2: Check if you have a users table
-- ============================================

-- Uncomment if you have a users table:
/*
SELECT 
  id,
  email,
  organization_id,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
*/

-- ============================================
-- METHOD 3: Check if you have an organizations table
-- ============================================

-- Uncomment if you have an organizations table:
/*
SELECT 
  id as organization_id,
  name as organization_name,
  created_at
FROM organizations
ORDER BY created_at DESC
LIMIT 5;
*/

-- ============================================
-- METHOD 4: List all tables to find where org data is
-- ============================================

SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name LIKE '%organization%'
  OR column_name LIKE '%org%'
ORDER BY table_name, ordinal_position;

-- ============================================
-- METHOD 5: Check existing data tables for patterns
-- ============================================

-- Check if clients table exists and has any org-related columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;

-- ============================================
-- EXAMPLE: If you find your org ID is 'abc-123-xyz'
-- ============================================

/*
Then you would use it like this in the migration scripts:

INSERT INTO project_states (id, organization_id, state)
VALUES (
  'org_state_abc-123-xyz',  -- Your org ID here
  'abc-123-xyz',             -- Your org ID here
  jsonb_build_object(...)
);
*/

-- ============================================
-- QUICK TEST: Create with a test org ID
-- ============================================

-- If you can't find your org ID, you can use a test one:

DO $$
DECLARE
  test_org_id TEXT := 'test-org-' || gen_random_uuid()::text;
BEGIN
  RAISE NOTICE 'Generated test organization ID: %', test_org_id;
  
  -- Insert a test state
  INSERT INTO project_states (id, organization_id, state)
  VALUES (
    'org_state_' || test_org_id,
    test_org_id,
    jsonb_build_object(
      'metadata', jsonb_build_object(
        'version', '1.0.0',
        'lastUpdated', NOW()::text,
        'organizationId', test_org_id,
        'schemaVersion', 1
      ),
      'clients', '[]'::jsonb,
      'loans', '[]'::jsonb,
      'loanProducts', '[]'::jsonb,
      'settings', '{}'::jsonb
    )
  )
  ON CONFLICT (organization_id) DO NOTHING;
  
  RAISE NOTICE 'Test state created! Use this org ID in your app: %', test_org_id;
END $$;

-- ============================================
-- VERIFY YOUR PROJECT STATE
-- ============================================

-- Check what states exist
SELECT 
  id,
  organization_id,
  pg_size_pretty(pg_column_size(state)) as size,
  created_at,
  updated_at
FROM project_states
ORDER BY created_at DESC;

-- ============================================
-- NOTES
-- ============================================

/*
Common Organization ID Patterns:

1. UUID format: 
   550e8400-e29b-41d4-a716-446655440000
   
2. Numeric:
   123456
   
3. Prefixed:
   org_123456
   ORG-ABC-123
   
4. Custom:
   smartlender-001
   client-xyz-789

Whatever format you find, use it consistently in:
- The migration scripts
- Your app's AuthContext
- The singleObjectSync utility
*/
