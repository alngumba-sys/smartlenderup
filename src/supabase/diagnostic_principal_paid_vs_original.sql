-- ============================================
-- DIAGNOSTIC: Principal Paid Back vs Principal Amount
-- For Loan 5224 and other active loans
-- ============================================

-- Check Loan 5224 Details
SELECT 
  id,
  loan_number,
  client_name,
  status,
  principal_amount,  -- ⭐ This is what was entered in "Principal Amount (KES)" during loan application
  interest_amount,
  total_amount,
  disbursement_date,
  maturity_date
FROM public.loans
WHERE loan_number = '5224' OR id = '5224';

-- ============================================
-- Check ALL Payments for Loan 5224
-- ============================================
SELECT 
  id,
  loan_id,
  amount as payment_amount,
  payment_date,
  
  -- Principal allocation fields (different names used)
  principal as principal_v1,
  principal_portion as principal_v2,
  principal_paid as principal_v3,
  principal_component as principal_v4,
  
  -- Interest allocation fields
  interest as interest_v1,
  interest_portion as interest_v2,
  interest_paid as interest_v3,
  interest_component as interest_v4,
  
  -- Penalty allocation fields
  penalty as penalty_v1,
  penalty_amount as penalty_v2,
  
  status
FROM public.repayments
WHERE loan_id = (SELECT id FROM public.loans WHERE loan_number = '5224')
ORDER BY payment_date;

-- ============================================
-- CALCULATE: Total Principal Paid for Loan 5224
-- ============================================
SELECT 
  l.loan_number,
  l.client_name,
  l.status,
  l.principal_amount as original_principal,
  
  -- Sum all principal paid from repayments (checking all possible column names)
  COALESCE(SUM(r.principal), 0) +
  COALESCE(SUM(r.principal_portion), 0) +
  COALESCE(SUM(r.principal_paid), 0) +
  COALESCE(SUM(r.principal_component), 0) as total_principal_paid,
  
  -- Calculate remaining principal
  l.principal_amount - (
    COALESCE(SUM(r.principal), 0) +
    COALESCE(SUM(r.principal_portion), 0) +
    COALESCE(SUM(r.principal_paid), 0) +
    COALESCE(SUM(r.principal_component), 0)
  ) as principal_remaining,
  
  COUNT(r.id) as payment_count
  
FROM public.loans l
LEFT JOIN public.repayments r ON r.loan_id = l.id
WHERE l.loan_number = '5224' OR l.id = '5224'
GROUP BY l.id, l.loan_number, l.client_name, l.status, l.principal_amount;

-- ============================================
-- CHECK: All Active Loans with Payment Allocations
-- ============================================
SELECT 
  l.loan_number,
  l.client_name,
  l.status,
  l.principal_amount as original_principal,
  
  -- Sum principal paid
  COALESCE(SUM(r.principal), 0) as principal_paid,
  
  -- Calculate percentage paid
  CASE 
    WHEN l.principal_amount > 0 THEN
      ROUND((COALESCE(SUM(r.principal), 0) / l.principal_amount) * 100, 2)
    ELSE 0
  END as percentage_paid,
  
  COUNT(r.id) as payment_count
  
FROM public.loans l
LEFT JOIN public.repayments r ON r.loan_id = l.id
WHERE l.status = 'Active' 
  AND l.disbursement_date IS NOT NULL
GROUP BY l.id, l.loan_number, l.client_name, l.status, l.principal_amount
ORDER BY l.loan_number
LIMIT 20;

-- ============================================
-- EXPECTED BEHAVIOR
-- ============================================
-- For a FULLY PAID loan:
--   principal_paid SHOULD equal principal_amount
--
-- For an ACTIVE loan:
--   principal_paid will be LESS than principal_amount
--   (because the loan is still being repaid)
--
-- If principal_paid > principal_amount:
--   ❌ ERROR: Over-allocation detected!
--
-- ============================================
