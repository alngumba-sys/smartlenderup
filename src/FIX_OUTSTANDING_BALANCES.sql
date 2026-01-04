-- =====================================================
-- FIX OUTSTANDING BALANCES FOR ALL LOANS
-- =====================================================

-- Update outstanding_balance for all loans based on principal - amount_paid
UPDATE loans
SET outstanding_balance = principal_amount - COALESCE(amount_paid, 0)
WHERE outstanding_balance IS NULL 
   OR outstanding_balance != (principal_amount - COALESCE(amount_paid, 0));

-- Verify the update
SELECT 
  id,
  loan_number,
  principal_amount,
  amount_paid,
  outstanding_balance,
  status,
  CASE 
    WHEN outstanding_balance > 0 THEN 'Has Outstanding'
    WHEN outstanding_balance = 0 THEN 'Fully Paid'
    ELSE 'Check Needed'
  END as balance_status
FROM loans
ORDER BY outstanding_balance DESC;

-- Show summary
SELECT 
  status,
  COUNT(*) as loan_count,
  SUM(outstanding_balance) as total_outstanding
FROM loans
GROUP BY status;
