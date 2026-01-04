-- ==========================================
-- DIAGNOSE EXACT TABLE SCHEMAS
-- ==========================================
-- Run this first to see what columns actually exist

-- 1. Check LOANS table columns
SELECT 
  'LOANS TABLE COLUMNS' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'loans'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check REPAYMENTS table columns
SELECT 
  'REPAYMENTS TABLE COLUMNS' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'repayments'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check CLIENTS table columns
SELECT 
  'CLIENTS TABLE COLUMNS' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check JOURNAL_ENTRIES table columns
SELECT 
  'JOURNAL_ENTRIES TABLE COLUMNS' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'journal_entries'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Sample data from loans
SELECT 
  'SAMPLE LOAN DATA' as data_type,
  *
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
LIMIT 3;

-- 6. Sample data from repayments
SELECT 
  'SAMPLE REPAYMENT DATA' as data_type,
  *
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
LIMIT 3;
