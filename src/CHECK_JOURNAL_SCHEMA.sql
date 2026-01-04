-- Check if journal_entries table exists and what columns it has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'journal_entries'
ORDER BY ordinal_position;
