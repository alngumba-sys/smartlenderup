-- Check the actual structure of journal_entries table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'journal_entries'
ORDER BY ordinal_position;

-- Show a sample journal entry to see what columns have data
SELECT *
FROM journal_entries
LIMIT 1;
