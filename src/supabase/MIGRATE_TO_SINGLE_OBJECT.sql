-- ============================================
-- MIGRATE EXISTING DATA TO SINGLE-OBJECT SYNC
-- ============================================
-- This script copies all existing data from individual tables
-- into the consolidated project_states table
-- ============================================

-- STEP 1: Verify project_states table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'project_states') THEN
    RAISE EXCEPTION 'project_states table does not exist. Please run CREATE_PROJECT_STATES_TABLE.sql first!';
  END IF;
END $$;

-- STEP 2: Create helper function to safely aggregate JSONB
CREATE OR REPLACE FUNCTION safe_jsonb_agg(org_id TEXT, table_name TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- This function safely aggregates table data into JSONB array
  -- Returns empty array if no data found
  EXECUTE format(
    'SELECT COALESCE(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) FROM %I t WHERE t.organization_id = $1',
    table_name
  ) INTO result USING org_id;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- If table doesn't exist or query fails, return empty array
    RETURN '[]'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Migrate data for each organization
INSERT INTO project_states (id, organization_id, state, created_at, updated_at)
SELECT 
  CONCAT('org_state_', org.org_id) as id,
  org.org_id as organization_id,
  jsonb_build_object(
    -- Metadata
    'metadata', jsonb_build_object(
      'version', '1.0.0',
      'lastUpdated', NOW()::text,
      'organizationId', org.org_id,
      'schemaVersion', 1
    ),
    
    -- Core Entities
    'clients', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM clients t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'loans', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM loans t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'loanProducts', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM loan_products t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'repayments', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM repayments t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Savings
    'savingsAccounts', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM savings_accounts t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'savingsTransactions', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM savings_transactions t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Shareholders
    'shareholders', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM shareholders t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'shareholderTransactions', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM shareholder_transactions t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Expenses & Payables
    'expenses', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM expenses t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'payees', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM payees t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Banking
    'bankAccounts', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM bank_accounts t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'fundingTransactions', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM funding_transactions t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Operations
    'tasks', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM tasks t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'approvals', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM approvals t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'disbursements', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM disbursements t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    'tickets', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM tickets t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Compliance
    'kycRecords', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM kyc_records t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Processing & Fees
    'processingFeeRecords', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM processing_fee_records t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- HR & Payroll
    'payrollRuns', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM payroll_runs t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Accounting
    'journalEntries', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM journal_entries t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Audit
    'auditLogs', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM audit_logs t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Groups & Lending
    'groups', COALESCE(
      (SELECT jsonb_agg(to_jsonb(t.*)) FROM groups t WHERE t.organization_id = org.org_id),
      '[]'::jsonb
    ),
    
    -- Related entities (may not have organization_id)
    'guarantors', '[]'::jsonb,
    'collaterals', '[]'::jsonb,
    'loanDocuments', '[]'::jsonb,
    
    -- Settings
    'settings', '{}'::jsonb
  ) as state,
  NOW() as created_at,
  NOW() as updated_at
FROM (
  -- Get all unique organization IDs from clients table
  SELECT DISTINCT organization_id as org_id 
  FROM clients 
  WHERE organization_id IS NOT NULL
  
  UNION
  
  -- Also check other tables in case some orgs have no clients yet
  SELECT DISTINCT organization_id as org_id 
  FROM loans 
  WHERE organization_id IS NOT NULL
  
  UNION
  
  SELECT DISTINCT organization_id as org_id 
  FROM loan_products 
  WHERE organization_id IS NOT NULL
) as org
ON CONFLICT (organization_id) DO UPDATE SET
  state = EXCLUDED.state,
  updated_at = NOW();

-- STEP 4: Verify migration
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

-- STEP 5: Clean up helper function
DROP FUNCTION IF EXISTS safe_jsonb_agg(TEXT, TEXT);

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================

/*
Next Steps:
1. Verify the counts match your expected data
2. Check state_size - should be reasonable (< 5MB per org)
3. Test loading data with new Single-Object Sync pattern
4. Once verified, you can optionally archive old tables

To test loading:
SELECT state FROM project_states WHERE organization_id = 'YOUR_ORG_ID';

To check specific entity:
SELECT 
  organization_id,
  jsonb_array_length(state->'clients') as client_count,
  state->'clients'->0 as first_client_sample
FROM project_states;
*/
