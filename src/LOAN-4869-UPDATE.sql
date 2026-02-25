-- ========================================
-- UPDATE LOAN 4869 - EARLY PAYMENT DISCOUNT
-- ========================================
-- Client: George Munyau Kavuva (ID: 22195033)
-- Original Loan: 50,000 for 3 months, Total: 65,000
-- Actual: Paid 60,600 in 2 months (4,400 early payment discount)
-- ========================================

-- Step 1: Update the loan record
UPDATE loans
SET 
  amount = 50000,
  term_period = 3,
  term_period_unit = 'months',
  repayment_frequency = 'monthly',
  interest_rate = 30.0,
  
  -- Financial Details  
  total_amount = 60600,       -- Discounted total (was 65,000)
  amount_paid = 60600,        -- Full discounted amount paid
  balance = 0,                -- Fully paid
  
  -- Status & Dates
  status = 'settled',
  phase = 5,                  -- Phase 5 = Settled
  disbursement_date = '2026-01-02',
  application_date = '2026-01-02',
  maturity_date = '2026-04-02',    -- Original 3-month maturity
  
  -- Audit
  updated_at = NOW()
  
WHERE loan_number = '4869';

-- Step 2: Clear any existing repayments for this loan (optional - only if you want clean slate)
-- DELETE FROM repayments 
-- WHERE loan_id IN (SELECT id FROM loans WHERE loan_number = '4869');

-- Step 3: Insert payment records for the 2 monthly payments
-- Get the loan ID first
DO $$
DECLARE
  v_loan_id TEXT;
  v_client_id TEXT;
  v_org_id UUID;
BEGIN
  -- Get loan and client IDs
  SELECT id, client_id, organization_id INTO v_loan_id, v_client_id, v_org_id
  FROM loans 
  WHERE loan_number = '4869';
  
  IF v_loan_id IS NULL THEN
    RAISE EXCEPTION 'Loan 4869 not found';
  END IF;
  
  -- Payment 1: Month 1 (February 2026) - 30,300
  INSERT INTO repayments (
    id,
    organization_id,
    loan_id,
    client_id,
    amount,
    principal_amount,
    interest_amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
    created_at,
    updated_at
  ) VALUES (
    'repay_4869_1_' || gen_random_uuid()::TEXT,
    v_org_id,
    v_loan_id,
    v_client_id,
    30300,
    25000,     -- Half of principal
    5300,      -- Partial interest
    '2026-02-02',
    'M-Pesa',
    'MPESA-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
    'First payment - Month 1',
    '2026-02-02'::timestamp,
    '2026-02-02'::timestamp
  );
  
  -- Payment 2: Month 2 (March 2026) - 30,300 (Final payment with discount)
  INSERT INTO repayments (
    id,
    organization_id,
    loan_id,
    client_id,
    amount,
    principal_amount,
    interest_amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
    created_at,
    updated_at
  ) VALUES (
    'repay_4869_2_' || gen_random_uuid()::TEXT,
    v_org_id,
    v_loan_id,
    v_client_id,
    30300,
    25000,     -- Remaining principal
    5300,      -- Remaining interest (discounted from 10,000)
    '2026-03-02',
    'M-Pesa',
    'MPESA-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
    'Final payment - Early payment discount of 4,400 applied',
    '2026-03-02'::timestamp,
    '2026-03-02'::timestamp
  );
  
  -- Optional: Record the discount as a special transaction (waiver)
  INSERT INTO repayments (
    id,
    organization_id,
    loan_id,
    client_id,
    amount,
    principal_amount,
    interest_amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
    created_at,
    updated_at
  ) VALUES (
    'repay_4869_disc_' || gen_random_uuid()::TEXT,
    v_org_id,
    v_loan_id,
    v_client_id,
    4400,
    0,
    4400,      -- Interest discount
    '2026-03-02',
    'Waiver',
    'DISCOUNT-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
    'Early payment discount - paid in 2 months instead of 3 months',
    '2026-03-02'::timestamp,
    '2026-03-02'::timestamp
  );
  
  RAISE NOTICE '✅ Successfully updated Loan 4869 with early payment discount';
  RAISE NOTICE '   - Principal: 50,000';
  RAISE NOTICE '   - Original Total: 65,000';
  RAISE NOTICE '   - Paid: 60,600';
  RAISE NOTICE '   - Discount: 4,400';
  RAISE NOTICE '   - Status: Settled (2 months early payment)';
END $$;

-- Step 4: Verify the update
SELECT 
  loan_number,
  amount,
  total_amount,
  amount_paid,
  balance,
  status,
  phase,
  disbursement_date,
  maturity_date
FROM loans
WHERE loan_number = '4869';

-- Step 5: View payment history
SELECT 
  payment_date,
  amount,
  principal_amount,
  interest_amount,
  payment_method,
  notes
FROM repayments
WHERE loan_id IN (SELECT id FROM loans WHERE loan_number = '4869')
ORDER BY payment_date;
