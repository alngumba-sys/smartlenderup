-- ============================================
-- LOAN CREATION SCHEMA FIX
-- ============================================
-- This script diagnoses and fixes the PGRST204 error for loan creation
-- Error: "Could not find the 'paid_amount' column of 'loans' in the schema cache"

-- ============================================
-- STEP 1: CHECK WHAT COLUMNS ACTUALLY EXIST
-- ============================================
-- Run this first to see what columns your loans table currently has:

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- ============================================
-- STEP 1B: CHECK FOR SPECIFIC MISSING COLUMNS
-- ============================================
-- This query shows which columns are MISSING from your loans table:

SELECT 
  col,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'loans' 
      AND column_name = col
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - NEEDS TO BE ADDED'
  END as status
FROM (
  SELECT unnest(ARRAY[
    'paid_amount',
    'monthly_installment', 
    'term_period',
    'duration_months',
    'total_interest',
    'total_repayable',
    'facilitation_fee',
    'staff_member_id',
    'collateral_type',
    'collateral_value',
    'loan_term',
    'creation_date',
    'loan_product_id',
    'loan_officer_id',
    'application_date',
    'first_payment_date',
    'maturity_date',
    'approved_at',
    'approved_by',
    'disbursed_at',
    'disbursed_by',
    'disbursement_method',
    'disbursement_reference'
  ]) as col
) cols
ORDER BY status DESC, col;

-- ============================================
-- STEP 2: ADD MISSING COLUMNS
-- ============================================
-- Based on the schema.sql file and the loan creation form, these columns should exist:

-- Add paid_amount (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'paid_amount'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN paid_amount DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE 'Added column: paid_amount';
  ELSE
    RAISE NOTICE 'Column paid_amount already exists';
  END IF;
END $$;

-- Add monthly_installment (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'monthly_installment'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN monthly_installment DECIMAL(15,2) NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added column: monthly_installment';
  ELSE
    RAISE NOTICE 'Column monthly_installment already exists';
  END IF;
END $$;

-- Add term_period (if missing) - REQUIRED FIELD
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'term_period'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN term_period INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added column: term_period';
  ELSE
    RAISE NOTICE 'Column term_period already exists';
  END IF;
END $$;

-- Add duration_months (if missing) - For compatibility
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'duration_months'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN duration_months INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added column: duration_months';
  ELSE
    RAISE NOTICE 'Column duration_months already exists';
  END IF;
END $$;

-- Add total_interest (calculated field - useful for reporting)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'total_interest'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN total_interest DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE 'Added column: total_interest';
  ELSE
    RAISE NOTICE 'Column total_interest already exists';
  END IF;
END $$;

-- Add total_repayable (calculated field - useful for reporting)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'total_repayable'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN total_repayable DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE 'Added column: total_repayable';
  ELSE
    RAISE NOTICE 'Column total_repayable already exists';
  END IF;
END $$;

-- Add facilitation_fee (from the loan creation form)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'facilitation_fee'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN facilitation_fee DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE 'Added column: facilitation_fee';
  ELSE
    RAISE NOTICE 'Column facilitation_fee already exists';
  END IF;
END $$;

-- Add staff_member_id (from the loan creation form - "Who Brought This Deal")
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'staff_member_id'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN staff_member_id UUID REFERENCES public.staff(id);
    RAISE NOTICE 'Added column: staff_member_id';
  ELSE
    RAISE NOTICE 'Column staff_member_id already exists';
  END IF;
END $$;

-- Add collateral_type (from the loan creation form)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'collateral_type'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN collateral_type TEXT;
    RAISE NOTICE 'Added column: collateral_type';
  ELSE
    RAISE NOTICE 'Column collateral_type already exists';
  END IF;
END $$;

-- Add collateral_value (from the loan creation form)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'collateral_value'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN collateral_value DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE 'Added column: collateral_value';
  ELSE
    RAISE NOTICE 'Column collateral_value already exists';
  END IF;
END $$;

-- Add loan_term (alternative name for duration_months, some code might use this)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'loan_term'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN loan_term INTEGER;
    RAISE NOTICE 'Added column: loan_term';
  ELSE
    RAISE NOTICE 'Column loan_term already exists';
  END IF;
END $$;

-- Add creation_date (from the loan creation form)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'creation_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN creation_date DATE DEFAULT CURRENT_DATE;
    RAISE NOTICE 'Added column: creation_date';
  ELSE
    RAISE NOTICE 'Column creation_date already exists';
  END IF;
END $$;

-- Add loan_product_id (from the loan creation form)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'loan_product_id'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN loan_product_id UUID REFERENCES public.loan_products(id);
    RAISE NOTICE 'Added column: loan_product_id';
  ELSE
    RAISE NOTICE 'Column loan_product_id already exists';
  END IF;
END $$;

-- Add loan_officer_id (from the loan creation form)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'loan_officer_id'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN loan_officer_id UUID REFERENCES public.staff(id);
    RAISE NOTICE 'Added column: loan_officer_id';
  ELSE
    RAISE NOTICE 'Column loan_officer_id already exists';
  END IF;
END $$;

-- Add application_date (from the loan creation form)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'application_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN application_date TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added column: application_date';
  ELSE
    RAISE NOTICE 'Column application_date already exists';
  END IF;
END $$;

-- Add first_payment_date (from the loan creation form)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'first_payment_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN first_payment_date DATE;
    RAISE NOTICE 'Added column: first_payment_date';
  ELSE
    RAISE NOTICE 'Column first_payment_date already exists';
  END IF;
END $$;

-- Add maturity_date (from the loan creation form)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'maturity_date'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN maturity_date DATE;
    RAISE NOTICE 'Added column: maturity_date';
  ELSE
    RAISE NOTICE 'Column maturity_date already exists';
  END IF;
END $$;

-- Add approved_at (date when loan was approved)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN approved_at TIMESTAMP;
    RAISE NOTICE 'Added column: approved_at';
  ELSE
    RAISE NOTICE 'Column approved_at already exists';
  END IF;
END $$;

-- Add approved_by (user who approved the loan)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN approved_by TEXT;
    RAISE NOTICE 'Added column: approved_by';
  ELSE
    RAISE NOTICE 'Column approved_by already exists';
  END IF;
END $$;

-- Add disbursed_at (date when loan was disbursed)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'disbursed_at'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursed_at TIMESTAMP;
    RAISE NOTICE 'Added column: disbursed_at';
  ELSE
    RAISE NOTICE 'Column disbursed_at already exists';
  END IF;
END $$;

-- Add disbursed_by (user who disbursed the loan)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'disbursed_by'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursed_by TEXT;
    RAISE NOTICE 'Added column: disbursed_by';
  ELSE
    RAISE NOTICE 'Column disbursed_by already exists';
  END IF;
END $$;

-- Add disbursement_method (how the loan was disbursed)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'disbursement_method'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursement_method TEXT;
    RAISE NOTICE 'Added column: disbursement_method';
  ELSE
    RAISE NOTICE 'Column disbursement_method already exists';
  END IF;
END $$;

-- Add disbursement_reference (reference number for disbursement)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'disbursement_reference'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN disbursement_reference TEXT;
    RAISE NOTICE 'Added column: disbursement_reference';
  ELSE
    RAISE NOTICE 'Column disbursement_reference already exists';
  END IF;
END $$;

-- ============================================
-- STEP 3: REFRESH SUPABASE SCHEMA CACHE
-- ============================================
-- After adding columns, you MUST refresh the schema cache
-- Go to: Supabase Dashboard → API → Click "Refresh schema cache"
-- OR wait 30 seconds and try again

-- ============================================
-- STEP 4: VERIFY THE FIX
-- ============================================
-- Run this to confirm all required columns now exist:

SELECT 
  column_name,
  data_type,
  CASE WHEN is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULL' END as nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
  AND column_name IN (
    'paid_amount',
    'monthly_installment',
    'duration_months',
    'term_period',
    'total_interest',
    'total_repayable',
    'facilitation_fee',
    'approved_at',
    'approved_by',
    'disbursed_at',
    'disbursed_by',
    'disbursement_method',
    'disbursement_reference',
    'staff_member_id',
    'collateral_type',
    'collateral_value',
    'loan_term',
    'creation_date',
    'loan_product_id',
    'loan_officer_id',
    'application_date',
    'first_payment_date',
    'maturity_date'
  )
ORDER BY column_name;

-- ============================================
-- EXPECTED RESULT FIELDS FOR LOAN CREATION
-- ============================================
-- Based on the loan creation form, these fields are required:
-- 
-- FROM FORM:
-- 1. client_id - UUID (from "Select Client" dropdown)
-- 2. loan_product_id - UUID (from "Loan Product" dropdown)  
-- 3. principal_amount - DECIMAL (from "Principal Amount (KES)" input)
-- 4. interest_rate - DECIMAL (from "Interest Rate (%)" input)
-- 5. duration_months/loan_term - INTEGER (from "Loan Term (months)" input)
-- 6. creation_date - DATE (from "Creation Date" date picker)
-- 7. facilitation_fee - DECIMAL (from "Facilitation Fee (KES)" input)
-- 8. purpose - TEXT (from "Loan Purpose" textarea)
-- 9. staff_member_id - UUID (from "Staff Member (Who Brought This Deal)" dropdown)
-- 10. collateral_type - TEXT (from "Collateral Type" dropdown)
-- 11. collateral_value - DECIMAL (from "Collateral Value (KES)" input)
-- 12. guarantor_name - TEXT (stored in loan_guarantors table)
-- 13. guarantor_phone - TEXT (stored in loan_guarantors table)
-- 
-- CALCULATED FIELDS (should be in DB for reporting):
-- 14. total_interest - DECIMAL (calculated: principal × rate × term / 100)
-- 15. total_repayable - DECIMAL (calculated: principal + total_interest + facilitation_fee)
-- 16. total_amount - DECIMAL (same as total_repayable)
-- 17. monthly_installment - DECIMAL (calculated: total_repayable / duration_months)
-- 18. outstanding_balance - DECIMAL (initialized to total_amount)
-- 19. paid_amount - DECIMAL (initialized to 0)
-- 
-- AUTO-GENERATED:
-- 20. loan_number - TEXT (auto-generated with org prefix)
-- 21. organization_id - UUID (from current user's organization)
-- 22. status - TEXT (default: 'pending')
-- 23. application_date - TIMESTAMP (default: NOW())
-- 24. created_at - TIMESTAMP (default: NOW())
-- 25. updated_at - TIMESTAMP (default: NOW())