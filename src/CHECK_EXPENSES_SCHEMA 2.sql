-- ========================================================
-- CHECK: What columns exist in the expenses table?
-- ========================================================
-- Run this in Supabase SQL Editor to see what columns you have

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'expenses'
ORDER BY ordinal_position;
