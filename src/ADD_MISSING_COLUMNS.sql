-- ============================================
-- ADD MISSING COLUMNS TO LOANS TABLE
-- ============================================
-- This script adds the 8 missing columns that were found in the schema check
-- Run this in your Supabase SQL Editor

-- Add the missing columns to the loans table
ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS duration_months INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS monthly_installment DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outstanding_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS principal_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disbursement_method TEXT CHECK (disbursement_method IN ('mpesa', 'bank_transfer', 'cash', 'cheque')),
  ADD COLUMN IF NOT EXISTS disbursement_reference TEXT;

-- Remove the default constraints after adding the columns
-- (We only needed them for existing rows)
ALTER TABLE public.loans
  ALTER COLUMN duration_months DROP DEFAULT,
  ALTER COLUMN monthly_installment DROP DEFAULT,
  ALTER COLUMN outstanding_balance DROP DEFAULT,
  ALTER COLUMN principal_amount DROP DEFAULT,
  ALTER COLUMN total_amount DROP DEFAULT;

-- Refresh the schema cache so Supabase recognizes the new columns
NOTIFY pgrst, 'reload schema';

-- Verify the columns were added successfully
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
  AND column_name IN (
    'duration_months',
    'monthly_installment',
    'outstanding_balance',
    'paid_amount',
    'principal_amount',
    'total_amount',
    'disbursement_method',
    'disbursement_reference'
  )
ORDER BY column_name;

-- Expected result: You should see all 8 columns listed
-- If you see all 8, the migration was successful!

-- ============================================
-- WHAT THIS DOES:
-- ============================================
-- 1. Adds 8 missing columns to your loans table
-- 2. Uses temporary defaults for existing rows (if any)
-- 3. Removes the defaults so new rows require proper values
-- 4. Refreshes Supabase's schema cache
-- 5. Verifies the columns were added

-- ============================================
-- AFTER RUNNING THIS:
-- ============================================
-- 1. Wait 60 seconds for schema cache to refresh
-- 2. Try creating a loan in the app
-- 3. It should work now!
