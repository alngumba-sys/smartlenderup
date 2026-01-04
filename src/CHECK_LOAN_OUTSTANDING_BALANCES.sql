-- =====================================================
-- CHECK LOAN OUTSTANDING BALANCES
-- =====================================================

-- Check all loans with their status and outstanding balances
SELECT 
  id,
  client_id,
  loan_number,
  principal_amount,
  amount_paid,
  outstanding_balance,
  status,
  created_at
FROM loans
ORDER BY created_at DESC;

-- Summary by status
SELECT 
  status,
  COUNT(*) as loan_count,
  SUM(principal_amount) as total_principal,
  SUM(amount_paid) as total_paid,
  SUM(outstanding_balance) as total_outstanding
FROM loans
GROUP BY status
ORDER BY status;

-- Check if outstanding_balance matches calculation
SELECT 
  id,
  loan_number,
  principal_amount,
  amount_paid,
  outstanding_balance,
  (principal_amount - amount_paid) as calculated_outstanding,
  CASE 
    WHEN outstanding_balance = (principal_amount - amount_paid) THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as balance_check,
  status
FROM loans
ORDER BY created_at DESC;
