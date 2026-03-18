-- Show ALL columns in loans table
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'loans' 
ORDER BY ordinal_position;

-- Show sample loan data
SELECT * FROM public.loans LIMIT 2;
