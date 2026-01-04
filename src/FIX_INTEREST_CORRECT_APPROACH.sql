-- =====================================================
-- FIX: Update totalInterest for all loans
-- =====================================================
-- This correctly calculates: totalInterest = totalRepayable - principalAmount
-- =====================================================

-- Step 1: Show current wrong values
SELECT 
  loan->>'id' as loan_id,
  (loan->>'principalAmount')::numeric as principal,
  (loan->>'totalInterest')::numeric as wrong_interest,
  (loan->>'totalRepayable')::numeric as total_repayable,
  ((loan->>'totalRepayable')::numeric - (loan->>'principalAmount')::numeric) as correct_interest
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE state IS NOT NULL
  AND jsonb_array_length(state->'loans') > 0
LIMIT 5;

-- Step 2: Update all loans with correct totalInterest
UPDATE project_states
SET state = jsonb_set(
  state,
  '{loans}',
  (
    SELECT jsonb_agg(
      jsonb_set(
        loan,
        '{totalInterest}',
        to_jsonb(
          (loan->>'totalRepayable')::numeric - (loan->>'principalAmount')::numeric
        )
      )
    )
    FROM jsonb_array_elements(state->'loans') as loan
  )
)
WHERE state IS NOT NULL
  AND state->'loans' IS NOT NULL
  AND jsonb_array_length(state->'loans') > 0
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Step 3: Verify the fix
SELECT 
  loan->>'id' as loan_id,
  (loan->>'principalAmount')::numeric as principal,
  (loan->>'totalInterest')::numeric as fixed_interest,
  (loan->>'totalRepayable')::numeric as total_repayable,
  loan->>'status' as status
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE state IS NOT NULL
  AND jsonb_array_length(state->'loans') > 0
ORDER BY loan->>'id'
LIMIT 10;
