-- =====================================================
-- DEBUG: Check the actual state structure
-- =====================================================

SELECT 
  organization_id,
  jsonb_typeof(state) as state_type,
  jsonb_pretty(state) as state_content
FROM project_states
WHERE state IS NOT NULL
LIMIT 1;
