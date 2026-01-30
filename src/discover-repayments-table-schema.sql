-- ============================================================================
-- DISCOVER REPAYMENTS TABLE SCHEMA
-- ============================================================================

-- Get all columns in the repayments table
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'repayments'
ORDER BY ordinal_position;

-- Check if any repayments exist
SELECT COUNT(*) as total_repayments
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;

-- Sample structure
SELECT *
FROM repayments
LIMIT 1;
