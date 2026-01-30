-- ============================================================================
-- CHECK REPAYMENTS TABLE AND FIX DATA
-- ============================================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  repayment_count INTEGER;
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 REPAYMENTS TABLE CHECK';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Count repayments
  SELECT COUNT(*) INTO repayment_count
  FROM repayments
  WHERE organization_id = org_id::TEXT;
  
  RAISE NOTICE 'Total Repayments: %', repayment_count;
  RAISE NOTICE '';
  
  IF repayment_count > 0 THEN
    RAISE NOTICE 'Sample Repayments (first 5):';
    RAISE NOTICE '';
    
    FOR rec IN 
      SELECT 
        id,
        loan_id,
        amount_paid,
        payment_date,
        closing_balance,
        created_at
      FROM repayments
      WHERE organization_id = org_id::TEXT
      ORDER BY payment_date DESC
      LIMIT 5
    LOOP
      RAISE NOTICE 'ID: % | Amount: KES % | Date: % | Balance After: KES %', 
        rec.id, 
        rec.amount_paid,
        rec.payment_date::DATE,
        rec.closing_balance;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total Collections: KES %', 
      (SELECT TO_CHAR(COALESCE(SUM(amount_paid), 0), 'FM999,999,990.00') 
       FROM repayments 
       WHERE organization_id = org_id::TEXT);
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  
END $$;

-- ============================================================================
-- CHECK MISSING COLUMNS
-- ============================================================================

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'repayments'
ORDER BY ordinal_position;
