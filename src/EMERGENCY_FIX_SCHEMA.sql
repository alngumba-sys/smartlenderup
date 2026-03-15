-- 🚨 EMERGENCY SCHEMA FIX FOR LOANS TABLE
-- Run this ENTIRE script in your Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════════════
-- STEP 1: Check what columns actually exist
-- ═══════════════════════════════════════════════════════════════════

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- ⚠️ LOOK AT THE OUTPUT ABOVE! 
-- If you DON'T see 'duration_months', 'monthly_installment', etc., then proceed to STEP 2

-- ═══════════════════════════════════════════════════════════════════
-- STEP 2: Add ALL missing columns (safe - won't break if they exist)
-- ═══════════════════════════════════════════════════════════════════

-- Add duration_months (THIS IS THE ONE FAILING!)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'duration_months'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN duration_months INTEGER;
    RAISE NOTICE '✅ Added duration_months column';
  ELSE
    RAISE NOTICE 'ℹ️ duration_months already exists';
  END IF;
END $$;

-- Add monthly_installment
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'monthly_installment'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN monthly_installment DECIMAL(15,2);
    RAISE NOTICE '✅ Added monthly_installment column';
  ELSE
    RAISE NOTICE 'ℹ️ monthly_installment already exists';
  END IF;
END $$;

-- Add outstanding_balance
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'outstanding_balance'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN outstanding_balance DECIMAL(15,2);
    RAISE NOTICE '✅ Added outstanding_balance column';
  ELSE
    RAISE NOTICE 'ℹ️ outstanding_balance already exists';
  END IF;
END $$;

-- Add paid_amount
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'paid_amount'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN paid_amount DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added paid_amount column';
  ELSE
    RAISE NOTICE 'ℹ️ paid_amount already exists';
  END IF;
END $$;

-- Add total_amount
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN total_amount DECIMAL(15,2);
    RAISE NOTICE '✅ Added total_amount column';
  ELSE
    RAISE NOTICE 'ℹ️ total_amount already exists';
  END IF;
END $$;

-- Add disbursed_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'disbursed_at'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursed_at DATE;
    RAISE NOTICE '✅ Added disbursed_at column';
  ELSE
    RAISE NOTICE 'ℹ️ disbursed_at already exists';
  END IF;
END $$;

-- Add first_payment_date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'first_payment_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN first_payment_date DATE;
    RAISE NOTICE '✅ Added first_payment_date column';
  ELSE
    RAISE NOTICE 'ℹ️ first_payment_date already exists';
  END IF;
END $$;

-- Add maturity_date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'maturity_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN maturity_date DATE;
    RAISE NOTICE '✅ Added maturity_date column';
  ELSE
    RAISE NOTICE 'ℹ️ maturity_date already exists';
  END IF;
END $$;

-- Add disbursement_method
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'disbursement_method'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursement_method VARCHAR(50);
    RAISE NOTICE '✅ Added disbursement_method column';
  ELSE
    RAISE NOTICE 'ℹ️ disbursement_method already exists';
  END IF;
END $$;

-- Add disbursement_reference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'disbursement_reference'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursement_reference VARCHAR(100);
    RAISE NOTICE '✅ Added disbursement_reference column';
  ELSE
    RAISE NOTICE 'ℹ️ disbursement_reference already exists';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- STEP 3: Grant permissions to authenticated and anon users
-- ═══════════════════════════════════════════════════════════════════

GRANT ALL ON public.loans TO authenticated;
GRANT ALL ON public.loans TO anon;
GRANT ALL ON public.loans TO service_role;

-- ═══════════════════════════════════════════════════════════════════
-- STEP 4: FORCE PostgREST to reload schema cache
-- ═══════════════════════════════════════════════════════════════════

NOTIFY pgrst, 'reload schema';

-- ⏱️ IMPORTANT: Wait 60-90 seconds after running this script before testing!

-- ═══════════════════════════════════════════════════════════════════
-- STEP 5: Verify the columns now exist
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
  AND column_name IN (
    'duration_months',
    'monthly_installment',
    'outstanding_balance',
    'paid_amount',
    'total_amount',
    'disbursed_at',
    'first_payment_date',
    'maturity_date',
    'disbursement_method',
    'disbursement_reference'
  )
ORDER BY column_name;

-- ✅ You should see ALL 10 columns above!

-- ═══════════════════════════════════════════════════════════════════
-- STEP 6: Test with a simple query
-- ═══════════════════════════════════════════════════════════════════

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND table_schema = 'public'
ORDER BY column_name;

-- ═══════════════════════════════════════════════════════════════════
-- 🎯 NEXT STEPS AFTER RUNNING THIS:
-- ═══════════════════════════════════════════════════════════════════
-- 1. ⏱️ WAIT 60-90 SECONDS (set a timer!)
-- 2. Refresh your browser (hard refresh: Ctrl+Shift+R)
-- 3. Try creating a loan again
-- 4. If it STILL fails, go to Supabase Dashboard → Settings → API → "Reload schema cache"
-- 5. Wait another 60 seconds
-- 6. Try again
-- ═══════════════════════════════════════════════════════════════════
