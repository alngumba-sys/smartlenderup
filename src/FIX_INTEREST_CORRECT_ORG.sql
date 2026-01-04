-- =====================================================
-- FIX: Update totalInterest with CORRECT organization_id
-- =====================================================

-- Step 1: Show current WRONG values
SELECT 
  loan->>'id' as loan_id,
  loan->>'clientName' as client,
  (loan->>'principalAmount')::numeric as principal,
  (loan->>'totalInterest')::numeric as WRONG_interest,
  (loan->>'totalRepayable')::numeric as total_repayable,
  ((loan->>'totalRepayable')::numeric - (loan->>'principalAmount')::numeric) as SHOULD_BE
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE organization_id = 'c2f9f519-48a8-432f-a781-189481105416'
LIMIT 5;

-- Step 2: Fix ALL loans in one UPDATE
WITH updated_loans AS (
  SELECT 
    jsonb_agg(
      loan || jsonb_build_object(
        'totalInterest', 
        (loan->>'totalRepayable')::numeric - (loan->>'principalAmount')::numeric
      )
      ORDER BY loan->>'id'
    ) as new_loans
  FROM 
    project_states,
    jsonb_array_elements(state->'loans') as loan
  WHERE organization_id = 'c2f9f519-48a8-432f-a781-189481105416'
)
UPDATE project_states
SET state = jsonb_set(state, '{loans}', updated_loans.new_loans)
FROM updated_loans
WHERE organization_id = 'c2f9f519-48a8-432f-a781-189481105416';

-- Step 3: Verify the fix worked
SELECT 
  loan->>'id' as loan_id,
  loan->>'clientName' as client,
  (loan->>'principalAmount')::numeric as principal,
  (loan->>'totalInterest')::numeric as FIXED_interest,
  (loan->>'totalRepayable')::numeric as total_repayable
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE organization_id = 'c2f9f519-48a8-432f-a781-189481105416'
ORDER BY loan->>'id'
LIMIT 10;
