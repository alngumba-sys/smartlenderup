-- ==========================================
-- CHECK REPAYMENTS TABLE SCHEMA
-- SmartLenderUp - Kenya
-- ==========================================
-- Run this to see what columns actually exist in your repayments table

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'repayments'
ORDER BY ordinal_position;
