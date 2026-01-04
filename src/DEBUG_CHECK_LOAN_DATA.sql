-- =====================================================
-- DEBUG: Check what's actually in the database
-- =====================================================

-- Check first 3 loans in project_states JSON
SELECT 
  loan->>'loanNumber' as loan_number,
  loan->>'amount' as principal,
  loan->>'totalInterest' as total_interest,
  loan->>'totalRepayable' as total_repayable,
  loan->>'interestRate' as interest_rate,
  loan->>'balance' as balance
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE state IS NOT NULL
LIMIT 5;
