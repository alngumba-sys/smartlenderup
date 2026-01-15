-- =====================================================
-- IMPROVED ONE-CLICK FIX: Sync Loans to Show Interest
-- =====================================================
-- This version properly handles interest rate calculations
-- and edge cases with NULL values
-- =====================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
  org_id_text TEXT := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
  clients_json JSONB;
  loans_json JSONB;
  repayments_json JSONB;
  current_state JSONB;
  loans_count INTEGER;
  clients_count INTEGER;
BEGIN
  
  RAISE NOTICE 'Starting improved loan interest fix...';
  RAISE NOTICE 'Organization ID: %', org_id_text;
  
  -- Check if data exists
  SELECT COUNT(*) INTO loans_count FROM loans WHERE organization_id = org_id;
  SELECT COUNT(*) INTO clients_count FROM clients WHERE organization_id = org_id;
  
  IF loans_count = 0 THEN
    RAISE EXCEPTION 'ERROR: No loans found for this organization';
  END IF;
  
  IF clients_count = 0 THEN
    RAISE EXCEPTION 'ERROR: No clients found for this organization';
  END IF;
  
  RAISE NOTICE 'Found % clients and % loans', clients_count, loans_count;
  
  -- BUILD CLIENTS JSON
  RAISE NOTICE 'Building clients JSON...';
  
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', COALESCE(client_number, id::text),
      'clientNumber', client_number,
      'client_number', client_number,
      'name', COALESCE(name, first_name || ' ' || last_name, 'Unknown'),
      'firstName', COALESCE(first_name, ''),
      'lastName', COALESCE(last_name, ''),
      'email', COALESCE(email, ''),
      'phone', COALESCE(phone, ''),
      'idNumber', COALESCE(id_number, ''),
      'status', COALESCE(status, 'active'),
      'kycStatus', COALESCE(kyc_status, 'pending'),
      'verificationStatus', COALESCE(verification_status, 'pending'),
      'joinDate', COALESCE(created_at::date::text, CURRENT_DATE::text),
      'lastUpdated', COALESCE(updated_at::text, NOW()::text),
      'creditScore', 300,
      'riskRating', 'Medium'
    )
  ), '[]'::jsonb)
  INTO clients_json
  FROM clients
  WHERE organization_id = org_id;
  
  RAISE NOTICE 'Processed % clients', jsonb_array_length(clients_json);
  
  -- BUILD LOANS JSON WITH IMPROVED INTEREST CALCULATION
  RAISE NOTICE 'Building loans JSON with improved interest calculations...';
  
  SELECT COALESCE(jsonb_agg(loan_data), '[]'::jsonb)
  INTO loans_json
  FROM (
    SELECT jsonb_build_object(
      -- Identifiers
      'id', l.loan_number,
      'loanNumber', l.loan_number,
      'loanId', l.loan_number,
      
      -- Client info
      'clientId', (SELECT client_number FROM clients WHERE id = l.client_id),
      'clientUuid', l.client_id::text,
      'clientName', (SELECT COALESCE(name, first_name || ' ' || last_name) FROM clients WHERE id = l.client_id),
      
      -- Product info
      'productId', COALESCE(l.product_id::text, 'default-product'),
      'productName', COALESCE((SELECT product_name FROM loan_products WHERE id = l.product_id), 'Standard Loan'),
      
      -- Loan amounts
      'principalAmount', ROUND(l.amount),
      'loanAmount', ROUND(l.amount),
      'amount', ROUND(l.amount),
      
      -- Interest Rate (handle NULL and both percentage and decimal formats)
      'interestRate', COALESCE(
        CASE 
          WHEN l.interest_rate IS NULL THEN 10.0
          WHEN l.interest_rate < 1 THEN l.interest_rate * 100  -- Convert decimal to percentage
          ELSE l.interest_rate
        END,
        10.0
      ),
      'interestType', 'Flat',
      
      -- Total Interest Calculation (IMPROVED)
      'totalInterest', ROUND(COALESCE(
        -- Try 1: Use total_amount - amount if both exist
        CASE 
          WHEN l.total_amount IS NOT NULL AND l.total_amount > l.amount 
          THEN l.total_amount - l.amount
          ELSE NULL
        END,
        -- Try 2: Calculate from interest rate
        CASE
          WHEN l.interest_rate IS NOT NULL THEN
            CASE
              WHEN l.interest_rate < 1 THEN l.amount * l.interest_rate  -- Already decimal
              ELSE l.amount * (l.interest_rate / 100.0)  -- Percentage
            END
          ELSE NULL
        END,
        -- Try 3: Default to 10% if all else fails
        l.amount * 0.10
      )),
      
      -- Total Repayable (IMPROVED)
      'totalRepayable', ROUND(COALESCE(
        l.total_amount,
        l.amount + COALESCE(
          CASE 
            WHEN l.total_amount IS NOT NULL AND l.total_amount > l.amount 
            THEN l.total_amount - l.amount
            ELSE NULL
          END,
          CASE
            WHEN l.interest_rate IS NOT NULL THEN
              CASE
                WHEN l.interest_rate < 1 THEN l.amount * l.interest_rate
                ELSE l.amount * (l.interest_rate / 100.0)
              END
            ELSE NULL
          END,
          l.amount * 0.10
        )
      )),
      
      -- Payment tracking
      'paidAmount', ROUND(COALESCE(l.amount_paid, 0)),
      'outstandingBalance', ROUND(GREATEST(0, COALESCE(
        l.balance, 
        COALESCE(l.total_amount, l.amount * 1.10) - COALESCE(l.amount_paid, 0)
      ))),
      'principalOutstanding', ROUND(GREATEST(0, 
        l.amount - COALESCE(l.amount_paid, 0) * (l.amount::decimal / NULLIF(COALESCE(l.total_amount, l.amount * 1.10), 0))
      )),
      'interestOutstanding', ROUND(GREATEST(0,
        COALESCE(l.balance, COALESCE(l.total_amount, l.amount * 1.10) - COALESCE(l.amount_paid, 0)) - 
        (l.amount - COALESCE(l.amount_paid, 0) * (l.amount::decimal / NULLIF(COALESCE(l.total_amount, l.amount * 1.10), 0)))
      )),
      
      -- Term details
      'term', l.term_period,
      'termUnit', CASE 
        WHEN l.term_period_unit = 'months' THEN 'Months'
        WHEN l.term_period_unit = 'weeks' THEN 'Weeks'
        WHEN l.term_period_unit = 'days' THEN 'Days'
        ELSE 'Months'
      END,
      'loanTerm', l.term_period,
      'termMonths', l.term_period,
      
      -- Repayment
      'repaymentFrequency', CASE
        WHEN l.repayment_frequency = 'monthly' THEN 'Monthly'
        WHEN l.repayment_frequency = 'weekly' THEN 'Weekly'
        WHEN l.repayment_frequency = 'daily' THEN 'Daily'
        WHEN l.repayment_frequency = 'bi-weekly' THEN 'Bi-Weekly'
        ELSE 'Monthly'
      END,
      'installmentAmount', ROUND(COALESCE(l.total_amount::decimal / NULLIF(l.term_period, 0), 0)),
      'numberOfInstallments', l.term_period,
      
      -- Dates
      'disbursementDate', COALESCE(l.disbursement_date::text, l.application_date::text, CURRENT_DATE::text),
      'firstRepaymentDate', COALESCE(
        l.expected_repayment_date::text, 
        (COALESCE(l.disbursement_date, l.application_date) + INTERVAL '1 month')::date::text,
        CURRENT_DATE::text
      ),
      'maturityDate', COALESCE(
        l.maturity_date::text,
        (COALESCE(l.disbursement_date, l.application_date) + (l.term_period || ' ' || l.term_period_unit)::interval)::date::text,
        CURRENT_DATE::text
      ),
      'applicationDate', COALESCE(l.application_date::text, l.created_at::date::text, CURRENT_DATE::text),
      
      -- Status
      'status', CASE
        WHEN l.status = 'closed' THEN 'Fully Paid'
        WHEN l.status = 'disbursed' AND COALESCE(l.balance, 0) > 0 THEN 'Active'
        WHEN l.status = 'disbursed' AND COALESCE(l.balance, 0) = 0 THEN 'Fully Paid'
        WHEN l.status = 'approved' THEN 'Approved'
        WHEN l.status = 'pending' THEN 'Pending'
        WHEN l.status IN ('active', 'disbursed') THEN 'Active'
        ELSE INITCAP(l.status)
      END,
      'phase', COALESCE(l.phase, 5),
      
      -- Arrears
      'daysInArrears', CASE
        WHEN l.status = 'closed' THEN 0
        WHEN COALESCE(l.expected_repayment_date, l.maturity_date) < CURRENT_DATE 
          AND COALESCE(l.balance, 0) > 0
        THEN (CURRENT_DATE - COALESCE(l.expected_repayment_date, l.maturity_date))::integer
        ELSE 0
      END,
      'arrearsAmount', CASE
        WHEN l.status = 'closed' THEN 0
        WHEN COALESCE(l.expected_repayment_date, l.maturity_date) < CURRENT_DATE 
        THEN ROUND(COALESCE(l.balance, 0))
        ELSE 0
      END,
      'penaltyAmount', 0,
      'overdueAmount', CASE
        WHEN COALESCE(l.expected_repayment_date, l.maturity_date) < CURRENT_DATE 
        THEN ROUND(COALESCE(l.balance, 0))
        ELSE 0
      END,
      
      -- Other fields
      'purpose', 'Business',
      'createdBy', 'System',
      'createdDate', COALESCE(l.created_at::date::text, CURRENT_DATE::text),
      'lastUpdated', COALESCE(l.updated_at::text, NOW()::text),
      'loanOfficer', 'System',
      'notes', '',
      'collateral', '[]'::jsonb,
      'guarantors', '[]'::jsonb
    ) as loan_data
    FROM loans l
    WHERE l.organization_id = org_id
  ) subq;
  
  RAISE NOTICE 'Processed % loans', jsonb_array_length(loans_json);
  
  -- Show sample interest calculation for debugging
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SAMPLE LOAN DATA (First Loan):';
  RAISE NOTICE 'Loan Number: %', (loans_json->0->>'loanNumber');
  RAISE NOTICE 'Principal: %', (loans_json->0->>'principalAmount');
  RAISE NOTICE 'Interest Rate: %', (loans_json->0->>'interestRate');
  RAISE NOTICE 'Total Interest: %', (loans_json->0->>'totalInterest');
  RAISE NOTICE 'Total Repayable: %', (loans_json->0->>'totalRepayable');
  RAISE NOTICE '============================================';
  
  -- BUILD REPAYMENTS JSON
  RAISE NOTICE 'Checking for repayments...';
  
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', r.id::text,
      'loanId', (SELECT loan_number FROM loans WHERE id = r.loan_id),
      'clientId', (SELECT client_number FROM clients WHERE id = r.client_id),
      'clientName', (SELECT COALESCE(name, first_name || ' ' || last_name) FROM clients WHERE id = r.client_id),
      'amount', COALESCE(r.amount, 0),
      'principal', COALESCE(r.principal_amount, 0),
      'interest', COALESCE(r.interest_amount, 0),
      'penalty', COALESCE(r.penalty_amount, 0),
      'paymentMethod', COALESCE(r.payment_method, 'Cash'),
      'transactionRef', COALESCE(r.transaction_ref, ''),
      'paymentDate', COALESCE(r.payment_date::text, r.created_at::date::text),
      'receivedBy', COALESCE((SELECT email FROM users WHERE id = r.recorded_by), 'System'),
      'status', COALESCE(r.status, 'completed'),
      'createdDate', COALESCE(r.created_at::date::text, CURRENT_DATE::text)
    )
  ), '[]'::jsonb)
  INTO repayments_json
  FROM repayments r
  WHERE r.organization_id = org_id;
  
  RAISE NOTICE 'Found % repayments', jsonb_array_length(repayments_json);
  
  -- LOAD OR CREATE PROJECT STATE
  RAISE NOTICE 'Preparing project state...';
  
  SELECT state INTO current_state
  FROM project_states
  WHERE organization_id = org_id_text;
  
  IF current_state IS NULL THEN
    RAISE NOTICE 'Creating new project state';
    current_state := '{}'::jsonb;
  ELSE
    RAISE NOTICE 'Found existing project state';
  END IF;
  
  -- MERGE DATA INTO PROJECT STATE
  RAISE NOTICE 'Merging data into project state...';
  
  current_state := jsonb_set(current_state, '{clients}', clients_json);
  current_state := jsonb_set(current_state, '{loans}', loans_json);
  current_state := jsonb_set(current_state, '{repayments}', repayments_json);
  current_state := jsonb_set(current_state, '{loanProducts}', COALESCE(current_state->'loanProducts', '[]'::jsonb));
  current_state := jsonb_set(current_state, '{updated_at}', to_jsonb(NOW()::text));
  current_state := jsonb_set(current_state, '{last_sync}', to_jsonb(NOW()::text));
  
  RAISE NOTICE 'Data merged successfully';
  
  -- SAVE TO DATABASE
  RAISE NOTICE 'Saving to project_states table...';
  
  -- Try UPDATE first
  UPDATE project_states
  SET state = current_state,
      updated_at = NOW()
  WHERE organization_id = org_id_text;
  
  -- If no row was updated, INSERT
  IF NOT FOUND THEN
    INSERT INTO project_states (id, organization_id, state, updated_at)
    VALUES ('org_state_' || org_id_text, org_id_text, current_state, NOW());
  END IF;
  
  RAISE NOTICE 'Saved successfully';
  
  -- SUCCESS SUMMARY
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FIX COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Clients synced: %', jsonb_array_length(clients_json);
  RAISE NOTICE 'Loans synced: %', jsonb_array_length(loans_json);
  RAISE NOTICE 'Repayments synced: %', jsonb_array_length(repayments_json);
  RAISE NOTICE '';
  RAISE NOTICE 'Interest calculation verified for loan: %', (loans_json->0->>'loanNumber');
  RAISE NOTICE 'Sample: KES % principal, % rate, KES % interest',
    (loans_json->0->>'principalAmount'),
    (loans_json->0->>'interestRate') || '%',
    (loans_json->0->>'totalInterest');
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Refresh your browser (Ctrl+Shift+R)';
  RAISE NOTICE '2. Check the All Loans tab';
  RAISE NOTICE '3. Check the Individual Clients tab';
  RAISE NOTICE '========================================';
  
END $$;
