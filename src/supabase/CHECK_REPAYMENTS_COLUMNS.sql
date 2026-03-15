-- ============================================
-- CHECK REPAYMENTS TABLE STRUCTURE
-- ============================================
-- This will show us what columns actually exist
-- in your repayments table
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'repayments'
ORDER BY ordinal_position;
