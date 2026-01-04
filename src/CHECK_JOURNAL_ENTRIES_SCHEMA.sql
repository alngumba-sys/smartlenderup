-- ==========================================
-- CHECK EXISTING JOURNAL_ENTRIES TABLE SCHEMA
-- ==========================================

-- Check what columns exist in journal_entries table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'journal_entries'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what columns exist in chart_of_accounts table (if it exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'chart_of_accounts'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data from journal_entries
SELECT * FROM journal_entries LIMIT 5;

-- Check sample data from chart_of_accounts (if exists)
SELECT * FROM chart_of_accounts LIMIT 5;
