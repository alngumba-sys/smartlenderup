-- =====================================================
-- PERMANENT INTEREST FIX V4
-- Fixed UUID type casting
-- =====================================================

DO $$
DECLARE
  org_id uuid := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;
  current_state jsonb;
  updated_loans jsonb;
  total_loans int := 0;
  loan_elem jsonb;
BEGIN
  RAISE NOTICE '🔧 PERMANENT INTEREST FIX V4 STARTING...';
  RAISE NOTICE '================================';
  
  -- ============================================
  -- STEP 1: Get current project_states
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '📦 STEP 1: Loading project_states...';
  
  SELECT state INTO current_state
  FROM project_states
  WHERE organization_id = org_id;
  
  IF current_state IS NULL THEN
    RAISE NOTICE '❌ No project_states found for organization';
    RETURN;
  END IF;
  
  total_loans := jsonb_array_length(current_state->'loans');
  RAISE NOTICE '  ✓ Found % loans in state', total_loans;
  
  -- ============================================
  -- STEP 2: Update interest values in JSON
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '📊 STEP 2: Calculating correct interest...';
  
  -- Build updated loans array with correct interest
  SELECT jsonb_agg(
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
    )
  ) INTO updated_loans
  FROM jsonb_array_elements(current_state->'loans') AS loan_elem;
  
  -- ============================================
  -- STEP 3: Save to database
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '💾 STEP 3: Updating project_states...';
  
  UPDATE project_states
  SET 
    state = jsonb_set(current_state, '{loans}', updated_loans),
    updated_at = now()
  WHERE organization_id = org_id;
  
  RAISE NOTICE '  ✓ project_states updated successfully';
  
  -- ============================================
  -- STEP 4: Verification
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '✅ VERIFICATION:';
  RAISE NOTICE '================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Loan Number       | Principal  | Interest   | Total      | Balance';
  RAISE NOTICE '------------------|------------|------------|------------|------------';
  
  FOR loan_elem IN
    SELECT loan_data
    FROM jsonb_array_elements((SELECT state->'loans' FROM project_states WHERE organization_id = org_id)) AS loan_data
    LIMIT 10
  LOOP
    RAISE NOTICE '%-17s | %-10s | %-10s | %-10s | %-10s',
      COALESCE(loan_elem->>'loanNumber', 'N/A'),
      COALESCE((loan_elem->>'amount')::text, '0'),
      COALESCE((loan_elem->>'totalInterest')::text, '0'),
      COALESCE((loan_elem->>'totalRepayable')::text, '0'),
      COALESCE((loan_elem->>'balance')::text, '0');
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 PERMANENT FIX COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '📌 NEXT STEPS:';
  RAISE NOTICE '   1. Hard refresh browser (Ctrl+Shift+R)';
  RAISE NOTICE '   2. Navigate to Loans tab';
  RAISE NOTICE '   3. Verify interest values display correctly';
  RAISE NOTICE '';
  RAISE NOTICE '================================';
  
END $$;
