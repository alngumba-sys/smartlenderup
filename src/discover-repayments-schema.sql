-- ============================================================================
-- DISCOVER REPAYMENTS TABLE SCHEMA (no assumptions)
-- ============================================================================

-- First, just check the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'repayments'
ORDER BY ordinal_position;

-- Then try to select everything to see what exists
SELECT * 
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
LIMIT 5;

-- Count total repayments
SELECT COUNT(*) as total_repayments
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
