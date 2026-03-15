-- ═══════════════════════════════════════════════════════════════════
-- 🔧 ADD ALL MISSING COLUMNS TO LOANS TABLE
-- ═══════════════════════════════════════════════════════════════════
-- This will add any missing columns that your app needs
-- Safe to run multiple times - uses "IF NOT EXISTS" logic
-- ═══════════════════════════════════════════════════════════════════

-- First, let's check what columns exist
DO $$ 
BEGIN
  RAISE NOTICE '🔍 Checking loans table schema...';
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- ADD MISSING COLUMNS (Safe - won't error if column already exists)
-- ═══════════════════════════════════════════════════════════════════

-- Add duration_months (CRITICAL - this is the one causing the error!)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'duration_months'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN duration_months INTEGER;
    RAISE NOTICE '✅ Added duration_months column';
  ELSE
    RAISE NOTICE '⚪ duration_months already exists';
  END IF;
END $$;

-- Add interest_rate (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'interest_rate'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN interest_rate DECIMAL(5,2);
    RAISE NOTICE '✅ Added interest_rate column';
  ELSE
    RAISE NOTICE '⚪ interest_rate already exists';
  END IF;
END $$;

-- Add monthly_installment (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'monthly_installment'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN monthly_installment DECIMAL(15,2);
    RAISE NOTICE '✅ Added monthly_installment column';
  ELSE
    RAISE NOTICE '⚪ monthly_installment already exists';
  END IF;
END $$;

-- Add processing_fee (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'processing_fee'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN processing_fee DECIMAL(15,2);
    RAISE NOTICE '✅ Added processing_fee column';
  ELSE
    RAISE NOTICE '⚪ processing_fee already exists';
  END IF;
END $$;

-- Add disbursement_method (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'disbursement_method'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursement_method TEXT;
    RAISE NOTICE '✅ Added disbursement_method column';
  ELSE
    RAISE NOTICE '⚪ disbursement_method already exists';
  END IF;
END $$;

-- Add disbursement_reference (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'disbursement_reference'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursement_reference TEXT;
    RAISE NOTICE '✅ Added disbursement_reference column';
  ELSE
    RAISE NOTICE '⚪ disbursement_reference already exists';
  END IF;
END $$;

-- Add approval_stage (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'approval_stage'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN approval_stage TEXT;
    RAISE NOTICE '✅ Added approval_stage column';
  ELSE
    RAISE NOTICE '⚪ approval_stage already exists';
  END IF;
END $$;

-- Add current_approver_role_id (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'current_approver_role_id'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN current_approver_role_id UUID;
    RAISE NOTICE '✅ Added current_approver_role_id column';
  ELSE
    RAISE NOTICE '⚪ current_approver_role_id already exists';
  END IF;
END $$;

-- Add first_payment_date (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'first_payment_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN first_payment_date DATE;
    RAISE NOTICE '✅ Added first_payment_date column';
  ELSE
    RAISE NOTICE '⚪ first_payment_date already exists';
  END IF;
END $$;

-- Add maturity_date (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'maturity_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN maturity_date DATE;
    RAISE NOTICE '✅ Added maturity_date column';
  ELSE
    RAISE NOTICE '⚪ maturity_date already exists';
  END IF;
END $$;

-- Add disbursed_at (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'disbursed_at'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursed_at DATE;
    RAISE NOTICE '✅ Added disbursed_at column';
  ELSE
    RAISE NOTICE '⚪ disbursed_at already exists';
  END IF;
END $$;

-- Add purpose (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'purpose'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN purpose TEXT;
    RAISE NOTICE '✅ Added purpose column';
  ELSE
    RAISE NOTICE '⚪ purpose already exists';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- VERIFY: Check that duration_months now exists
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'loans'
        AND column_name = 'duration_months'
    ) THEN '✅ duration_months NOW EXISTS!'
    ELSE '❌ duration_months STILL MISSING (something went wrong)'
  END as verification_status;

-- ═══════════════════════════════════════════════════════════════════
-- SUMMARY: Show all columns after migration
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  column_name,
  data_type,
  is_nullable,
  '✅' as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY column_name;

-- ═══════════════════════════════════════════════════════════════════
-- 📋 INSTRUCTIONS:
-- ═══════════════════════════════════════════════════════════════════
-- 1. Copy this ENTIRE file
-- 2. Paste in Supabase SQL Editor
-- 3. Click "RUN"
-- 4. Check the NOTICES section - you'll see:
--    ✅ Added duration_months column
--    ✅ Added [other columns]
--    ⚪ [column] already exists (for columns that were there)
-- 
-- 5. Check the final result set showing all columns
-- 6. You should see "✅ duration_months NOW EXISTS!" in verification
-- 
-- 7. After this runs successfully:
--    - NO NEED TO WAIT
--    - NO NEED TO RELOAD SCHEMA
--    - Just refresh your browser and try creating a loan!
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- 🎉 AFTER RUNNING THIS:
-- ═══════════════════════════════════════════════════════════════════
-- ✅ All missing columns will be added
-- ✅ Loan creation will work immediately
-- ✅ No more "column does not exist" errors!
-- ═══════════════════════════════════════════════════════════════════
