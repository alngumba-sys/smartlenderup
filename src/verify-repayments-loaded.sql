-- ============================================================================
-- VERIFY REPAYMENTS ARE LOADING CORRECTLY
-- ============================================================================

-- 1. Count total repayments
SELECT 
  '✅ TOTAL REPAYMENTS' as check_name,
  COUNT(*) as count,
  TO_CHAR(SUM(amount), 'FM999,999,990.00') as total_amount
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;

-- 2. Sample recent repayments (what the frontend will see)
SELECT 
  '📋 SAMPLE REPAYMENTS' as check_name,
  id,
  loan_id,
  TO_CHAR(amount, 'FM999,999,990.00') as amount,
  TO_CHAR(principal_amount, 'FM999,999,990.00') as principal,
  TO_CHAR(interest_amount, 'FM999,999,990.00') as interest,
  payment_method,
  payment_date,
  status
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
ORDER BY payment_date DESC
LIMIT 10;

-- 3. Verify collections by payment method
SELECT 
  '💰 BY PAYMENT METHOD' as check_name,
  payment_method,
  COUNT(*) as transactions,
  TO_CHAR(SUM(amount), 'FM999,999,990.00') as total
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
GROUP BY payment_method
ORDER BY SUM(amount) DESC;

-- 4. Verify total matches loans table
SELECT 
  '🎯 VERIFICATION' as check_name,
  (SELECT TO_CHAR(SUM(amount_paid), 'FM999,999,990.00') FROM loans WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID) as loans_table_total,
  (SELECT TO_CHAR(SUM(amount), 'FM999,999,990.00') FROM repayments WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID) as repayments_table_total,
  CASE 
    WHEN ABS((SELECT SUM(amount_paid) FROM loans WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID) - 
             (SELECT SUM(amount) FROM repayments WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID)) < 10
    THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status;
