-- =====================================================
-- STANDARDIZE LOAN STATUS VALUES
-- =====================================================

-- Update loan statuses based on outstanding balance
-- This ensures the chart will display correctly

-- Set to 'Fully Paid' if outstanding balance is 0
UPDATE loans
SET status = 'Fully Paid'
WHERE outstanding_balance = 0 OR outstanding_balance IS NULL;

-- Set to 'Active' if outstanding balance > 0
UPDATE loans
SET status = 'Active'
WHERE outstanding_balance > 0 
  AND (status IS NULL OR status = '' OR status NOT IN ('Active', 'Disbursed', 'Fully Paid', 'In Arrears', 'Written Off'));

-- Verify the update
SELECT 
  status,
  COUNT(*) as loan_count,
  SUM(principal_amount) as total_principal,
  SUM(outstanding_balance) as total_outstanding
FROM loans
GROUP BY status
ORDER BY status;

-- Show sample of updated loans
SELECT 
  id,
  loan_number,
  principal_amount,
  outstanding_balance,
  status
FROM loans
ORDER BY outstanding_balance DESC
LIMIT 20;
