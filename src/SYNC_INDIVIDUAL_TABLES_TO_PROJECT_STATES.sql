-- =====================================================
-- SYNC INDIVIDUAL TABLES TO PROJECT_STATES
-- =====================================================
-- This script reads data from individual tables (loans, clients, etc.)
-- and syncs it into the project_states JSON blob so that the frontend
-- can properly display interest amounts and outstanding balances
-- =====================================================

-- Replace YOUR_ORG_ID_HERE with your actual organization ID
-- Example: '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'

DO $$
DECLARE
  org_id UUID := 'YOUR_ORG_ID_HERE'; -- ⚠️ REPLACE THIS
  clients_json JSONB;
  loans_json JSONB;
  current_state JSONB;
  state_key TEXT;
BEGIN
  
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '📦 SYNCING INDIVIDUAL TABLES TO PROJECT_STATES';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'Organization ID: %', org_id;
  
  -- =====================================================
  -- STEP 1: Build Clients JSON from clients table
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '👥 Building clients JSON...';
  
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', COALESCE(client_number, id::text),
      'clientNumber', client_number,
      'client_number', client_number,
      'name', COALESCE(name, first_name || ' ' || last_name),
      'firstName', first_name,
      'lastName', last_name,
      'email', COALESCE(email, ''),
      'phone', COALESCE(phone, ''),
      'idNumber', COALESCE(id_number, ''),
      'address', COALESCE(address, ''),
      'city', COALESCE(city, ''),
      'county', COALESCE(county, ''),
      'occupation', COALESCE(occupation, ''),
      'employer', COALESCE(employer, ''),
      'monthlyIncome', COALESCE(monthly_income, 0),
      'dateOfBirth', COALESCE(date_of_birth::text, ''),
      'gender', COALESCE(gender, 'Other'),
      'maritalStatus', COALESCE(marital_status, ''),
      'status', COALESCE(status, 'active'),
      'joinDate', COALESCE(join_date::text, created_at::text),
      'createdBy', COALESCE(created_by, 'System'),
      'lastUpdated', COALESCE(updated_at::text, NOW()::text),
      'nextOfKin', jsonb_build_object(
        'name', COALESCE(next_of_kin_name, ''),
        'relationship', COALESCE(next_of_kin_relationship, ''),
        'phone', COALESCE(next_of_kin_phone, '')
      )
    )
  ), '[]'::jsonb)
  INTO clients_json
  FROM clients
  WHERE organization_id = org_id;
  
  RAISE NOTICE '✅ Found % clients', jsonb_array_length(clients_json);
  
  -- =====================================================
  -- STEP 2: Build Loans JSON from loans table
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '💰 Building loans JSON...';
  
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', loan_number,
      'loanNumber', loan_number,
      'clientId', (SELECT client_number FROM clients WHERE id = l.client_id),
      'clientName', (SELECT name FROM clients WHERE id = l.client_id),
      'productId', COALESCE(product_id::text, 'default-product'),
      'productName', 'Standard Loan',
      'principalAmount', amount,
      'interestRate', interest_rate,
      'interestType', 'Flat',
      'term', term_period,
      'termUnit', CASE 
        WHEN term_period_unit = 'months' THEN 'Months'
        WHEN term_period_unit = 'weeks' THEN 'Weeks'
        WHEN term_period_unit = 'days' THEN 'Days'
        ELSE 'Months'
      END,
      'repaymentFrequency', CASE
        WHEN repayment_frequency = 'monthly' THEN 'Monthly'
        WHEN repayment_frequency = 'weekly' THEN 'Weekly'
        WHEN repayment_frequency = 'daily' THEN 'Daily'
        ELSE 'Monthly'
      END,
      'disbursementDate', COALESCE(disbursement_date::text, application_date::text),
      'firstRepaymentDate', COALESCE(expected_repayment_date::text, (disbursement_date + INTERVAL '1 month')::text),
      'maturityDate', COALESCE(maturity_date::text, (disbursement_date + (term_period || ' ' || term_period_unit)::interval)::text),
      'status', CASE
        WHEN status = 'closed' THEN 'Fully Paid'
        WHEN status = 'disbursed' THEN 'Active'
        WHEN status = 'approved' THEN 'Approved'
        WHEN status = 'pending' THEN 'Pending'
        ELSE 'Active'
      END,
      'totalInterest', COALESCE(total_amount - amount, amount * (interest_rate / 100)),
      'totalRepayable', COALESCE(total_amount, amount + (amount * (interest_rate / 100))),
      'paidAmount', COALESCE(amount_paid, 0),
      'outstandingBalance', COALESCE(balance, total_amount - amount_paid, total_amount),
      'principalOutstanding', COALESCE(balance, amount - amount_paid, amount),
      'interestOutstanding', COALESCE((total_amount - amount) * (1 - (amount_paid::decimal / NULLIF(total_amount, 0))), 0),
      'installmentAmount', COALESCE(total_amount::decimal / NULLIF(term_period, 0), 0),
      'numberOfInstallments', term_period,
      'daysInArrears', CASE
        WHEN status = 'closed' THEN 0
        WHEN expected_repayment_date < CURRENT_DATE THEN EXTRACT(DAY FROM CURRENT_DATE - expected_repayment_date)::integer
        ELSE 0
      END,
      'arrearsAmount', CASE
        WHEN status = 'closed' THEN 0
        WHEN expected_repayment_date < CURRENT_DATE THEN COALESCE(balance, 0)
        ELSE 0
      END,
      'penaltyAmount', 0,
      'purpose', COALESCE(purpose, 'Business'),
      'applicationDate', COALESCE(application_date::text, created_at::text),
      'createdBy', 'System',
      'lastUpdated', COALESCE(updated_at::text, NOW()::text)
    )
  ), '[]'::jsonb)
  INTO loans_json
  FROM loans l
  WHERE l.organization_id = org_id;
  
  RAISE NOTICE '✅ Found % loans', jsonb_array_length(loans_json);
  
  -- =====================================================
  -- STEP 3: Load existing project_states or create new
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '📥 Loading existing project state...';
  
  state_key := 'org_state_' || org_id;
  
  SELECT state INTO current_state
  FROM project_states
  WHERE organization_id = org_id AND state_key = state_key;
  
  IF current_state IS NULL THEN
    RAISE NOTICE '⚠️  No existing project state found, creating new one';
    current_state := '{}'::jsonb;
  ELSE
    RAISE NOTICE '✅ Loaded existing project state';
  END IF;
  
  -- =====================================================
  -- STEP 4: Merge clients and loans into project state
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Merging data into project state...';
  
  current_state := jsonb_set(current_state, '{clients}', clients_json);
  current_state := jsonb_set(current_state, '{loans}', loans_json);
  current_state := jsonb_set(current_state, '{updated_at}', to_jsonb(NOW()::text));
  
  -- =====================================================
  -- STEP 5: Save back to project_states table
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '💾 Saving to project_states...';
  
  INSERT INTO project_states (organization_id, state_key, state, updated_at)
  VALUES (org_id, state_key, current_state, NOW())
  ON CONFLICT (organization_id, state_key)
  DO UPDATE SET
    state = EXCLUDED.state,
    updated_at = EXCLUDED.updated_at;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '✅ SYNC COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '   Clients synced: %', jsonb_array_length(clients_json);
  RAISE NOTICE '   Loans synced: %', jsonb_array_length(loans_json);
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your loans should now show interest and outstanding amounts!';
  RAISE NOTICE '';
  
END $$;


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check what's in project_states now
SELECT 
  organization_id,
  state_key,
  jsonb_array_length(state->'clients') as clients_count,
  jsonb_array_length(state->'loans') as loans_count,
  updated_at
FROM project_states
WHERE organization_id = 'YOUR_ORG_ID_HERE';

-- Sample loan data from project_states
SELECT 
  jsonb_pretty(state->'loans'->0) as first_loan_sample
FROM project_states  
WHERE organization_id = 'YOUR_ORG_ID_HERE'
LIMIT 1;
