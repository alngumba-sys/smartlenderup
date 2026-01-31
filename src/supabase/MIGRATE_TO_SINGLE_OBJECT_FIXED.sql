-- ============================================
-- MIGRATE EXISTING DATA TO SINGLE-OBJECT SYNC
-- FIXED VERSION - Handles missing organization_id columns
-- ============================================

-- STEP 1: Verify project_states table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'project_states') THEN
    RAISE EXCEPTION 'project_states table does not exist. Please run CREATE_PROJECT_STATES_TABLE.sql first!';
  END IF;
END $$;

-- STEP 2: Determine how to get organization IDs
-- Option A: From users table (most common)
-- Option B: From a specific table that has organization_id
-- Option C: Use a default organization ID

-- ============================================
-- CHOOSE YOUR MIGRATION STRATEGY
-- ============================================

-- STRATEGY 1: If you have a users table with organization_id
-- Uncomment this section if applicable:
/*
INSERT INTO project_states (id, organization_id, state, created_at, updated_at)
SELECT 
  CONCAT('org_state_', u.organization_id::text) as id,
  u.organization_id::text as organization_id,
  jsonb_build_object(
    'metadata', jsonb_build_object(
      'version', '1.0.0',
      'lastUpdated', NOW()::text,
      'organizationId', u.organization_id::text,
      'schemaVersion', 1
    ),
    'clients', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM clients t), '[]'::jsonb),
    'loans', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM loans t), '[]'::jsonb),
    'loanProducts', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM loan_products t), '[]'::jsonb),
    'repayments', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM repayments t), '[]'::jsonb),
    'savingsAccounts', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM savings_accounts t), '[]'::jsonb),
    'savingsTransactions', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM savings_transactions t), '[]'::jsonb),
    'shareholders', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM shareholders t), '[]'::jsonb),
    'shareholderTransactions', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM shareholder_transactions t), '[]'::jsonb),
    'expenses', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM expenses t), '[]'::jsonb),
    'payees', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM payees t), '[]'::jsonb),
    'bankAccounts', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM bank_accounts t), '[]'::jsonb),
    'fundingTransactions', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM funding_transactions t), '[]'::jsonb),
    'tasks', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM tasks t), '[]'::jsonb),
    'approvals', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM approvals t), '[]'::jsonb),
    'disbursements', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM disbursements t), '[]'::jsonb),
    'tickets', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM tickets t), '[]'::jsonb),
    'kycRecords', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM kyc_records t), '[]'::jsonb),
    'processingFeeRecords', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM processing_fee_records t), '[]'::jsonb),
    'payrollRuns', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM payroll_runs t), '[]'::jsonb),
    'journalEntries', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM journal_entries t), '[]'::jsonb),
    'auditLogs', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM audit_logs t), '[]'::jsonb),
    'groups', COALESCE((SELECT jsonb_agg(to_jsonb(t.*)) FROM groups t), '[]'::jsonb),
    'guarantors', '[]'::jsonb,
    'collaterals', '[]'::jsonb,
    'loanDocuments', '[]'::jsonb,
    'settings', '{}'::jsonb
  ) as state,
  NOW() as created_at,
  NOW() as updated_at
FROM (SELECT DISTINCT organization_id FROM users WHERE organization_id IS NOT NULL) as u
ON CONFLICT (organization_id) DO UPDATE SET
  state = EXCLUDED.state,
  updated_at = NOW();
*/

-- ============================================
-- STRATEGY 2: Single Organization (Simple Migration)
-- Use this if you have ONE organization or want to start fresh
-- ============================================

-- Replace 'default-org-123' with your actual organization ID
-- You can find this in your Auth context or users table

INSERT INTO project_states (id, organization_id, state, created_at, updated_at)
VALUES (
  'org_state_default-org-123',
  'default-org-123',
  jsonb_build_object(
    -- Metadata
    'metadata', jsonb_build_object(
      'version', '1.0.0',
      'lastUpdated', NOW()::text,
      'organizationId', 'default-org-123',
      'schemaVersion', 1
    ),
    
    -- Core Entities - Load all data without organization_id filter
    'clients', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM clients t),
      '[]'::jsonb
    ),
    'loans', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM loans t),
      '[]'::jsonb
    ),
    'loanProducts', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM loan_products t),
      '[]'::jsonb
    ),
    'repayments', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM repayments t),
      '[]'::jsonb
    ),
    
    -- Savings
    'savingsAccounts', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM savings_accounts t),
      '[]'::jsonb
    ),
    'savingsTransactions', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM savings_transactions t),
      '[]'::jsonb
    ),
    
    -- Shareholders
    'shareholders', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM shareholders t),
      '[]'::jsonb
    ),
    'shareholderTransactions', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM shareholder_transactions t),
      '[]'::jsonb
    ),
    
    -- Expenses & Payables
    'expenses', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM expenses t),
      '[]'::jsonb
    ),
    'payees', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM payees t),
      '[]'::jsonb
    ),
    
    -- Banking
    'bankAccounts', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM bank_accounts t),
      '[]'::jsonb
    ),
    'fundingTransactions', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM funding_transactions t),
      '[]'::jsonb
    ),
    
    -- Operations
    'tasks', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM tasks t),
      '[]'::jsonb
    ),
    'approvals', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM approvals t),
      '[]'::jsonb
    ),
    'disbursements', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM disbursements t),
      '[]'::jsonb
    ),
    'tickets', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM tickets t),
      '[]'::jsonb
    ),
    
    -- Compliance
    'kycRecords', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM kyc_records t),
      '[]'::jsonb
    ),
    
    -- Processing & Fees
    'processingFeeRecords', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM processing_fee_records t),
      '[]'::jsonb
    ),
    
    -- HR & Payroll
    'payrollRuns', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM payroll_runs t),
      '[]'::jsonb
    ),
    
    -- Accounting
    'journalEntries', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM journal_entries t),
      '[]'::jsonb
    ),
    
    -- Audit
    'auditLogs', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM audit_logs t),
      '[]'::jsonb
    ),
    
    -- Groups & Lending
    'groups', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM groups t),
      '[]'::jsonb
    ),
    
    -- Related entities
    'guarantors', '[]'::jsonb,
    'collaterals', '[]'::jsonb,
    'loanDocuments', '[]'::jsonb,
    
    -- Settings
    'settings', '{}'::jsonb
  ),
  NOW(),
  NOW()
)
ON CONFLICT (organization_id) DO UPDATE SET
  state = EXCLUDED.state,
  updated_at = NOW();

-- ============================================
-- STEP 3: Verify Migration
-- ============================================

SELECT 
  organization_id,
  pg_size_pretty(pg_column_size(state)) as state_size,
  (state->'metadata'->>'lastUpdated')::text as last_updated,
  jsonb_array_length(state->'clients') as clients_count,
  jsonb_array_length(state->'loans') as loans_count,
  jsonb_array_length(state->'loanProducts') as loan_products_count,
  jsonb_array_length(state->'repayments') as repayments_count,
  jsonb_array_length(state->'savingsAccounts') as savings_accounts_count,
  jsonb_array_length(state->'shareholders') as shareholders_count,
  jsonb_array_length(state->'expenses') as expenses_count,
  jsonb_array_length(state->'bankAccounts') as bank_accounts_count,
  jsonb_array_length(state->'tasks') as tasks_count,
  jsonb_array_length(state->'approvals') as approvals_count
FROM project_states
ORDER BY organization_id;

-- ============================================
-- ALTERNATIVE: If tables don't exist yet
-- ============================================

/*
If you're starting fresh and tables don't exist,
just create an empty state:

INSERT INTO project_states (id, organization_id, state)
VALUES (
  'org_state_default-org-123',
  'default-org-123',
  jsonb_build_object(
    'metadata', jsonb_build_object(
      'version', '1.0.0',
      'lastUpdated', NOW()::text,
      'organizationId', 'default-org-123',
      'schemaVersion', 1
    ),
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
  )
)
ON CONFLICT (organization_id) DO NOTHING;
*/

-- ============================================
-- COMPLETE! ✅
-- ============================================

/*
IMPORTANT NOTES:

1. Find your organization ID:
   - Check your Auth context (currentUser.organizationId)
   - Or run: SELECT id, email, organization_id FROM users LIMIT 1;
   
2. Replace 'default-org-123' with your actual organization ID

3. If you get "relation does not exist" errors for specific tables:
   - Those tables haven't been created yet
   - Comment out those lines or they'll default to empty arrays

4. To verify the data:
   SELECT state->'clients'->0 FROM project_states LIMIT 1;
*/
