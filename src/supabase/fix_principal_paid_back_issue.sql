-- ============================================
-- COMPREHENSIVE FIX: Payment Allocation
-- Ensures Principal Paid Back shows correctly
-- ============================================

-- PROBLEM:
-- When a loan is fully paid back, the "Principal Paid Back" card shows KSh 0K
-- instead of the actual principal amount that was repaid.
--
-- ROOT CAUSE:
-- 1. Repayments table uses: principal_paid, interest_paid, amount_paid
-- 2. Frontend code looks for: principal, interest, principalPortion, principalPaid
-- 3. Column name mismatch means principal allocation is not being read correctly

-- ============================================
-- STEP 1: Add missing columns to repayments table
-- ============================================

-- Add 'principal' column (frontend expects this)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'repayments' AND column_name = 'principal'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN principal DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added principal column to repayments';
  ELSE
    RAISE NOTICE 'ℹ️  principal column already exists';
  END IF;
END $$;

-- Add 'interest' column (frontend expects this)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'repayments' AND column_name = 'interest'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN interest DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added interest column to repayments';
  ELSE
    RAISE NOTICE 'ℹ️  interest column already exists';
  END IF;
END $$;

-- Add 'penalty' column (frontend expects this)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'repayments' AND column_name = 'penalty'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN penalty DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added penalty column to repayments';
  ELSE
    RAISE NOTICE 'ℹ️  penalty column already exists';
  END IF;
END $$;

-- Add 'amount' column (frontend expects this)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'repayments' AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN amount DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added amount column to repayments';
  ELSE
    RAISE NOTICE 'ℹ️  amount column already exists';
  END IF;
END $$;

-- ============================================
-- STEP 2: Copy data from old columns to new columns
-- ============================================

-- Copy principal_paid → principal
UPDATE public.repayments 
SET principal = COALESCE(principal_paid, 0)
WHERE principal IS NULL OR principal = 0;

-- Copy interest_paid → interest  
UPDATE public.repayments 
SET interest = COALESCE(interest_paid, 0)
WHERE interest IS NULL OR interest = 0;

-- Copy penalties_paid → penalty
UPDATE public.repayments 
SET penalty = COALESCE(penalties_paid, 0)
WHERE penalty IS NULL OR penalty = 0;

-- Copy amount_paid → amount
UPDATE public.repayments 
SET amount = COALESCE(amount_paid, 0)
WHERE amount IS NULL OR amount = 0;

RAISE NOTICE '✅ Copied payment allocation data to new columns';

-- ============================================
-- STEP 3: Add missing columns to loans table
-- ============================================

-- Add 'principalOutstanding' column (camelCase for frontend)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'principalOutstanding'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN "principalOutstanding" DECIMAL(15,2);
    RAISE NOTICE '✅ Added principalOutstanding column to loans';
  ELSE
    RAISE NOTICE 'ℹ️  principalOutstanding column already exists';
  END IF;
END $$;

-- Add 'interestOutstanding' column (camelCase for frontend)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'interestOutstanding'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN "interestOutstanding" DECIMAL(15,2);
    RAISE NOTICE '✅ Added interestOutstanding column to loans';
  ELSE
    RAISE NOTICE 'ℹ️  interestOutstanding column already exists';
  END IF;
END $$;

-- ============================================
-- STEP 4: Recalculate outstanding balances
-- ============================================

-- Update principalOutstanding and interestOutstanding based on payments
UPDATE public.loans l
SET 
  "principalOutstanding" = GREATEST(0, 
    l.principal_amount - COALESCE((
      SELECT SUM(COALESCE(r.principal, r.principal_paid, 0))
      FROM public.repayments r 
      WHERE r.loan_id = l.id
    ), 0)
  ),
  "interestOutstanding" = GREATEST(0,
    l.interest_amount - COALESCE((
      SELECT SUM(COALESCE(r.interest, r.interest_paid, 0))
      FROM public.repayments r 
      WHERE r.loan_id = l.id
    ), 0)
  )
WHERE l.disbursement_date IS NOT NULL;

-- Also update snake_case versions if they exist
UPDATE public.loans l
SET 
  outstanding_principal = "principalOutstanding",
  outstanding_interest = "interestOutstanding",
  total_outstanding = GREATEST(0, "principalOutstanding" + "interestOutstanding")
WHERE l.disbursement_date IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'outstanding_principal'
  );

RAISE NOTICE '✅ Recalculated outstanding balances for all loans';

-- ============================================
-- STEP 5: Create trigger to auto-update outstanding balances
-- ============================================

CREATE OR REPLACE FUNCTION update_loan_outstanding_balances()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the loan's outstanding balances when a payment is added/modified
  UPDATE public.loans l
  SET 
    "principalOutstanding" = GREATEST(0, 
      l.principal_amount - COALESCE((
        SELECT SUM(COALESCE(r.principal, r.principal_paid, 0))
        FROM public.repayments r 
        WHERE r.loan_id = l.id
      ), 0)
    ),
    "interestOutstanding" = GREATEST(0,
      l.interest_amount - COALESCE((
        SELECT SUM(COALESCE(r.interest, r.interest_paid, 0))
        FROM public.repayments r 
        WHERE r.loan_id = l.id
      ), 0)
    )
  WHERE l.id = NEW.loan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_outstanding_on_payment ON public.repayments;

-- Create trigger
CREATE TRIGGER trigger_update_outstanding_on_payment
  AFTER INSERT OR UPDATE ON public.repayments
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_outstanding_balances();

RAISE NOTICE '✅ Created trigger to auto-update outstanding balances';

-- ============================================
-- STEP 6: Verification Query
-- ============================================
SELECT 
  l.loan_number,
  l.client_name,
  l.status,
  l.principal_amount,
  COALESCE(SUM(r.principal), 0) as principal_paid_from_payments,
  l."principalOutstanding",
  l.interest_amount,
  COALESCE(SUM(r.interest), 0) as interest_paid_from_payments,
  l."interestOutstanding"
FROM public.loans l
LEFT JOIN public.repayments r ON r.loan_id = l.id
WHERE l.loan_number = '5224'
GROUP BY l.id, l.loan_number, l.client_name, l.status, l.principal_amount, l.interest_amount, l."principalOutstanding", l."interestOutstanding";

-- ============================================
-- EXPECTED RESULT FOR LOAN 5224:
-- ============================================
-- If fully paid:
--   principal_paid_from_payments = 300,000
--   principalOutstanding = 0
--
-- If partially paid (e.g., 1 payment of 172,500):
--   Assuming 7.5% rate, 2 months, interest = 45,000
--   Payment allocation: penalty (0) → interest (45,000) → principal (127,500)
--   principal_paid_from_payments = 127,500
--   principalOutstanding = 172,500
-- ============================================
