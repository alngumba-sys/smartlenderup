-- =====================================================
-- SIMPLE DIAGNOSTIC: Check What Exists
-- =====================================================

-- 1. Check raw loan data (first 3 loans)
SELECT 
  loan_number,
  amount,
  interest_rate,
  total_amount,
  amount_paid,
  balance,
  status
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY created_at
LIMIT 3;
