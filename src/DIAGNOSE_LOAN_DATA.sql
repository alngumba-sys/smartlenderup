-- =====================================================
-- DIAGNOSE LOAN DATA ISSUE
-- =====================================================
-- This script helps you understand where your loan data is
-- and why interest/outstanding amounts are showing as 0
-- =====================================================

-- Replace YOUR_ORG_ID_HERE with your actual organization ID
-- Example: '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'

\echo '═══════════════════════════════════════════════'
\echo '🔍 LOAN DATA DIAGNOSTIC'
\echo '═══════════════════════════════════════════════'
\echo ''

-- =====================================================
-- CHECK 1: Individual LOANS table
-- =====================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 CHECK 1: Individual LOANS Table'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

SELECT 
  loan_number as "Loan ID",
  amount as "Principal",
  interest_rate as "Interest %",
  (amount * (interest_rate / 100)) as "Calculated Interest",
  total_amount as "Total Amount",
  balance as "Outstanding",
  status as "Status"
FROM loans
WHERE organization_id = 'YOUR_ORG_ID_HERE'
ORDER BY loan_number
LIMIT 10;

\echo ''
\echo 'Summary:'
SELECT 
  COUNT(*) as "Total Loans in Individual Table",
  SUM(amount) as "Total Principal",
  SUM(amount * (interest_rate / 100)) as "Total Interest (Calculated)",
  SUM(balance) as "Total Outstanding"
FROM loans
WHERE organization_id = 'YOUR_ORG_ID_HERE';

\echo ''
\echo ''

-- =====================================================
-- CHECK 2: PROJECT_STATES table
-- =====================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📦 CHECK 2: PROJECT_STATES Table'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Check if organization exists in project_states
SELECT 
  organization_id,
  state_key,
  CASE 
    WHEN state ? 'loans' THEN jsonb_array_length(state->'loans')
    ELSE 0
  END as "Loans in JSON",
  CASE 
    WHEN state ? 'clients' THEN jsonb_array_length(state->'clients')
    ELSE 0
  END as "Clients in JSON",
  updated_at
FROM project_states
WHERE organization_id = 'YOUR_ORG_ID_HERE';

\echo ''

-- Sample loan from project_states
\echo 'Sample Loan from project_states JSON:'
SELECT 
  loan->>'loanNumber' as "Loan ID",
  loan->>'principalAmount' as "Principal",
  loan->>'interestRate' as "Interest Rate",
  loan->>'totalInterest' as "Total Interest",
  loan->>'outstandingBalance' as "Outstanding"
FROM project_states,
     jsonb_array_elements(state->'loans') as loan
WHERE organization_id = 'YOUR_ORG_ID_HERE'
LIMIT 5;

\echo ''
\echo ''

-- =====================================================
-- CHECK 3: CLIENTS Outstanding Amounts
-- =====================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '👤 CHECK 3: Client Outstanding Balances'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Calculate per-client outstanding from loans table
WITH client_balances AS (
  SELECT 
    c.client_number,
    c.name,
    COUNT(l.id) as loan_count,
    SUM(l.balance) as total_outstanding
  FROM clients c
  LEFT JOIN loans l ON c.id = l.client_id AND l.status != 'closed'
  WHERE c.organization_id = 'YOUR_ORG_ID_HERE'
  GROUP BY c.client_number, c.name
)
SELECT 
  client_number as "Client ID",
  name as "Client Name",
  loan_count as "Active Loans",
  COALESCE(total_outstanding, 0) as "Total Outstanding"
FROM client_balances
ORDER BY client_number
LIMIT 10;

\echo ''
\echo ''

-- =====================================================
-- DIAGNOSIS SUMMARY
-- =====================================================

\echo '═══════════════════════════════════════════════'
\echo '📋 DIAGNOSIS SUMMARY'
\echo '═══════════════════════════════════════════════'
\echo ''

DO $$
DECLARE
  org_id UUID := 'YOUR_ORG_ID_HERE';
  loans_in_table INTEGER;
  loans_in_json INTEGER;
  has_project_state BOOLEAN;
BEGIN
  
  -- Count loans in individual table
  SELECT COUNT(*) INTO loans_in_table
  FROM loans
  WHERE organization_id = org_id;
  
  -- Count loans in project_states
  SELECT 
    CASE WHEN state ? 'loans' 
      THEN jsonb_array_length(state->'loans')
      ELSE 0
    END
  INTO loans_in_json
  FROM project_states
  WHERE organization_id = org_id;
  
  -- Check if project_state exists
  SELECT EXISTS(
    SELECT 1 FROM project_states WHERE organization_id = org_id
  ) INTO has_project_state;
  
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Data Location:';
  RAISE NOTICE '   ├─ Loans in individual table: %', loans_in_table;
  RAISE NOTICE '   ├─ Loans in project_states JSON: %', COALESCE(loans_in_json, 0);
  RAISE NOTICE '   └─ Project state exists: %', has_project_state;
  RAISE NOTICE '';
  
  IF loans_in_table > 0 AND (loans_in_json = 0 OR loans_in_json IS NULL) THEN
    RAISE NOTICE '⚠️  PROBLEM IDENTIFIED:';
    RAISE NOTICE '   Your loans are in the individual "loans" table';
    RAISE NOTICE '   but NOT in the "project_states" JSON blob.';
    RAISE NOTICE '';
    RAISE NOTICE '💡 SOLUTION:';
    RAISE NOTICE '   Run the SYNC_INDIVIDUAL_TABLES_TO_PROJECT_STATES.sql script';
    RAISE NOTICE '   to sync your individual table data into project_states.';
    RAISE NOTICE '';
  ELSIF loans_in_table = loans_in_json THEN
    RAISE NOTICE '✅ Data is synchronized between both storage locations';
    RAISE NOTICE '';
  ELSIF loans_in_table < loans_in_json THEN
    RAISE NOTICE '⚠️  You have more loans in project_states than in individual table';
    RAISE NOTICE '   This might indicate a sync issue.';
    RAISE NOTICE '';
  END IF;
  
END $$;

\echo '═══════════════════════════════════════════════'
\echo ''
\echo '📝 Next Steps:'
\echo '   1. Review the data above'
\echo '   2. If loans are only in individual table,'
\echo '      run: SYNC_INDIVIDUAL_TABLES_TO_PROJECT_STATES.sql'
\echo '   3. Refresh your browser to see updated data'
\echo ''
