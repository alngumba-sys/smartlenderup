-- ============================================================================
-- SUPABASE SCHEMA CACHE FIX FOR LOAN CREATION
-- ============================================================================
-- This file helps diagnose and fix the PGRST204 error: 
-- "Could not find the 'disbursed_at' column of 'loans' in the schema cache"
--
-- PROBLEM:
-- The code is using correct column names from schema.sql, but Supabase's
-- schema cache is out of sync with the actual database structure.
--
-- SOLUTION:
-- Run this in Supabase SQL Editor to refresh the schema and verify columns
-- ============================================================================

-- STEP 1: Verify the loans table columns exist
-- This query shows ALL columns in the loans table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- STEP 2: Verify the EXACT columns we're trying to use
-- These are the columns the loan creation code is sending
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
  AND column_name IN (
    'id',
    'organization_id',
    'client_id',
    'principal_amount',
    'interest_rate',
    'duration_months',      -- ✅ CORRECT (was incorrectly using 'loan_term')
    'status',
    'total_amount',
    'monthly_installment',  -- ✅ CORRECT (was incorrectly using 'monthly_repayment')
    'outstanding_balance',  -- ✅ CORRECT (was incorrectly using 'total_outstanding')
    'paid_amount',          -- ✅ CORRECT (was incorrectly using 'total_paid')
    'loan_number',
    'loan_product_id',
    'purpose',
    'processing_fee',
    'insurance_fee',
    'loan_officer_id',
    'application_date',
    'disbursed_at',         -- ✅ This column EXISTS - the error is a cache issue
    'first_payment_date',
    'maturity_date',
    'notes',
    'disbursement_method',
    'disbursement_reference'
  );

-- STEP 3: Refresh the schema cache (IMPORTANT!)
-- After running this, go to Supabase Dashboard → API → Refresh Schema Cache
-- OR just restart your Supabase project

-- STEP 4: Grant permissions (if needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- All the columns listed above should appear in the query results.
-- If any column is MISSING, you need to add it to your database.
-- If all columns exist but you still get PGRST204 errors:
--   1. Refresh schema cache in Supabase Dashboard
--   2. Wait 30 seconds
--   3. Try loan creation again
-- ============================================================================

-- STEP 5: Test insert with minimal data
-- This tests if a basic insert works (remove the -- to run)
/*
INSERT INTO public.loans (
  id,
  loan_number,
  client_id,
  organization_id,
  principal_amount,
  interest_rate,
  duration_months,
  total_amount,
  monthly_installment,
  outstanding_balance,
  paid_amount,
  status
) VALUES (
  gen_random_uuid(),
  'TEST-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS'),
  (SELECT id FROM public.clients LIMIT 1), -- Use first client
  (SELECT id FROM public.organizations LIMIT 1), -- Use first org
  10000.00,
  7.5,
  12,
  19000.00,
  1583.33,
  19000.00,
  0,
  'pending'
) RETURNING *;
*/
