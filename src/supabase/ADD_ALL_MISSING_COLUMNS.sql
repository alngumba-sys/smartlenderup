-- ============================================
-- ADD ALL MISSING COLUMNS TO LOANS TABLE
-- ============================================
-- This script adds every column the app needs
-- ============================================

-- First, let's see what columns we currently have
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count 
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'loans';
  
  RAISE NOTICE '📊 Current loans table has % columns', col_count;
END $$;

-- ============================================
-- Add ALL missing columns one by one
-- ============================================

-- Add duration_months
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'duration_months'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN duration_months INTEGER;
    RAISE NOTICE '✅ Added duration_months';
  ELSE
    RAISE NOTICE 'ℹ️  duration_months already exists';
  END IF;
END $$;

-- Add interest_amount
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'interest_amount'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN interest_amount DECIMAL(15,2);
    RAISE NOTICE '✅ Added interest_amount';
  ELSE
    RAISE NOTICE 'ℹ️  interest_amount already exists';
  END IF;
END $$;

-- Add total_amount
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN total_amount DECIMAL(15,2);
    RAISE NOTICE '✅ Added total_amount';
  ELSE
    RAISE NOTICE 'ℹ️  total_amount already exists';
  END IF;
END $$;

-- Add monthly_installment
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'monthly_installment'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN monthly_installment DECIMAL(15,2);
    RAISE NOTICE '✅ Added monthly_installment';
  ELSE
    RAISE NOTICE 'ℹ️  monthly_installment already exists';
  END IF;
END $$;

-- Add outstanding_principal (if not already added)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'outstanding_principal'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN outstanding_principal DECIMAL(15,2);
    RAISE NOTICE '✅ Added outstanding_principal';
  ELSE
    RAISE NOTICE 'ℹ️  outstanding_principal already exists';
  END IF;
END $$;

-- Add application_date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'application_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN application_date TIMESTAMPTZ;
    RAISE NOTICE '✅ Added application_date';
  ELSE
    RAISE NOTICE 'ℹ️  application_date already exists';
  END IF;
END $$;

-- Add disbursement_date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'disbursement_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursement_date TIMESTAMPTZ;
    RAISE NOTICE '✅ Added disbursement_date';
  ELSE
    RAISE NOTICE 'ℹ️  disbursement_date already exists';
  END IF;
END $$;

-- Add first_repayment_date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'first_repayment_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN first_repayment_date TIMESTAMPTZ;
    RAISE NOTICE '✅ Added first_repayment_date';
  ELSE
    RAISE NOTICE 'ℹ️  first_repayment_date already exists';
  END IF;
END $$;

-- Add purpose
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'purpose'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN purpose TEXT;
    RAISE NOTICE '✅ Added purpose';
  ELSE
    RAISE NOTICE 'ℹ️  purpose already exists';
  END IF;
END $$;

-- Add notes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN notes TEXT;
    RAISE NOTICE '✅ Added notes';
  ELSE
    RAISE NOTICE 'ℹ️  notes already exists';
  END IF;
END $$;

-- Add organization_code (if not already added)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'organization_code'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN organization_code TEXT;
    RAISE NOTICE '✅ Added organization_code';
  ELSE
    RAISE NOTICE 'ℹ️  organization_code already exists';
  END IF;
END $$;

-- ============================================
-- Update existing loans with calculated values
-- ============================================

-- Set duration_months from existing data if it has a different column name
DO $$
BEGIN
  -- If loans have term_period or term, copy it to duration_months
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'term_period') THEN
    UPDATE public.loans SET duration_months = term_period WHERE duration_months IS NULL AND term_period IS NOT NULL;
    RAISE NOTICE '✅ Copied term_period to duration_months';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'term') THEN
    UPDATE public.loans SET duration_months = term WHERE duration_months IS NULL AND term IS NOT NULL;
    RAISE NOTICE '✅ Copied term to duration_months';
  END IF;
END $$;

-- Calculate missing financial values
UPDATE public.loans 
SET 
  interest_amount = CASE 
    WHEN interest_amount IS NULL AND principal_amount IS NOT NULL AND interest_rate IS NOT NULL AND duration_months IS NOT NULL
    THEN (principal_amount * interest_rate * duration_months) / 100
    ELSE interest_amount
  END,
  total_amount = CASE 
    WHEN total_amount IS NULL AND principal_amount IS NOT NULL AND interest_amount IS NOT NULL
    THEN principal_amount + interest_amount
    WHEN total_amount IS NULL AND principal_amount IS NOT NULL AND interest_rate IS NOT NULL AND duration_months IS NOT NULL
    THEN principal_amount + ((principal_amount * interest_rate * duration_months) / 100)
    ELSE total_amount
  END,
  outstanding_principal = CASE
    WHEN outstanding_principal IS NULL THEN COALESCE(principal_amount, 0)
    ELSE outstanding_principal
  END
WHERE principal_amount IS NOT NULL;

-- Calculate monthly_installment after total_amount is set
UPDATE public.loans 
SET monthly_installment = CASE
  WHEN monthly_installment IS NULL AND total_amount IS NOT NULL AND duration_months IS NOT NULL AND duration_months > 0
  THEN total_amount / duration_months
  ELSE monthly_installment
END
WHERE total_amount IS NOT NULL AND duration_months IS NOT NULL;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
DECLARE
  col_count INTEGER;
  loan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count 
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'loans';
  
  SELECT COUNT(*) INTO loan_count FROM public.loans;
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════╗';
  RAISE NOTICE '║   ✅ ALL COLUMNS ADDED SUCCESSFULLY! ✅           ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Loans table now has % columns', col_count;
  RAISE NOTICE '📁 Total loans in database: %', loan_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ New columns added:';
  RAISE NOTICE '   • duration_months';
  RAISE NOTICE '   • interest_amount';
  RAISE NOTICE '   • total_amount';
  RAISE NOTICE '   • monthly_installment';
  RAISE NOTICE '   • outstanding_principal';
  RAISE NOTICE '   • application_date';
  RAISE NOTICE '   • disbursement_date';
  RAISE NOTICE '   • first_repayment_date';
  RAISE NOTICE '   • purpose';
  RAISE NOTICE '   • notes';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SUCCESS! You can now create loans!';
  RAISE NOTICE '   👉 Refresh your browser (F5)';
  RAISE NOTICE '   👉 Try creating a loan again';
  RAISE NOTICE '';
END $$;
