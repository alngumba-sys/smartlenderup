-- ============================================
-- SAFE DATABASE SETUP - CRITICAL COLUMNS ONLY
-- ============================================
-- This adds ONLY the missing critical columns
-- that are causing errors in your app
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- FIX LOANS TABLE - Add missing columns
-- ============================================
DO $$ 
BEGIN
  -- Add outstanding_principal if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'outstanding_principal'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN outstanding_principal DECIMAL(15,2);
    RAISE NOTICE 'Added outstanding_principal column to loans table';
  ELSE
    RAISE NOTICE 'outstanding_principal column already exists in loans table';
  END IF;

  -- Add organization_code if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'organization_code'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN organization_code TEXT;
    RAISE NOTICE 'Added organization_code column to loans table';
  ELSE
    RAISE NOTICE 'organization_code column already exists in loans table';
  END IF;
END $$;

-- ============================================
-- FIX REPAYMENTS TABLE - Add missing columns
-- ============================================
DO $$ 
BEGIN
  -- Add principal_paid if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'repayments' 
    AND column_name = 'principal_paid'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN principal_paid DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE 'Added principal_paid column to repayments table';
  ELSE
    RAISE NOTICE 'principal_paid column already exists in repayments table';
  END IF;

  -- Add interest_paid if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'repayments' 
    AND column_name = 'interest_paid'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN interest_paid DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE 'Added interest_paid column to repayments table';
  ELSE
    RAISE NOTICE 'interest_paid column already exists in repayments table';
  END IF;

  -- Add fees_paid if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'repayments' 
    AND column_name = 'fees_paid'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN fees_paid DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE 'Added fees_paid column to repayments table';
  ELSE
    RAISE NOTICE 'fees_paid column already exists in repayments table';
  END IF;
END $$;

-- ============================================
-- FIX ORGANIZATIONS TABLE - Add auth columns
-- ============================================
DO $$ 
BEGIN
  -- Add password_hash if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN password_hash TEXT;
    RAISE NOTICE 'Added password_hash column to organizations table';
  ELSE
    RAISE NOTICE 'password_hash column already exists in organizations table';
  END IF;

  -- Add organization_code if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'organization_code'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN organization_code TEXT UNIQUE;
    RAISE NOTICE 'Added organization_code column to organizations table';
  ELSE
    RAISE NOTICE 'organization_code column already exists in organizations table';
  END IF;
END $$;

-- ============================================
-- FIX CLIENTS TABLE - Add missing columns
-- ============================================
DO $$ 
BEGIN
  -- Add organization_code if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'organization_code'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN organization_code TEXT;
    RAISE NOTICE 'Added organization_code column to clients table';
  ELSE
    RAISE NOTICE 'organization_code column already exists in clients table';
  END IF;
END $$;

-- ============================================
-- UPDATE EXISTING DATA
-- ============================================

-- Update outstanding_principal for active loans
UPDATE public.loans 
SET outstanding_principal = principal_amount - COALESCE(
  (SELECT COALESCE(SUM(amount_paid), 0) 
   FROM public.repayments 
   WHERE repayments.loan_id = loans.id),
  0
)
WHERE outstanding_principal IS NULL 
AND status IN ('active', 'disbursed', 'approved');

-- Update settled loans to have 0 outstanding
UPDATE public.loans 
SET outstanding_principal = 0
WHERE outstanding_principal IS NULL 
AND status IN ('settled', 'fully_paid', 'closed');

-- Set default value for any remaining null outstanding_principal
UPDATE public.loans 
SET outstanding_principal = principal_amount
WHERE outstanding_principal IS NULL;

-- ============================================
-- CREATE HELPFUL INDEXES
-- ============================================

-- Index for faster loan lookups
CREATE INDEX IF NOT EXISTS idx_loans_outstanding ON public.loans(outstanding_principal) 
WHERE outstanding_principal > 0;

CREATE INDEX IF NOT EXISTS idx_loans_org_code ON public.loans(organization_code);
CREATE INDEX IF NOT EXISTS idx_clients_org_code ON public.clients(organization_code);

-- ============================================
-- VERIFICATION
-- ============================================

-- Show what we've accomplished
DO $$
DECLARE
  loans_count INTEGER;
  repayments_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO loans_count FROM public.loans;
  SELECT COUNT(*) INTO repayments_count FROM public.repayments;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total loans: %', loans_count;
  RAISE NOTICE 'Total repayments: %', repayments_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All critical columns have been added!';
  RAISE NOTICE 'You can now refresh your app.';
  RAISE NOTICE '========================================';
END $$;
