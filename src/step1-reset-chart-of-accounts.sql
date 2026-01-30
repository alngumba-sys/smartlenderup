-- ============================================================================
-- STEP 1: RESET CHART OF ACCOUNTS BALANCES TO ZERO
-- ============================================================================
-- This clears all existing balances before recalculating from loan data
-- ============================================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  rows_updated INTEGER;
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '🔄 RESETTING CHART OF ACCOUNTS';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Reset all account balances to 0
  UPDATE chart_of_accounts 
  SET balance = 0.00, updated_at = NOW()
  WHERE organization_id = org_id::TEXT;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  RAISE NOTICE '✅ Reset % account balances to zero', rows_updated;
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  
END $$;

-- Verify all balances are now 0
SELECT 
  account_code,
  account_name,
  account_type,
  'KES ' || TO_CHAR(balance, 'FM999,999,999,990.00') as balance,
  is_active
FROM chart_of_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY account_code;
