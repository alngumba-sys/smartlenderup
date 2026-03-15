-- ============================================
-- VERIFY AND FIX SUPABASE SCHEMA CACHE ISSUE
-- ============================================
-- Run these queries in your Supabase SQL Editor to diagnose and fix the PGRST204 error

-- STEP 1: Check if the problematic columns exist in your loans table
-- Run this query to see what columns actually exist:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- STEP 2: If the columns DON'T exist, add them:
-- Only run this if the columns are missing from Step 1

ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS disbursement_method TEXT CHECK (disbursement_method IN ('mpesa', 'bank_transfer', 'cash', 'cheque')),
  ADD COLUMN IF NOT EXISTS disbursement_reference TEXT,
  ADD COLUMN IF NOT EXISTS first_payment_date DATE,
  ADD COLUMN IF NOT EXISTS maturity_date DATE;

-- STEP 3: After adding columns (or if they already exist), REFRESH THE SCHEMA CACHE
-- Option A: Using SQL (recommended)
NOTIFY pgrst, 'reload schema';

-- Option B: Using Supabase Dashboard
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Settings → API
-- 3. Click "Reload schema cache" button
-- 4. Wait 30-60 seconds for the cache to refresh

-- STEP 4: Verify the columns are now recognized
-- Run this to confirm all loan table columns:
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
  AND column_name IN (
    'disbursed_at',
    'disbursement_method',
    'disbursement_reference',
    'first_payment_date',
    'maturity_date'
  );

-- Expected result: All 5 columns should be listed
-- If you see all 5 columns, the schema is correct and cache should be refreshed

-- ============================================
-- ALTERNATIVE: If you want to completely recreate the loans table
-- ⚠️ WARNING: This will DELETE ALL existing loans data!
-- Only use this on a fresh/test database
-- ============================================

/*
-- Uncomment this section if you want to start fresh:

DROP TABLE IF EXISTS public.loan_guarantors CASCADE;
DROP TABLE IF EXISTS public.loan_collateral CASCADE;
DROP TABLE IF EXISTS public.repayments CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;

-- Then run the full schema from /supabase/schema.sql
*/

-- ============================================
-- AFTER FIXING THE SCHEMA
-- ============================================
-- Once the schema cache is refreshed, go back to the code and:
-- 1. Uncomment the date fields in /services/supabaseDataService.ts (around lines 1057-1079)
-- 2. Save the file to apply changes
-- 3. Try creating a loan again
