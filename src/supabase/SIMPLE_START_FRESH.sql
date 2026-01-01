-- ============================================
-- SIMPLE START: Create Empty Project State
-- ============================================
-- Use this if:
-- 1. You're starting fresh (no existing data to migrate)
-- 2. Your tables don't have organization_id columns yet
-- 3. You just want to test the single-object sync pattern
-- ============================================

-- STEP 1: Find your organization ID
-- Run this query to get your organization ID:
SELECT 
  id as user_id,
  email,
  raw_user_meta_data->>'organizationId' as organization_id
FROM auth.users 
WHERE email = 'YOUR_EMAIL_HERE'  -- Replace with your email
LIMIT 1;

-- Or if you have a users table:
-- SELECT id, email, organization_id FROM users WHERE email = 'YOUR_EMAIL_HERE' LIMIT 1;

-- ============================================
-- STEP 2: Create Empty State
-- ============================================

-- REPLACE 'YOUR_ORG_ID_HERE' with the organization_id from Step 1

INSERT INTO project_states (id, organization_id, state, created_at, updated_at)
VALUES (
  'org_state_YOUR_ORG_ID_HERE',  -- Replace YOUR_ORG_ID_HERE
  'YOUR_ORG_ID_HERE',             -- Replace YOUR_ORG_ID_HERE
  jsonb_build_object(
    -- Metadata
    'metadata', jsonb_build_object(
      'version', '1.0.0',
      'lastUpdated', NOW()::text,
      'organizationId', 'YOUR_ORG_ID_HERE',  -- Replace YOUR_ORG_ID_HERE
      'schemaVersion', 1
    ),
    
    -- All entities start empty
    'clients', '[]'::jsonb,
    'loans', '[]'::jsonb,
    'loanProducts', '[]'::jsonb,
    'repayments', '[]'::jsonb,
    'savingsAccounts', '[]'::jsonb,
    'savingsTransactions', '[]'::jsonb,
    'shareholders', '[]'::jsonb,
    'shareholderTransactions', '[]'::jsonb,
    'expenses', '[]'::jsonb,
    'payees', '[]'::jsonb,
    'bankAccounts', '[]'::jsonb,
    'fundingTransactions', '[]'::jsonb,
    'tasks', '[]'::jsonb,
    'approvals', '[]'::jsonb,
    'disbursements', '[]'::jsonb,
    'tickets', '[]'::jsonb,
    'kycRecords', '[]'::jsonb,
    'processingFeeRecords', '[]'::jsonb,
    'payrollRuns', '[]'::jsonb,
    'journalEntries', '[]'::jsonb,
    'auditLogs', '[]'::jsonb,
    'groups', '[]'::jsonb,
    'guarantors', '[]'::jsonb,
    'collaterals', '[]'::jsonb,
    'loanDocuments', '[]'::jsonb,
    'settings', '{}'::jsonb
  ),
  NOW(),
  NOW()
)
ON CONFLICT (organization_id) DO UPDATE SET
  state = EXCLUDED.state,
  updated_at = NOW();

-- ============================================
-- STEP 3: Verify
-- ============================================

-- Check if state was created
SELECT 
  organization_id,
  pg_size_pretty(pg_column_size(state)) as state_size,
  (state->'metadata'->>'lastUpdated') as last_updated,
  (state->'metadata'->>'version') as version,
  jsonb_object_keys(state) as entity_keys
FROM project_states;

-- View the full state
SELECT 
  organization_id,
  jsonb_pretty(state) as state_json
FROM project_states;

-- ============================================
-- SUCCESS! ✅
-- ============================================

/*
What's Next?

1. Your app will now use this empty state
2. As you add clients, loans, etc., they'll be saved here
3. All data will sync automatically
4. You can export/import the state as needed

To test in your app:
- Open the app
- The new DataContext will load this empty state
- Add some test data (client, loan, etc.)
- Check console for "Saving entire project state..."
- Run this query again to see your data:
  
  SELECT 
    jsonb_array_length(state->'clients') as clients,
    jsonb_array_length(state->'loans') as loans,
    state->'clients'->0 as first_client
  FROM project_states;
*/
