-- ============================================
-- CHECK YOUR ACTUAL SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this in your Supabase SQL Editor to see what columns actually exist

-- STEP 1: Check if the loans table exists at all
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'loans'
) AS loans_table_exists;

-- STEP 2: List ALL columns in your loans table (if it exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- STEP 3: Check specifically for the columns we're trying to use
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'duration_months') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS duration_months,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'monthly_installment') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS monthly_installment,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'outstanding_balance') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS outstanding_balance,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'paid_amount') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS paid_amount,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'disbursed_at') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS disbursed_at,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'first_payment_date') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS first_payment_date,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'maturity_date') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS maturity_date,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'principal_amount') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS principal_amount,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'interest_rate') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS interest_rate,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'total_amount') THEN '✅ EXISTS' ELSE '❌ MISSING' END AS total_amount;

-- ============================================
-- IF YOUR LOANS TABLE IS COMPLETELY DIFFERENT OR MISSING
-- ============================================
-- You have two options:

-- OPTION 1: Create the table with the correct schema (if it doesn't exist)
-- Copy and run the entire schema from /supabase/schema.sql

-- OPTION 2: Refresh schema cache (if columns exist but cache is stale)
NOTIFY pgrst, 'reload schema';

-- ============================================
-- COMMON SCENARIOS AND SOLUTIONS
-- ============================================

-- Scenario A: Table doesn't exist
-- → Run the full /supabase/schema.sql in your Supabase SQL Editor

-- Scenario B: Table exists but with different column names
-- → Check STEP 2 output above to see actual column names
-- → We need to modify the code to match YOUR actual schema

-- Scenario C: Table has correct columns but cache is stale
-- → Run: NOTIFY pgrst, 'reload schema';
-- → Wait 30-60 seconds and try again
