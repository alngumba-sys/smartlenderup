-- =====================================================
-- PERMANENT INTEREST FIX
-- Updates BOTH loans table AND project_states
-- so interest values persist even after UI syncs
-- =====================================================

DO $$
DECLARE
  org_id uuid := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
  current_state jsonb;
  updated_loans jsonb;
  loan_record record;
  calculated_interest numeric;
BEGIN
  RAISE NOTICE '🔧 PERMANENT INTEREST FIX STARTING...';
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
      interest_rate
    FROM loans 
    WHERE organization_id = org_id
  LOOP
    -- Calculate interest from total_amount - amount
    calculated_interest := COALESCE(loan_record.total_amount, 0) - COALESCE(loan_record.amount, 0);
    
    -- Update the loans table
    UPDATE loans
    SET 
      total_interest = calculated_interest,
      interest_outstanding = calculated_interest - COALESCE(interest_paid, 0)
    WHERE id = loan_record.id;
    
    RAISE NOTICE '  ✓ % - Interest: %', loan_record.loan_number, calculated_interest;
  END LOOP;
  
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
  
  -- Build updated loans array
  SELECT jsonb_agg(
    CASE 
      WHEN loan_elem->>'id' IN (SELECT id::text FROM loans WHERE organization_id = org_id)
      THEN 
        -- Update existing loan with correct interest
        jsonb_set(
          jsonb_set(
            jsonb_set(
              loan_elem,
              '{totalInterest}',
              to_jsonb((
                SELECT total_interest 
                FROM loans 
                WHERE id::text = loan_elem->>'id'
              ))
            ),
            '{interestOutstanding}',
            to_jsonb((
              SELECT interest_outstanding 
              FROM loans 
              WHERE id::text = loan_elem->>'id'
            ))
          ),
          '{totalRepayable}',
          to_jsonb((
            SELECT total_amount 
            FROM loans 
            WHERE id::text = loan_elem->>'id'
          ))
        )
      ELSE loan_elem
    END
  ) INTO updated_loans
  FROM jsonb_array_elements(current_state->'loans') AS loan_elem;
  
  -- Update project_states
  UPDATE project_states
  SET 
    state = jsonb_set(current_state, '{loans}', updated_loans),
    updated_at = now()
  WHERE organization_id = org_id;
  
  -- ============================================
  -- STEP 3: Verification
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '✅ VERIFICATION:';
  RAISE NOTICE '================================';
  
  -- Show sample from loans table
  RAISE NOTICE '';
  RAISE NOTICE '📊 Loans Table (First 3):';
  FOR loan_record IN 
    SELECT 
      loan_number,
      amount,
      total_interest,
      total_amount
    FROM loans 
    WHERE organization_id = org_id
    ORDER BY created_at
    LIMIT 3
  LOOP
    RAISE NOTICE '  % - Principal: %, Interest: %, Total: %', 
      loan_record.loan_number,
      loan_record.amount,
      loan_record.total_interest,
      loan_record.total_amount;
  END LOOP;
  
  -- Show sample from project_states
  RAISE NOTICE '';
  RAISE NOTICE '📦 Project States JSON (First Loan):';
  RAISE NOTICE '%', (
    SELECT jsonb_pretty(loan_elem)
    FROM jsonb_array_elements((SELECT state->'loans' FROM project_states WHERE organization_id = org_id)) AS loan_elem
    LIMIT 1
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 PERMANENT FIX COMPLETE!';
  RAISE NOTICE '================================';
  
END $$;
