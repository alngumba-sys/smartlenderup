-- =====================================================
-- COMPREHENSIVE FIX FOR OUTSTANDING BALANCES AND STATUS
-- =====================================================

-- Step 1: Fix outstanding_balance calculation
-- Update outstanding_balance for all loans based on principal - amount_paid
UPDATE loans
SET outstanding_balance = COALESCE(principal_amount, 0) - COALESCE(amount_paid, 0)
WHERE outstanding_balance IS NULL 
   OR outstanding_balance != (COALESCE(principal_amount, 0) - COALESCE(amount_paid, 0));

-- Step 2: Standardize loan statuses
-- Set to 'Fully Paid' if outstanding balance is 0 or less
UPDATE loans
SET status = 'Fully Paid'
WHERE outstanding_balance <= 0;

-- Set to 'Active' if outstanding balance > 0 and status is not already set correctly
UPDATE loans
SET status = 'Active'
WHERE outstanding_balance > 0 
  AND (status IS NULL 
       OR status = '' 
       OR status NOT IN ('Active', 'Disbursed', 'In Arrears', 'Written Off'));

-- Step 3: Verify the fixes
SELECT 
  'Summary by Status' as report_type,
  status,
  COUNT(*) as loan_count,
  SUM(principal_amount) as total_principal,
  SUM(amount_paid) as total_paid,
  SUM(outstanding_balance) as total_outstanding
FROM loans
GROUP BY status
ORDER BY status;

-- Step 4: Show detailed loan information
SELECT 
  'Detailed Loan Info' as report_type,
  id,
  loan_number,
  client_id,
  principal_amount,
  amount_paid,
  outstanding_balance,
  status,
  disbursement_date,
  created_at
FROM loans
ORDER BY outstanding_balance DESC
LIMIT 20;

-- Step 5: Check for any remaining issues
SELECT 
  'Data Quality Check' as report_type,
  COUNT(*) FILTER (WHERE outstanding_balance IS NULL) as null_outstanding,
  COUNT(*) FILTER (WHERE status IS NULL OR status = '') as null_status,
  COUNT(*) FILTER (WHERE outstanding_balance < 0) as negative_outstanding,
  COUNT(*) FILTER (WHERE outstanding_balance != (principal_amount - COALESCE(amount_paid, 0))) as mismatched_balance,
  COUNT(*) as total_loans
FROM loans;
