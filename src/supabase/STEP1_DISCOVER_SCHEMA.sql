-- ============================================
-- STEP 1: DISCOVER YOUR DATABASE SCHEMA
-- ============================================

-- Check what columns exist in LOANS table
SELECT 
  '=== LOANS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'loans' 
ORDER BY ordinal_position;

-- Check what columns exist in REPAYMENTS table
SELECT 
  '=== REPAYMENTS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'repayments' 
ORDER BY ordinal_position;

-- Sample data from loans (first 3 records)
SELECT 
  '=== SAMPLE LOAN DATA ===' as section,
  *
FROM public.loans
LIMIT 3;

-- Sample data from repayments (first 5 records)
SELECT 
  '=== SAMPLE REPAYMENT DATA ===' as section,
  *
FROM public.repayments
LIMIT 5;
