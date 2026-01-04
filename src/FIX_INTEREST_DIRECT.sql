-- =====================================================
-- DIRECT FIX: Update totalInterest field by field
-- =====================================================

-- First, let's see what the calculation should be
SELECT 
  loan->>'id' as loan_id,
  loan->>'principalAmount' as principal,
  loan->>'totalRepayable' as total_repayable,
  (loan->>'totalRepayable')::numeric - (loan->>'principalAmount')::numeric as should_be_interest,
  loan->>'totalInterest' as current_wrong_interest
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE state IS NOT NULL
  AND jsonb_array_length(state->'loans') > 0
LIMIT 3;

-- Now do a simple UPDATE with the specific organization ID
WITH updated_loans AS (
  SELECT 
    organization_id,
    jsonb_agg(
      loan || jsonb_build_object(
        'totalInterest', 
        (loan->>'totalRepayable')::numeric - (loan->>'principalAmount')::numeric
      )
    ) as new_loans
  FROM 
    project_states,
    jsonb_array_elements(state->'loans') as loan
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  GROUP BY organization_id
)
UPDATE project_states ps
SET state = jsonb_set(ps.state, '{loans}', ul.new_loans)
FROM updated_loans ul
WHERE ps.organization_id = ul.organization_id;

-- Verify it worked
SELECT 
  loan->>'id' as loan_id,
  loan->>'principalAmount' as principal,
  loan->>'totalInterest' as NOW_CORRECT_interest,
  loan->>'totalRepayable' as total_repayable
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE state IS NOT NULL
  AND jsonb_array_length(state->'loans') > 0
ORDER BY loan->>'id'
LIMIT 5;
