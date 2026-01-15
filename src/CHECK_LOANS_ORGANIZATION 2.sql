-- =====================================================
-- Get the organization that has loans
-- =====================================================

SELECT 
  organization_id,
  jsonb_array_length(state->'loans') as loan_count
FROM project_states
WHERE state IS NOT NULL
  AND state->'loans' IS NOT NULL
  AND jsonb_array_length(state->'loans') > 0;

-- Show first loan from that organization
SELECT 
  organization_id,
  loan->>'id' as loan_id,
  loan->>'principalAmount' as principal,
  loan->>'totalInterest' as current_interest,
  loan->>'totalRepayable' as total_repayable
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE state IS NOT NULL
  AND jsonb_array_length(state->'loans') > 0
LIMIT 3;
