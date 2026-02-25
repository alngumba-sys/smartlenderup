-- ============================================
-- UPDATE LOAN 4869: Fix Total Amount After Early Payment Discount
-- ============================================
-- George Munyau Kavuva paid early and received KSh 34,400 discount
-- Original total: KSh 95,000
-- Discounted total: KSh 60,600
-- Amount paid: KSh 60,600
-- Outstanding: KSh 0 ✅

UPDATE loans
SET 
  total_amount = 60600,   -- Changed from 95,000 to 60,600 (after 34,400 discount)
  balance = 0,            -- Confirmed: Outstanding balance is 0
  status = 'settled',     -- Status is settled
  updated_at = NOW()
WHERE loan_number = '4869';

-- Verify the update
SELECT 
  loan_number,
  amount as "Principal",
  total_amount as "Total Repayable",
  amount_paid as "Amount Paid",
  balance as "Outstanding",
  status
FROM loans
WHERE loan_number = '4869';
