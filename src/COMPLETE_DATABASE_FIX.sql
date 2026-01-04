-- =========================================
-- COMPLETE DATABASE FIX
-- =========================================
--
-- This script fixes ALL database issues in one go:
-- 1. Clients table constraints
-- 2. Loan products missing columns
-- 3. General schema improvements
--
-- 🚀 Run this ONCE in Supabase SQL Editor!
-- =========================================

BEGIN;

RAISE NOTICE '';
RAISE NOTICE '🚀 Starting complete database fix...';
RAISE NOTICE '';

-- =====================================
-- PART 1: FIX CLIENTS TABLE
-- =====================================

RAISE NOTICE '📋 Fixing clients table...';

-- Drop CHECK constraints
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_gender_check;

ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_marital_status_check;

-- Drop FOREIGN KEY constraints
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_user_id_fkey;

-- Make columns nullable
ALTER TABLE public.clients 
  ALTER COLUMN gender DROP NOT NULL;

ALTER TABLE public.clients 
  ALTER COLUMN marital_status DROP NOT NULL;

ALTER TABLE public.clients 
  ALTER COLUMN user_id DROP NOT NULL;

RAISE NOTICE '✅ Clients table fixed';

-- =====================================
-- PART 2: FIX LOAN PRODUCTS TABLE
-- =====================================

RAISE NOTICE '📋 Fixing loan_products table...';

-- Add missing columns
ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS late_payment_penalty NUMERIC(5, 2) DEFAULT 0;

ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS term_unit TEXT DEFAULT 'Months';

ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS repayment_frequency TEXT DEFAULT 'Monthly';

ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS require_collateral BOOLEAN DEFAULT false;

ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS require_guarantor BOOLEAN DEFAULT false;

ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS product_code TEXT;

ALTER TABLE public.loan_products 
  ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Sync existing data
UPDATE public.loan_products 
SET require_collateral = collateral_required 
WHERE require_collateral IS NULL;

UPDATE public.loan_products 
SET require_guarantor = guarantor_required 
WHERE require_guarantor IS NULL;

UPDATE public.loan_products 
SET product_name = name 
WHERE product_name IS NULL;

-- Copy late_payment_penalty_percentage if it exists
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
    RAISE NOTICE '  ↳ Synced late_payment_penalty from late_payment_penalty_percentage';
  END IF;
END $$;

-- Make organization_id nullable
ALTER TABLE public.loan_products 
  ALTER COLUMN organization_id DROP NOT NULL;

RAISE NOTICE '✅ Loan products table fixed';

-- =====================================
-- PART 3: CREATE INDEXES
-- =====================================

RAISE NOTICE '📋 Creating indexes...';

-- Loan products indexes
CREATE INDEX IF NOT EXISTS idx_loan_products_code 
ON public.loan_products(product_code);

CREATE INDEX IF NOT EXISTS idx_loan_products_status 
ON public.loan_products(status);

CREATE INDEX IF NOT EXISTS idx_loan_products_org 
ON public.loan_products(organization_id);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_client_number 
ON public.clients(client_number);

CREATE INDEX IF NOT EXISTS idx_clients_org 
ON public.clients(organization_id);

RAISE NOTICE '✅ Indexes created';

-- =====================================
-- PART 4: FIX LOANS TABLE (if needed)
-- =====================================

RAISE NOTICE '📋 Checking loans table...';

-- Add missing columns to loans if needed
ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS disbursement_method TEXT DEFAULT 'Cash';

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS repayment_frequency TEXT DEFAULT 'Monthly';

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS late_payment_penalty NUMERIC(5, 2) DEFAULT 0;

RAISE NOTICE '✅ Loans table checked';

COMMIT;

-- =====================================
-- SUCCESS MESSAGE & SUMMARY
-- =====================================

DO $$
DECLARE
  clients_count INTEGER;
  products_count INTEGER;
  loans_count INTEGER;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO clients_count FROM public.clients;
  SELECT COUNT(*) INTO products_count FROM public.loan_products;
  SELECT COUNT(*) INTO loans_count FROM public.loans;

  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  ✅  COMPLETE DATABASE FIX SUCCESSFUL!                    ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  📊 CLIENTS TABLE:                                        ║';
  RAISE NOTICE '║     • Removed gender constraint                           ║';
  RAISE NOTICE '║     • Removed marital_status constraint                   ║';
  RAISE NOTICE '║     • Removed user_id foreign key                         ║';
  RAISE NOTICE '║     • Made fields nullable                                ║';
  RAISE NOTICE '║     • Current records: %                                  ║', clients_count;
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  📊 LOAN PRODUCTS TABLE:                                  ║';
  RAISE NOTICE '║     • Added late_payment_penalty column                   ║';
  RAISE NOTICE '║     • Added term_unit column                              ║';
  RAISE NOTICE '║     • Added repayment_frequency column                    ║';
  RAISE NOTICE '║     • Added require_collateral column                     ║';
  RAISE NOTICE '║     • Added require_guarantor column                      ║';
  RAISE NOTICE '║     • Added product_code column                           ║';
  RAISE NOTICE '║     • Added product_name column                           ║';
  RAISE NOTICE '║     • Current records: %                                  ║', products_count;
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  📊 LOANS TABLE:                                          ║';
  RAISE NOTICE '║     • Added missing columns                               ║';
  RAISE NOTICE '║     • Current records: %                                  ║', loans_count;
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  🎯 NEXT STEPS:                                           ║';
  RAISE NOTICE '║     1. Reload your SmartLenderUp app                      ║';
  RAISE NOTICE '║     2. Create clients without restrictions                ║';
  RAISE NOTICE '║     3. Create loan products successfully                  ║';
  RAISE NOTICE '║     4. All data will sync properly to Supabase!           ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- =====================================
-- SHOW UPDATED SCHEMAS
-- =====================================

RAISE NOTICE '';
RAISE NOTICE '📋 CLIENTS TABLE SCHEMA:';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'clients'
  AND column_name IN ('id', 'client_number', 'name', 'gender', 'marital_status', 'user_id', 'organization_id')
ORDER BY ordinal_position;

RAISE NOTICE '';
RAISE NOTICE '📋 LOAN PRODUCTS TABLE SCHEMA:';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'loan_products'
  AND column_name IN ('id', 'product_code', 'product_name', 'name', 'late_payment_penalty', 'term_unit', 'repayment_frequency', 'require_collateral', 'require_guarantor')
ORDER BY ordinal_position;
