-- ============================================
-- ONE-CLICK UPDATE FOR LOAN 4869
-- ============================================
-- Just copy and paste this entire file into Supabase SQL Editor and click RUN
-- ============================================

-- Step 1: Update the loan record
UPDATE loans
SET 
  amount = 50000,
  term_period = 3,
  term_period_unit = 'months',
  interest_rate = 30.0,
  total_amount = 60600,
  amount_paid = 60600,
  balance = 0,
  status = 'settled',
  updated_at = NOW()
WHERE loan_number = '4869';

-- Step 2: Show result
SELECT 
  loan_number as "Loan #",
  amount as "Principal",
  total_amount as "Total",
  amount_paid as "Paid",
  balance as "Outstanding",
  status as "Status",
  '✅ UPDATED SUCCESSFULLY - Early payment discount of 4,400 applied (paid 60,600 instead of 65,000)' as "Result"
FROM loans
WHERE loan_number = '4869';
