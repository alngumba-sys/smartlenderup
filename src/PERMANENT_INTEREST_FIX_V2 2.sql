-- =====================================================
-- PERMANENT INTEREST FIX V2
-- Updates BOTH loans table AND project_states
-- Fixed: No interest_paid column in loans table
-- =====================================================

DO $$
DECLARE
  org_id uuid := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
  current_state jsonb;
  updated_loans jsonb;
  loan_record record;
  calculated_interest numeric;
  total_loans int := 0;
BEGIN
  RAISE NOTICE '🔧 PERMANENT INTEREST FIX V2 STARTING...';
  RAISE NOTICE '================================';
  
  -- ============================================
  -- STEP 1: Update loans table directly
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '📊 STEP 1: Updating loans table...';
  
  FOR loan_record IN 
    SELECT 
      id,
      loan_number,
      amount,
      total_amount,
      interest_rate,
      amount_paid,
      balance
    FROM loans 
    WHERE organization_id = org_id
  LOOP
    -- Calculate interest from total_amount - amount
    calculated_interest := COALESCE(loan_record.total_amount, 0) - COALESCE(loan_record.amount, 0);
    
    -- Update the loans table (only set total_interest, no interest_outstanding)
    UPDATE loans
    SET total_interest = calculated_interest
    WHERE id = loan_record.id;
    
    total_loans := total_loans + 1;
    RAISE NOTICE '  ✓ % - Principal: %, Interest: %, Total: %', 
      loan_record.loan_number,
      loan_record.amount,
      calculated_interest,
      loan_record.total_amount;
  END LOOP;
  
  RAISE NOTICE '  📌 Updated % loans in database', total_loans;
  
  -- ============================================
  -- STEP 2: Update project_states JSON
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '📦 STEP 2: Updating project_states JSON...';
  
  -- Get current state
  SELECT state INTO current_state
  FROM project_states
  WHERE organization_id = org_id;
  
  IF current_state IS NULL THEN
    RAISE NOTICE '❌ No project_states found';
    RETURN;
  END IF;
  
  -- Build updated loans array with correct interest values
  SELECT jsonb_agg(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          loan_elem,
          '{totalInterest}',
          to_jsonb(COALESCE((loan_elem->>'totalRepayable')::numeric, 0) - COALESCE((loan_elem->>'amount')::numeric, 0))
        ),
        '{interestOutstanding}',
        to_jsonb(
          GREATEST(
            0,
            COALESCE((loan_elem->>'totalRepayable')::numeric, 0) - 
            COALESCE((loan_elem->>'amount')::numeric, 0) - 
            COALESCE((loan_elem->>'interestPaid')::numeric, 0)
          )
        )
      ),
      '{totalRepayable}',
      CASE 
        WHEN (loan_elem->>'totalRepayable')::numeric > 0 
        THEN loan_elem->'totalRepayable'
        ELSE to_jsonb(COALESCE((loan_elem->>'amount')::numeric, 0) + COALESCE((loan_elem->>'totalInterest')::numeric, 0))
      END
    )
  ) INTO updated_loans
  FROM jsonb_array_elements(current_state->'loans') AS loan_elem;
  
  -- Update project_states
  UPDATE project_states
  SET 
    state = jsonb_set(current_state, '{loans}', updated_loans),
    updated_at = now()
  WHERE organization_id = org_id;
  
  RAISE NOTICE '  ✓ project_states JSON updated';
  
  -- ============================================
  -- STEP 3: Verification
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '✅ VERIFICATION:';
  RAISE NOTICE '================================';
  
  -- Show sample from loans table
  RAISE NOTICE '';
  RAISE NOTICE '📊 Loans Table (First 5):';
  FOR loan_record IN 
    SELECT 
      loan_number,
      amount,
      total_interest,
      total_amount,
      balance
    FROM loans 
    WHERE organization_id = org_id
    ORDER BY created_at
    LIMIT 5
  LOOP
    RAISE NOTICE '  % - Principal: %, Interest: %, Total: %, Balance: %', 
      loan_record.loan_number,
      loan_record.amount,
      loan_record.total_interest,
      loan_record.total_amount,
      loan_record.balance;
  END LOOP;
  
  -- Show sample from project_states JSON
  RAISE NOTICE '';
  RAISE NOTICE '📦 Project States JSON (First 2 Loans):';
  FOR loan_record IN
    SELECT 
      loan_elem->>'loanNumber' as loan_number,
      loan_elem->>'amount' as amount,
      loan_elem->>'totalInterest' as total_interest,
      loan_elem->>'totalRepayable' as total_repayable
    FROM jsonb_array_elements((SELECT state->'loans' FROM project_states WHERE organization_id = org_id)) AS loan_elem
    LIMIT 2
  LOOP
    RAISE NOTICE '  % - Principal: %, Interest: %, Total: %',
      loan_record.loan_number,
      loan_record.amount,
      loan_record.total_interest,
      loan_record.total_repayable;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 PERMANENT FIX COMPLETE!';
  RAISE NOTICE 'Now hard refresh your browser (Ctrl+Shift+R)';
  RAISE NOTICE '================================';
  
END $$;
