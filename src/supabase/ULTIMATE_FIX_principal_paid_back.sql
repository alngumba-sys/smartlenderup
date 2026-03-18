-- ============================================
-- ULTIMATE FIX: Principal Paid Back Issue
-- Based on ACTUAL schema (no interest_amount in loans!)
-- ============================================

-- ============================================
-- STEP 1: FIX REPAYMENTS - COPY DATA TO _paid COLUMNS
-- ============================================

DO $$
DECLARE
  rows_updated INTEGER;
BEGIN
  RAISE NOTICE '🔧 Starting repayments data fix...';
  
  -- Copy principal_amount -> principal_paid
  UPDATE public.repayments 
  SET principal_paid = COALESCE(principal_amount, 0)
  WHERE (principal_paid IS NULL OR principal_paid = 0) 
    AND principal_amount > 0;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✅ Updated % repayments: principal_paid = principal_amount', rows_updated;
  
  -- Copy interest_amount -> interest_paid
  UPDATE public.repayments 
  SET interest_paid = COALESCE(interest_amount, 0)
  WHERE (interest_paid IS NULL OR interest_paid = 0) 
    AND interest_amount > 0;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✅ Updated % repayments: interest_paid = interest_amount', rows_updated;
  
  -- Copy penalty_amount -> fees_paid
  UPDATE public.repayments 
  SET fees_paid = COALESCE(penalty_amount, 0)
  WHERE (fees_paid IS NULL OR fees_paid = 0) 
    AND penalty_amount > 0;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✅ Updated % repayments: fees_paid = penalty_amount', rows_updated;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Step 1 complete: Repayments data synchronized';
END $$;

-- ============================================
-- STEP 2: ADD NEW STANDARDIZED COLUMNS TO REPAYMENTS
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '🔧 Checking for standardized columns...';
  
  -- Add 'principal' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'repayments' AND column_name = 'principal') THEN
    ALTER TABLE public.repayments ADD COLUMN principal DECIMAL(15,2);
    RAISE NOTICE '✅ Added principal column';
  ELSE
    RAISE NOTICE 'ℹ️  principal column already exists';
  END IF;

  -- Add 'interest' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'repayments' AND column_name = 'interest') THEN
    ALTER TABLE public.repayments ADD COLUMN interest DECIMAL(15,2);
    RAISE NOTICE '✅ Added interest column';
  ELSE
    RAISE NOTICE 'ℹ️  interest column already exists';
  END IF;

  -- Add 'penalty' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'repayments' AND column_name = 'penalty') THEN
    ALTER TABLE public.repayments ADD COLUMN penalty DECIMAL(15,2);
    RAISE NOTICE '✅ Added penalty column';
  ELSE
    RAISE NOTICE 'ℹ️  penalty column already exists';
  END IF;
  
  RAISE NOTICE '✅ Step 2 complete: Standardized columns checked/added';
END $$;

-- Populate the new standardized columns from _paid columns
DO $$
BEGIN
  UPDATE public.repayments 
  SET 
    principal = COALESCE(principal_paid, principal_amount, 0),
    interest = COALESCE(interest_paid, interest_amount, 0),
    penalty = COALESCE(fees_paid, penalty_amount, 0);

  RAISE NOTICE '✅ Populated standardized columns with data';
END $$;

-- ============================================
-- STEP 3: ADD TRACKING COLUMNS TO LOANS
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Checking loan tracking columns...';
  
  -- Add principalOutstanding (camelCase for frontend)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'principalOutstanding') THEN
    ALTER TABLE public.loans ADD COLUMN "principalOutstanding" DECIMAL(15,2);
    RAISE NOTICE '✅ Added principalOutstanding column';
  ELSE
    RAISE NOTICE 'ℹ️  principalOutstanding column already exists';
  END IF;

  -- Add interestOutstanding (camelCase for frontend)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'interestOutstanding') THEN
    ALTER TABLE public.loans ADD COLUMN "interestOutstanding" DECIMAL(15,2);
    RAISE NOTICE '✅ Added interestOutstanding column';
  ELSE
    RAISE NOTICE 'ℹ️  interestOutstanding column already exists';
  END IF;
  
  -- Add principal_paid if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'principal_paid') THEN
    ALTER TABLE public.loans ADD COLUMN principal_paid DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added principal_paid column';
  ELSE
    RAISE NOTICE 'ℹ️  principal_paid column already exists';
  END IF;
  
  -- Add interest_paid if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'interest_paid') THEN
    ALTER TABLE public.loans ADD COLUMN interest_paid DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added interest_paid column';
  ELSE
    RAISE NOTICE 'ℹ️  interest_paid column already exists';
  END IF;
  
  RAISE NOTICE '✅ Step 3 complete: Loan tracking columns ready';
END $$;

-- ============================================
-- STEP 4: RECALCULATE ALL LOAN BALANCES
-- ============================================

DO $$
DECLARE
  rows_updated INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Recalculating loan balances...';
  
  -- Update principal_paid (sum of all principal payments)
  UPDATE public.loans l
  SET principal_paid = COALESCE((
    SELECT SUM(COALESCE(r.principal_paid, r.principal_amount, 0))
    FROM public.repayments r 
    WHERE r.loan_id = l.id
  ), 0);
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✅ Updated principal_paid for % loans', rows_updated;
  
  -- Update interest_paid (sum of all interest payments)
  UPDATE public.loans l
  SET interest_paid = COALESCE((
    SELECT SUM(COALESCE(r.interest_paid, r.interest_amount, 0))
    FROM public.repayments r 
    WHERE r.loan_id = l.id
  ), 0);
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✅ Updated interest_paid for % loans', rows_updated;
  
  -- Calculate principalOutstanding
  UPDATE public.loans
  SET "principalOutstanding" = GREATEST(0, 
    COALESCE(principal_amount, 0) - COALESCE(principal_paid, 0)
  );
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✅ Updated principalOutstanding for % loans', rows_updated;
  
  -- Calculate interestOutstanding (total_amount - principal_amount - interest_paid)
  UPDATE public.loans
  SET "interestOutstanding" = GREATEST(0,
    (COALESCE(total_amount, 0) - COALESCE(principal_amount, 0)) - COALESCE(interest_paid, 0)
  );
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✅ Updated interestOutstanding for % loans', rows_updated;
  
  -- Sync with existing outstanding_principal column
  UPDATE public.loans
  SET outstanding_principal = "principalOutstanding";
  
  RAISE NOTICE '✅ Synced outstanding_principal column';
  
  -- Update outstanding_balance (total remaining)
  UPDATE public.loans
  SET outstanding_balance = GREATEST(0,
    COALESCE("principalOutstanding", 0) + COALESCE("interestOutstanding", 0)
  );
  
  RAISE NOTICE '✅ Updated outstanding_balance';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Step 4 complete: All loan balances recalculated';
END $$;

-- ============================================
-- STEP 5: CREATE TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Trigger 1: Sync repayment columns
CREATE OR REPLACE FUNCTION sync_repayment_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Always sync _amount to _paid columns
  NEW.principal_paid := COALESCE(NEW.principal_amount, NEW.principal_paid, 0);
  NEW.interest_paid := COALESCE(NEW.interest_amount, NEW.interest_paid, 0);
  NEW.fees_paid := COALESCE(NEW.penalty_amount, NEW.fees_paid, 0);
  
  -- Also populate standardized columns
  NEW.principal := NEW.principal_paid;
  NEW.interest := NEW.interest_paid;
  NEW.penalty := NEW.fees_paid;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_repayment_columns ON public.repayments;
CREATE TRIGGER trigger_sync_repayment_columns
  BEFORE INSERT OR UPDATE ON public.repayments
  FOR EACH ROW
  EXECUTE FUNCTION sync_repayment_columns();

-- Trigger 2: Update loan balances when payment is recorded
CREATE OR REPLACE FUNCTION update_loan_balances_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate principal_paid
  UPDATE public.loans l
  SET principal_paid = COALESCE((
    SELECT SUM(COALESCE(r.principal_paid, r.principal_amount, 0))
    FROM public.repayments r 
    WHERE r.loan_id = l.id
  ), 0)
  WHERE l.id = NEW.loan_id;
  
  -- Recalculate interest_paid
  UPDATE public.loans l
  SET interest_paid = COALESCE((
    SELECT SUM(COALESCE(r.interest_paid, r.interest_amount, 0))
    FROM public.repayments r 
    WHERE r.loan_id = l.id
  ), 0)
  WHERE l.id = NEW.loan_id;
  
  -- Update outstanding amounts
  UPDATE public.loans l
  SET 
    "principalOutstanding" = GREATEST(0, l.principal_amount - COALESCE(l.principal_paid, 0)),
    "interestOutstanding" = GREATEST(0, (l.total_amount - l.principal_amount) - COALESCE(l.interest_paid, 0)),
    outstanding_principal = GREATEST(0, l.principal_amount - COALESCE(l.principal_paid, 0)),
    outstanding_balance = GREATEST(0, 
      (l.principal_amount - COALESCE(l.principal_paid, 0)) + 
      ((l.total_amount - l.principal_amount) - COALESCE(l.interest_paid, 0))
    ),
    amount_paid = COALESCE(l.principal_paid, 0) + COALESCE(l.interest_paid, 0)
  WHERE l.id = NEW.loan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_loan_on_payment ON public.repayments;
CREATE TRIGGER trigger_update_loan_on_payment
  AFTER INSERT OR UPDATE ON public.repayments
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_balances_on_payment();

DO $$ 
BEGIN
  RAISE NOTICE '✅ Created trigger: sync_repayment_columns';
  RAISE NOTICE '✅ Created trigger: update_loan_balances_on_payment';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Step 5 complete: Triggers created';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ============================================';
  RAISE NOTICE '🎉 ALL FIXES APPLIED SUCCESSFULLY!';
  RAISE NOTICE '🎉 ============================================';
END $$;

-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

-- Show fixed repayment data
SELECT 
  '=== REPAYMENTS (FIXED) ===' as info,
  loan_number,
  amount as total_payment,
  principal_amount,
  principal_paid,
  interest_amount,
  interest_paid
FROM public.repayments
WHERE principal_amount > 0 OR interest_amount > 0
ORDER BY created_at DESC
LIMIT 5;

-- Show loan balances
SELECT 
  '=== ACTIVE LOANS ===' as info,
  loan_number,
  first_name || ' ' || last_name as client_name,
  principal_amount as original_principal,
  COALESCE(principal_paid, 0) as principal_paid,
  COALESCE("principalOutstanding", outstanding_principal, 0) as principal_outstanding,
  total_amount - principal_amount as total_interest,
  COALESCE(interest_paid, 0) as interest_paid,
  COALESCE("interestOutstanding", 0) as interest_outstanding
FROM public.loans
WHERE LOWER(status) IN ('active', 'disbursed')
  AND disbursement_date IS NOT NULL
ORDER BY loan_number
LIMIT 10;

-- Summary
SELECT 
  '=== PORTFOLIO SUMMARY ===' as info,
  COUNT(*) as total_active_loans,
  SUM(principal_amount) as total_principal_disbursed,
  SUM(COALESCE(principal_paid, 0)) as total_principal_paid,
  SUM(COALESCE("principalOutstanding", outstanding_principal, 0)) as total_principal_outstanding,
  SUM(total_amount - principal_amount) as total_interest_due,
  SUM(COALESCE(interest_paid, 0)) as total_interest_paid,
  SUM(COALESCE("interestOutstanding", 0)) as total_interest_outstanding
FROM public.loans
WHERE LOWER(status) IN ('active', 'disbursed')
  AND disbursement_date IS NOT NULL;

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '1. Check the verification results above ⬆️';
  RAISE NOTICE '2. Refresh your application';
  RAISE NOTICE '3. Go to: Dashboard → Comprehensive Loan Overview';
  RAISE NOTICE '4. The "Principal Paid Back" card should now show correct amounts! 💰';
  RAISE NOTICE '';
  RAISE NOTICE '✨ All future payments will automatically update correctly!';
END $$;
