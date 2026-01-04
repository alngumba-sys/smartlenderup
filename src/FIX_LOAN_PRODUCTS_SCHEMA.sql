-- =========================================
-- FIX LOAN PRODUCTS TABLE SCHEMA
-- =========================================
--
-- This script adds all missing columns to the loan_products table
-- to match what the application code expects.
--
-- Run this in Supabase SQL Editor!
-- =========================================

BEGIN;

-- =====================================
-- 1. ADD MISSING COLUMNS
-- =====================================

-- Add late_payment_penalty column (if not exists)
ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS late_payment_penalty NUMERIC(5, 2) DEFAULT 0;

-- Add term_unit column (if not exists)
ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS term_unit TEXT DEFAULT 'Months';

-- Add repayment_frequency column (if not exists)
ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS repayment_frequency TEXT DEFAULT 'Monthly';

-- Add require_collateral column (if not exists) - alias for collateral_required
ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS require_collateral BOOLEAN DEFAULT false;

-- Add require_guarantor column (if not exists) - alias for guarantor_required
ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS require_guarantor BOOLEAN DEFAULT false;

-- Add product_code column (if not exists)
ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS product_code TEXT;

-- Add product_name column (if not exists) - alias for name
ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS product_name TEXT;

RAISE NOTICE '✅ Missing columns added';

-- =====================================
-- 2. SYNC EXISTING DATA
-- =====================================

-- Copy collateral_required to require_collateral
UPDATE public.loan_products 
SET require_collateral = collateral_required 
WHERE require_collateral IS NULL;

-- Copy guarantor_required to require_guarantor
UPDATE public.loan_products 
SET require_guarantor = guarantor_required 
WHERE require_guarantor IS NULL;

-- Copy name to product_name
UPDATE public.loan_products 
SET product_name = name 
WHERE product_name IS NULL;

-- Copy late_payment_penalty_percentage to late_payment_penalty (if that column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' 
    AND column_name = 'late_payment_penalty_percentage'
  ) THEN
    UPDATE public.loan_products 
    SET late_payment_penalty = late_payment_penalty_percentage 
    WHERE late_payment_penalty IS NULL;
  END IF;
END $$;

RAISE NOTICE '✅ Data synced between columns';

-- =====================================
-- 3. MAKE COLUMNS NULLABLE (for flexibility)
-- =====================================

-- Make organization_id nullable (some products might be templates)
ALTER TABLE public.loan_products 
  ALTER COLUMN organization_id DROP NOT NULL;

RAISE NOTICE '✅ Columns made flexible';

-- =====================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================

-- Index on product_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_loan_products_code 
ON public.loan_products(product_code);

-- Index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_loan_products_status 
ON public.loan_products(status);

-- Index on organization_id for faster org queries
CREATE INDEX IF NOT EXISTS idx_loan_products_org 
ON public.loan_products(organization_id);

RAISE NOTICE '✅ Indexes created';

COMMIT;

-- =====================================
-- SUCCESS MESSAGE
-- =====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                       ║';
  RAISE NOTICE '║  ✅  LOAN PRODUCTS TABLE FIXED SUCCESSFULLY!         ║';
  RAISE NOTICE '║                                                       ║';
  RAISE NOTICE '║  Added columns:                                      ║';
  RAISE NOTICE '║  • late_payment_penalty                              ║';
  RAISE NOTICE '║  • term_unit                                         ║';
  RAISE NOTICE '║  • repayment_frequency                               ║';
  RAISE NOTICE '║  • require_collateral                                ║';
  RAISE NOTICE '║  • require_guarantor                                 ║';
  RAISE NOTICE '║  • product_code                                      ║';
  RAISE NOTICE '║  • product_name                                      ║';
  RAISE NOTICE '║                                                       ║';
  RAISE NOTICE '║  🎯 You can now create loan products!                ║';
  RAISE NOTICE '║                                                       ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- =====================================
-- SHOW UPDATED SCHEMA
-- =====================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;
