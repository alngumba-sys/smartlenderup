-- =====================================================
-- FIX: Correct the totalInterest field for all loans
-- =====================================================
-- This recalculates totalInterest = totalRepayable - principalAmount
-- =====================================================

-- First, let's see what we're working with
SELECT 
  loan->>'id' as loan_id,
  loan->>'principalAmount' as principal,
  loan->>'totalInterest' as current_interest,
  loan->>'totalRepayable' as total_repayable,
  (loan->>'totalRepayable')::numeric - (loan->>'principalAmount')::numeric as calculated_interest
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE state IS NOT NULL
LIMIT 10;

-- Now update all loans to have correct totalInterest
UPDATE project_states
SET state = (
  SELECT jsonb_build_object(
    'loans', (
      SELECT jsonb_agg(
        CASE 
          WHEN loan->>'principalAmount' IS NOT NULL AND loan->>'totalRepayable' IS NOT NULL
          THEN jsonb_set(
            loan,
            '{totalInterest}',
            to_jsonb((loan->>'totalRepayable')::numeric - (loan->>'principalAmount')::numeric)
          )
          ELSE loan
        END
      )
      FROM jsonb_array_elements(state->'loans') as loan
    )
  ) || (state - 'loans')
)
WHERE state IS NOT NULL 
  AND state->'loans' IS NOT NULL
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Verify the fix
SELECT 
  loan->>'id' as loan_id,
  loan->>'principalAmount' as principal,
  loan->>'totalInterest' as corrected_interest,
  loan->>'totalRepayable' as total_repayable,
  loan->>'status' as status
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE state IS NOT NULL
ORDER BY loan->>'id'
LIMIT 10;
