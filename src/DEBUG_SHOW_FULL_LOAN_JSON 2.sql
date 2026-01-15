-- =====================================================
-- DEBUG: Show actual JSON structure of first loan
-- =====================================================

SELECT 
  jsonb_pretty(loan) as full_loan_json
FROM 
  project_states,
  jsonb_array_elements(state->'loans') as loan
WHERE state IS NOT NULL
LIMIT 1;
