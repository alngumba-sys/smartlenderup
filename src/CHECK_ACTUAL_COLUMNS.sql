-- =====================================================
-- CHECK ACTUAL DATABASE COLUMNS
-- =====================================================
-- Run this first to see what columns you actually have
-- =====================================================

-- Check CLIENTS table columns
SELECT 
  'CLIENTS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- Check LOANS table columns
SELECT 
  'LOANS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- Check REPAYMENTS table columns
SELECT 
  'REPAYMENTS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'repayments'
ORDER BY ordinal_position;
