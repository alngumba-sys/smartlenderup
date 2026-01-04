-- =====================================================
-- Find the ACTUAL organization with loans
-- =====================================================

-- Show ALL organizations and their loan counts
SELECT 
  organization_id,
  jsonb_array_length(state->'loans') as loan_count,
  state->'metadata'->>'organizationId' as metadata_org_id
FROM project_states
WHERE state IS NOT NULL;

-- Show first loan from the organization that HAS loans
SELECT 
  ps.organization_id,
  loan->>'id' as loan_id,
  loan->>'clientName' as client,
  loan->>'principalAmount' as principal,
  loan->>'totalInterest' as interest,
  loan->>'totalRepayable' as total
FROM 
  project_states ps,
  jsonb_array_elements(ps.state->'loans') as loan
WHERE ps.state IS NOT NULL
  AND jsonb_array_length(ps.state->'loans') > 0
LIMIT 3;
