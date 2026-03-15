-- =============================================
-- FIX LOANS TABLE SCHEMA MISMATCH
-- =============================================
-- This migration fixes the column name mismatch between 'amount' and 'principal_amount'
-- The code expects 'amount', but the schema uses 'principal_amount'

-- Option 1: Add 'amount' as an alias/generated column
-- This allows both column names to work
ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2) 
  GENERATED ALWAYS AS (principal_amount) STORED;

-- Option 2 (Alternative - commented out): Rename the column
-- WARNING: This will break existing queries using 'principal_amount'
-- ALTER TABLE public.loans 
--   RENAME COLUMN principal_amount TO amount;

-- Option 3 (Recommended): Add missing columns that match the migration schema
-- Add 'amount' column if it doesn't exist
DO $$ 
BEGIN
  -- Check if 'amount' column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'amount'
  ) THEN
    -- If 'amount' doesn't exist, add it
    ALTER TABLE public.loans ADD COLUMN amount DECIMAL(15,2);
    
    -- Copy data from principal_amount to amount if principal_amount exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'loans' 
      AND column_name = 'principal_amount'
    ) THEN
      UPDATE public.loans SET amount = principal_amount WHERE amount IS NULL;
      -- Make amount NOT NULL after copying data
      ALTER TABLE public.loans ALTER COLUMN amount SET NOT NULL;
    ELSE
      -- If principal_amount doesn't exist either, make amount NOT NULL
      ALTER TABLE public.loans ALTER COLUMN amount SET NOT NULL;
    END IF;
  END IF;

  -- Check if 'term_months' column exists, add if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'term_months'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN term_months INTEGER;
    
    -- Copy from duration_months if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'loans' 
      AND column_name = 'duration_months'
    ) THEN
      UPDATE public.loans SET term_months = duration_months WHERE term_months IS NULL;
    END IF;
  END IF;

  -- Add 'purpose' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'purpose'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN purpose TEXT DEFAULT '';
  END IF;

  -- Add 'total_payable' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'total_payable'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN total_payable DECIMAL(15,2);
    
    -- Copy from total_amount if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'loans' 
      AND column_name = 'total_amount'
    ) THEN
      UPDATE public.loans SET total_payable = total_amount WHERE total_payable IS NULL;
    END IF;
  END IF;

  -- Add 'monthly_payment' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'monthly_payment'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN monthly_payment DECIMAL(15,2);
    
    -- Copy from monthly_installment if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'loans' 
      AND column_name = 'monthly_installment'
    ) THEN
      UPDATE public.loans SET monthly_payment = monthly_installment WHERE monthly_payment IS NULL;
    END IF;
  END IF;

  -- Add 'balance' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'balance'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN balance DECIMAL(15,2);
    
    -- Copy from outstanding_balance if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'loans' 
      AND column_name = 'outstanding_balance'
    ) THEN
      UPDATE public.loans SET balance = outstanding_balance WHERE balance IS NULL;
    END IF;
  END IF;

  -- Add 'principal_paid' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'principal_paid'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN principal_paid DECIMAL(15,2) DEFAULT 0 NOT NULL;
  END IF;

  -- Add 'interest_paid' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'interest_paid'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN interest_paid DECIMAL(15,2) DEFAULT 0 NOT NULL;
  END IF;

  -- Add 'payment_method' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN payment_method TEXT;
    
    -- Copy from disbursement_method if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'loans' 
      AND column_name = 'disbursement_method'
    ) THEN
      UPDATE public.loans SET payment_method = disbursement_method WHERE payment_method IS NULL;
    END IF;
  END IF;

  -- Add 'guarantor_required' column if missing (might already exist)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'guarantor_required'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN guarantor_required BOOLEAN DEFAULT FALSE NOT NULL;
  END IF;

  -- Add 'collateral_required' column if missing (might already exist)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'collateral_required'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN collateral_required BOOLEAN DEFAULT FALSE NOT NULL;
  END IF;

END $$;

-- Add comments to clarify the schema
COMMENT ON COLUMN public.loans.amount IS 'Principal loan amount (same as principal_amount)';
COMMENT ON COLUMN public.loans.term_months IS 'Loan duration in months (same as duration_months)';
COMMENT ON COLUMN public.loans.total_payable IS 'Total amount to be repaid (same as total_amount)';
COMMENT ON COLUMN public.loans.monthly_payment IS 'Monthly installment amount (same as monthly_installment)';
COMMENT ON COLUMN public.loans.balance IS 'Outstanding loan balance (same as outstanding_balance)';
