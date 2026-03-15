-- =====================================================
-- CHECK AND ADD MISSING LOAN COLUMNS
-- =====================================================
-- This script checks what columns exist and adds missing ones
-- =====================================================

-- STEP 1: Check what columns currently exist in your loans table
SELECT 
  '📊 CURRENT LOANS TABLE COLUMNS:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- STEP 2: Add missing columns (if they don't exist)
-- These columns are used by the application but may be missing in your database

-- Add loan_number if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'loan_number'
  ) THEN
    ALTER TABLE loans ADD COLUMN loan_number TEXT;
    RAISE NOTICE '✅ Added loan_number column';
  ELSE
    RAISE NOTICE 'ℹ️  loan_number column already exists';
  END IF;
END $$;

-- Add loan_officer_id if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'loan_officer_id'
  ) THEN
    ALTER TABLE loans ADD COLUMN loan_officer_id UUID REFERENCES users(id);
    RAISE NOTICE '✅ Added loan_officer_id column';
  ELSE
    RAISE NOTICE 'ℹ️  loan_officer_id column already exists';
  END IF;
END $$;

-- Add disbursement_reference if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'disbursement_reference'
  ) THEN
    ALTER TABLE loans ADD COLUMN disbursement_reference TEXT;
    RAISE NOTICE '✅ Added disbursement_reference column';
  ELSE
    RAISE NOTICE 'ℹ️  disbursement_reference column already exists';
  END IF;
END $$;

-- Add disbursement_method if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'disbursement_method'
  ) THEN
    ALTER TABLE loans ADD COLUMN disbursement_method TEXT;
    RAISE NOTICE '✅ Added disbursement_method column';
  ELSE
    RAISE NOTICE 'ℹ️  disbursement_method column already exists';
  END IF;
END $$;

-- Add first_payment_date if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'first_payment_date'
  ) THEN
    ALTER TABLE loans ADD COLUMN first_payment_date DATE;
    RAISE NOTICE '✅ Added first_payment_date column';
  ELSE
    RAISE NOTICE 'ℹ️  first_payment_date column already exists';
  END IF;
END $$;

-- Add maturity_date if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'maturity_date'
  ) THEN
    ALTER TABLE loans ADD COLUMN maturity_date DATE;
    RAISE NOTICE '✅ Added maturity_date column';
  ELSE
    RAISE NOTICE 'ℹ️  maturity_date column already exists';
  END IF;
END $$;

-- Add days_in_arrears if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'days_in_arrears'
  ) THEN
    ALTER TABLE loans ADD COLUMN days_in_arrears INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added days_in_arrears column';
  ELSE
    RAISE NOTICE 'ℹ️  days_in_arrears column already exists';
  END IF;
END $$;

-- Add approved_by if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE loans ADD COLUMN approved_by UUID REFERENCES users(id);
    RAISE NOTICE '✅ Added approved_by column';
  ELSE
    RAISE NOTICE 'ℹ️  approved_by column already exists';
  END IF;
END $$;

-- Add approved_at if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE loans ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✅ Added approved_at column';
  ELSE
    RAISE NOTICE 'ℹ️  approved_at column already exists';
  END IF;
END $$;

-- Add disbursed_by if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'disbursed_by'
  ) THEN
    ALTER TABLE loans ADD COLUMN disbursed_by UUID REFERENCES users(id);
    RAISE NOTICE '✅ Added disbursed_by column';
  ELSE
    RAISE NOTICE 'ℹ️  disbursed_by column already exists';
  END IF;
END $$;

-- Add disbursed_at if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'disbursed_at'
  ) THEN
    ALTER TABLE loans ADD COLUMN disbursed_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✅ Added disbursed_at column';
  ELSE
    RAISE NOTICE 'ℹ️  disbursed_at column already exists';
  END IF;
END $$;

-- Add reviewed_by if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE loans ADD COLUMN reviewed_by UUID REFERENCES users(id);
    RAISE NOTICE '✅ Added reviewed_by column';
  ELSE
    RAISE NOTICE 'ℹ️  reviewed_by column already exists';
  END IF;
END $$;

-- Add reviewed_at if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE loans ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✅ Added reviewed_at column';
  ELSE
    RAISE NOTICE 'ℹ️  reviewed_at column already exists';
  END IF;
END $$;

-- STEP 3: Verify all columns now exist
SELECT 
  '✅ FINAL VERIFICATION - All columns:' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- STEP 4: After running this, REFRESH SUPABASE SCHEMA CACHE:
-- Go to Supabase Dashboard → API → Click "Refresh schema cache"

SELECT '🎯 IMPORTANT: Go to Supabase Dashboard → API → Refresh Schema Cache' as reminder;
