-- =====================================================
-- CHECK PROJECT STATES TABLE
-- =====================================================

-- 1. Does the row exist?
SELECT 
  organization_id,
  id,
  created_at,
  updated_at
FROM project_states
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- 2. How big is the state?
SELECT 
  organization_id,
  pg_size_pretty(pg_column_size(state)) as state_size,
  jsonb_typeof(state) as state_type
FROM project_states
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- 3. What keys exist in state?
SELECT 
  organization_id,
  jsonb_object_keys(state) as top_level_keys
FROM project_states
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- 4. How many loans are in the state?
SELECT 
  organization_id,
  jsonb_array_length(state->'loans') as loans_count,
  jsonb_array_length(state->'clients') as clients_count
FROM project_states
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
