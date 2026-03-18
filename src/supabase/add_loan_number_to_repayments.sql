-- ============================================
-- ADD LOAN NUMBER TO REPAYMENTS TABLE
-- ============================================
-- This script adds a loan_number column to the repayments table
-- and populates it from the loans table for easier querying

-- Step 1: Add the loan_number column
ALTER TABLE public.repayments 
ADD COLUMN IF NOT EXISTS loan_number TEXT;

-- Step 2: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_repayments_loan_number 
ON public.repayments(loan_number);

-- Step 3: Populate existing records with loan numbers from the loans table
UPDATE public.repayments r
SET loan_number = l.loan_number
FROM public.loans l
WHERE r.loan_id = l.id
AND r.loan_number IS NULL;

-- Step 4: Create a function to automatically set loan_number when a repayment is inserted
CREATE OR REPLACE FUNCTION public.set_repayment_loan_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically populate loan_number from the loans table
  IF NEW.loan_number IS NULL AND NEW.loan_id IS NOT NULL THEN
    SELECT loan_number INTO NEW.loan_number
    FROM public.loans
    WHERE id = NEW.loan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create a trigger to auto-populate loan_number on INSERT
DROP TRIGGER IF EXISTS trigger_set_repayment_loan_number ON public.repayments;

CREATE TRIGGER trigger_set_repayment_loan_number
  BEFORE INSERT ON public.repayments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_repayment_loan_number();

-- Step 6: Create a function to update loan_number if loan_id changes
CREATE OR REPLACE FUNCTION public.update_repayment_loan_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Update loan_number if loan_id changes
  IF NEW.loan_id IS DISTINCT FROM OLD.loan_id THEN
    SELECT loan_number INTO NEW.loan_number
    FROM public.loans
    WHERE id = NEW.loan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create a trigger to auto-update loan_number on UPDATE
DROP TRIGGER IF EXISTS trigger_update_repayment_loan_number ON public.repayments;

CREATE TRIGGER trigger_update_repayment_loan_number
  BEFORE UPDATE ON public.repayments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_repayment_loan_number();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'repayments' 
AND column_name = 'loan_number';

-- Check how many repayments now have loan numbers
SELECT 
  COUNT(*) as total_repayments,
  COUNT(loan_number) as with_loan_number,
  COUNT(*) - COUNT(loan_number) as without_loan_number
FROM public.repayments;

-- Sample query showing repayments with loan numbers
SELECT 
  r.id,
  r.loan_number,
  r.loan_id,
  r.payment_date,
  r.amount,
  r.principal_amount,
  r.interest_amount,
  l.loan_number as loan_number_from_join
FROM public.repayments r
LEFT JOIN public.loans l ON r.loan_id = l.id
LIMIT 10;

-- ============================================
-- OPTIONAL: Add comment to the column
-- ============================================
COMMENT ON COLUMN public.repayments.loan_number IS 'Denormalized loan number for easier querying. Auto-populated from loans table via trigger.';
