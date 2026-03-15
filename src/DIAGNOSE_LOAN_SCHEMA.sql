-- =====================================================
-- LOAN SCHEMA DIAGNOSTIC
-- =====================================================
-- Run this to check if your loans table has all required columns
-- =====================================================

-- Check 1: List all columns in loans table
SELECT 
  '=== LOANS TABLE COLUMNS ===' as check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- Check 2: Verify critical columns exist
SELECT 
  '=== CRITICAL COLUMNS CHECK ===' as check_name,
  column_name,
  CASE 
    WHEN column_name IN (
      'id', 'organization_id', 'client_id', 'loan_product_id',
      'amount', 'interest_rate', 'term_months', 'purpose', 'status',
      'application_date', 'total_payable', 'monthly_payment', 'balance',
      'principal_paid', 'interest_paid', 'payment_method',
      'guarantor_required', 'collateral_required'
    ) 
    THEN '✅ REQUIRED' 
    ELSE '⚪ OPTIONAL' 
  END as importance
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
ORDER BY 
  CASE 
    WHEN column_name IN (
      'id', 'organization_id', 'client_id', 'loan_product_id',
      'amount', 'interest_rate', 'term_months', 'purpose', 'status',
      'application_date', 'total_payable', 'monthly_payment', 'balance',
      'principal_paid', 'interest_paid', 'payment_method',
      'guarantor_required', 'collateral_required'
    ) 
    THEN 0
    ELSE 1 
  END,
  column_name;

-- Check 3: Missing columns report
WITH required_columns AS (
  SELECT unnest(ARRAY[
    'id', 'loan_number', 'organization_id', 'client_id', 'loan_product_id',
    'amount', 'interest_rate', 'term_months', 'purpose', 'status',
    'application_date', 'approval_date', 'disbursement_date', 'first_payment_date',
    'total_payable', 'monthly_payment', 'balance',
    'principal_paid', 'interest_paid', 'payment_method',
    'guarantor_required', 'collateral_required',
    'created_at', 'updated_at'
  ]) AS required_column
),
existing_columns AS (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'loans'
)
SELECT 
  '=== MISSING COLUMNS ===' as check_name,
  required_column,
  CASE 
    WHEN EXISTS (SELECT 1 FROM existing_columns WHERE column_name = required_column)
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM required_columns
ORDER BY 
  CASE 
    WHEN EXISTS (SELECT 1 FROM existing_columns e WHERE e.column_name = required_columns.required_column)
    THEN 1
    ELSE 0
  END,
  required_column;

-- Check 4: Test data query (should work if schema is correct)
SELECT 
  '=== DATA TEST ===' as check_name,
  COUNT(*) as total_loans,
  COUNT(DISTINCT organization_id) as organizations,
  COUNT(DISTINCT client_id) as unique_clients,
  COALESCE(SUM(amount), 0) as total_loan_amount,
  COALESCE(AVG(amount), 0) as average_loan_amount,
  COUNT(loan_number) as loans_with_numbers,
  COUNT(*) - COUNT(loan_number) as loans_without_numbers
FROM loans;

-- Check 5: Sample loan data
SELECT 
  '=== SAMPLE LOANS ===' as check_name,
  id,
  loan_number,
  amount,
  term_months,
  status,
  application_date,
  created_at
FROM loans
ORDER BY created_at DESC
LIMIT 5;

-- Check 6: Foreign key relationships
SELECT 
  '=== FOREIGN KEYS ===' as check_name,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'loans';

-- Check 7: Indexes
SELECT 
  '=== INDEXES ===' as check_name,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'loans'
ORDER BY indexname;

-- =====================================================
-- INTERPRETATION GUIDE
-- =====================================================
-- 
-- ✅ All columns marked '✅ EXISTS' = Good
-- ❌ Any columns marked '❌ MISSING' = Problem
--
-- If 'loan_number' is MISSING:
--   → Run /FIX_LOAN_CREATION_SCHEMA.sql
--
-- If 'amount' shows as EXISTS but you still get errors:
--   → Schema cache issue! Refresh it:
--      1. Dashboard → API → Refresh schema cache
--      2. OR restart your Supabase project
--
-- If foreign keys are missing:
--   → Run /supabase-migration.sql to recreate schema
--
-- =====================================================
