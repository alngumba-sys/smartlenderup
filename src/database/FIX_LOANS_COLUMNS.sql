-- =============================================
-- QUICK FIX: Add missing columns to loans table
-- =============================================
-- Run this in your Supabase SQL Editor to fix the schema mismatch
-- This adds the columns that the application code expects

-- 1. Add 'amount' column (maps to principal_amount)
ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2);

-- 2. Copy existing data from principal_amount to amount
UPDATE public.loans 
SET amount = principal_amount 
WHERE amount IS NULL AND principal_amount IS NOT NULL;

-- 3. Add other missing columns with defaults
ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS term_months INTEGER;

UPDATE public.loans 
SET term_months = duration_months 
WHERE term_months IS NULL AND duration_months IS NOT NULL;

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS total_payable DECIMAL(15,2);

UPDATE public.loans 
SET total_payable = total_amount 
WHERE total_payable IS NULL AND total_amount IS NOT NULL;

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(15,2);

UPDATE public.loans 
SET monthly_payment = monthly_installment 
WHERE monthly_payment IS NULL AND monthly_installment IS NOT NULL;

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2);

UPDATE public.loans 
SET balance = outstanding_balance 
WHERE balance IS NULL AND outstanding_balance IS NOT NULL;

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS principal_paid DECIMAL(15,2) DEFAULT 0;

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS interest_paid DECIMAL(15,2) DEFAULT 0;

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

UPDATE public.loans 
SET payment_method = disbursement_method 
WHERE payment_method IS NULL AND disbursement_method IS NOT NULL;

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT '';

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS guarantor_required BOOLEAN DEFAULT FALSE;

ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS collateral_required BOOLEAN DEFAULT FALSE;

-- 4. Create a trigger to keep 'amount' and 'principal_amount' in sync
CREATE OR REPLACE FUNCTION sync_loan_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- If amount is updated, sync to principal_amount
  IF NEW.amount IS DISTINCT FROM OLD.amount THEN
    NEW.principal_amount = NEW.amount;
  END IF;
  
  -- If principal_amount is updated, sync to amount
  IF NEW.principal_amount IS DISTINCT FROM OLD.principal_amount THEN
    NEW.amount = NEW.principal_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_loan_amount_trigger ON public.loans;
CREATE TRIGGER sync_loan_amount_trigger
  BEFORE INSERT OR UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION sync_loan_amount();

-- Verification query
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
  AND column_name IN (
    'amount', 'principal_amount', 
    'term_months', 'duration_months',
    'total_payable', 'total_amount',
    'monthly_payment', 'monthly_installment',
    'balance', 'outstanding_balance',
    'purpose', 'payment_method',
    'principal_paid', 'interest_paid',
    'guarantor_required', 'collateral_required'
  )
ORDER BY column_name;
