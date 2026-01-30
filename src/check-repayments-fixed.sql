-- ============================================================================
-- CHECK REPAYMENTS TABLE AND FIX DATA
-- ============================================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  repayment_count INTEGER;
  total_collections DECIMAL(15,2);
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 REPAYMENTS TABLE CHECK';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Count repayments
  SELECT COUNT(*) INTO repayment_count
  FROM repayments
  WHERE organization_id = org_id;
  
  RAISE NOTICE 'Total Repayments: %', repayment_count;
  
  -- Total collections
  SELECT COALESCE(SUM(amount_paid), 0) INTO total_collections
  FROM repayments
  WHERE organization_id = org_id;
  
  RAISE NOTICE 'Total Collections: KES %', TO_CHAR(total_collections, 'FM999,999,990.00');
  RAISE NOTICE '';
  
END $$;

-- ============================================================================
-- VIEW SAMPLE REPAYMENTS
-- ============================================================================

SELECT 
  id,
  loan_id,
  client_id,
  amount_paid as amount,
  payment_date,
  closing_balance,
  created_at
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
ORDER BY payment_date DESC
LIMIT 10;

-- ============================================================================
-- CHECK TABLE SCHEMA
-- ============================================================================

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'repayments'
ORDER BY ordinal_position;
