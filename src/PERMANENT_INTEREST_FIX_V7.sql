-- =====================================================
-- PERMANENT INTEREST FIX V7
-- Only update rows with non-null state
-- =====================================================

DO $$
DECLARE
  current_state jsonb;
  updated_loans jsonb;
  total_loans int := 0;
  loan_record jsonb;
  rows_updated int := 0;
BEGIN
  RAISE NOTICE '🔧 PERMANENT INTEREST FIX V7 STARTING...';
  RAISE NOTICE '================================';
  
  -- ============================================
  -- STEP 1: Get current project_states
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '📦 STEP 1: Loading project_states...';
  
  -- Get the first project state that has actual data (non-null)
  SELECT state INTO current_state
  FROM project_states
  WHERE state IS NOT NULL
  LIMIT 1;
  
  IF current_state IS NULL THEN
    RAISE NOTICE '❌ No project_states found with data';
    RETURN;
  END IF;
  
  IF current_state->'loans' IS NULL THEN
    RAISE NOTICE '❌ No loans found in state';
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
        loan_data,
        '{totalInterest}',
        to_jsonb(COALESCE((loan_data->>'totalRepayable')::numeric, 0) - COALESCE((loan_data->>'amount')::numeric, 0))
      ),
      '{interestOutstanding}',
      to_jsonb(
        GREATEST(
          0,
          COALESCE((loan_data->>'totalRepayable')::numeric, 0) - 
          COALESCE((loan_data->>'amount')::numeric, 0) - 
          COALESCE((loan_data->>'interestPaid')::numeric, 0)
        )
      )
    )
  ) INTO updated_loans
  FROM jsonb_array_elements(current_state->'loans') AS loan_data;
  
  -- ============================================
  -- STEP 3: Save to database
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '💾 STEP 3: Updating project_states...';
  
  -- Only update rows where state is not null
  UPDATE project_states
  SET 
    state = jsonb_set(state, '{loans}', updated_loans),
    updated_at = now()
  WHERE state IS NOT NULL;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '  ✓ Updated % row(s)', rows_updated;
  
  -- ============================================
  -- STEP 4: Verification
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '✅ VERIFICATION:';
  RAISE NOTICE '================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Loan Number       | Principal  | Interest   | Total      | Balance';
  RAISE NOTICE '------------------|------------|------------|------------|------------';
  
  FOR loan_record IN
    SELECT loan_data
    FROM jsonb_array_elements((SELECT state->'loans' FROM project_states WHERE state IS NOT NULL LIMIT 1)) AS loan_data
    LIMIT 10
  LOOP
    RAISE NOTICE '%-17s | %-10s | %-10s | %-10s | %-10s',
      COALESCE(loan_record->>'loanNumber', 'N/A'),
      COALESCE((loan_record->>'amount')::text, '0'),
      COALESCE((loan_record->>'totalInterest')::text, '0'),
      COALESCE((loan_record->>'totalRepayable')::text, '0'),
      COALESCE((loan_record->>'balance')::text, '0');
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
