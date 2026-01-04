-- ========================================================
-- DIAGNOSTIC: Find EXACT columns in bank_accounts table
-- ========================================================
-- Run this FIRST to see what you actually have

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bank_accounts'
ORDER BY ordinal_position;

-- This will show you EXACTLY what columns exist
-- Copy the output and we'll update the code to match
