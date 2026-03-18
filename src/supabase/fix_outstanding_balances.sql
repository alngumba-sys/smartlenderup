-- ============================================
-- FIX: Update principalOutstanding and interestOutstanding 
-- for all loans based on actual payment records
-- ============================================

-- This script recalculates the outstanding balances for each loan
-- based on the actual payments in the repayments table

-- Step 1: Create a temporary view with payment totals per loan
CREATE OR REPLACE VIEW loan_payment_summary AS
SELECT 
  l.id as loan_id,
  l.loan_number,
  l.client_name,
  l.status,
  l.principal_amount,
  l.interest_amount,
  
  -- Sum all principal paid (checking all possible column names)
  COALESCE(SUM(r.principal), 0) as total_principal_paid,
  
  -- Sum all interest paid (checking all possible column names)
  COALESCE(SUM(r.interest), 0) as total_interest_paid,
  
  -- Calculate outstanding amounts
  l.principal_amount - COALESCE(SUM(r.principal), 0) as principal_outstanding_calc,
  l.interest_amount - COALESCE(SUM(r.interest), 0) as interest_outstanding_calc
  
FROM public.loans l
LEFT JOIN public.repayments r ON r.loan_id = l.id
GROUP BY l.id, l.loan_number, l.client_name, l.status, l.principal_amount, l.interest_amount;

-- Step 2: Update loans table with recalculated outstanding balances
UPDATE public.loans l
SET 
  principal_outstanding = GREATEST(0, lps.principal_outstanding_calc),
  interest_outstanding = GREATEST(0, lps.interest_outstanding_calc),
  outstanding_balance = GREATEST(0, lps.principal_outstanding_calc + lps.interest_outstanding_calc)
FROM loan_payment_summary lps
WHERE l.id = lps.loan_id;

-- Step 3: Show results for verification
SELECT 
  loan_number,
  client_name,
  status,
  principal_amount as original_principal,
  total_principal_paid,
  principal_outstanding_calc as principal_outstanding,
  interest_amount as original_interest,
  total_interest_paid,
  interest_outstanding_calc as interest_outstanding
FROM loan_payment_summary
WHERE loan_number IN ('5224')  -- Check loan 5224 specifically
ORDER BY loan_number;

-- Step 4: Summary of all active loans
SELECT 
  status,
  COUNT(*) as loan_count,
  SUM(principal_amount) as total_principal,
  SUM(total_principal_paid) as total_principal_paid,
  SUM(principal_outstanding_calc) as total_principal_outstanding,
  SUM(interest_amount) as total_interest,
  SUM(total_interest_paid) as total_interest_paid,
  SUM(interest_outstanding_calc) as total_interest_outstanding
FROM loan_payment_summary
WHERE status IN ('Active', 'Disbursed')
GROUP BY status;

-- Cleanup
DROP VIEW loan_payment_summary;

-- ============================================
-- WHAT THIS DOES:
-- ============================================
-- 1. Calculates total principal and interest paid from repayments
-- 2. Updates principalOutstanding = principal_amount - total_principal_paid
-- 3. Updates interestOutstanding = interest_amount - total_interest_paid
-- 4. Updates outstanding_balance = principalOutstanding + interestOutstanding
--
-- After running this, the allocatePayment() function will work correctly
-- because loan.principalOutstanding and loan.interestOutstanding will be accurate
-- ============================================
