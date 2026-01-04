-- =====================================================
-- VERIFY INTEREST DATA SYNCED TO PROJECT_STATES
-- =====================================================

-- Extract first 3 loans from project_states JSON to verify interest calculations
SELECT 
  loan->>'loanNumber' as loan_number,
  loan->>'clientName' as client_name,
  loan->>'amount' as principal,
  loan->>'interestRate' as interest_rate,
  loan->>'totalInterest' as total_interest,
  loan->>'totalRepayable' as total_repayable,
  loan->>'status' as status
FROM project_states,
jsonb_array_elements(state->'loans') as loan
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY loan->>'loanNumber'
LIMIT 5;
