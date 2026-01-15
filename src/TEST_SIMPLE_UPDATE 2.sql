-- =====================================================
-- TEST: Can we even update a single loan?
-- =====================================================

-- First, show current value
SELECT 
  loan->>'id' as loan_id,
  loan->>'totalInterest' as before_update
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND loan->>'id' = 'L001-367411';

-- Try to manually set it to 25000 for ONE loan
UPDATE project_states
SET state = jsonb_set(
  state,
  '{loans,0,totalInterest}',
  '25000'::jsonb
)
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Check if it worked
SELECT 
  loan->>'id' as loan_id,
  loan->>'totalInterest' as after_update,
  loan->>'principalAmount' as principal,
  loan->>'totalRepayable' as total_repayable
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND loan->>'id' = 'L001-367411';
