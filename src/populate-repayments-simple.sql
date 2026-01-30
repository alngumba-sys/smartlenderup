-- ============================================================================
-- POPULATE REPAYMENTS TABLE FROM LOAN PAYMENT DATA (SIMPLIFIED)
-- ============================================================================
-- Uses only columns we know exist in the loans table
-- ============================================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  loan_record RECORD;
  repayment_id UUID;
  payment_amount DECIMAL(15,2);
  principal_portion DECIMAL(15,2);
  interest_portion DECIMAL(15,2);
  remaining_to_allocate DECIMAL(15,2);
  num_payments INTEGER;
  payment_date DATE;
  i INTEGER;
  total_repayments_created INTEGER := 0;
  days_between INTEGER;
  
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '💰 POPULATING REPAYMENTS FROM LOAN DATA';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Loop through all loans that have payments made
  FOR loan_record IN 
    SELECT 
      id,
      client_id,
      loan_number,
      amount as principal,
      total_amount,
      amount_paid,
      balance,
      disbursement_date,
      maturity_date,
      status
    FROM loans
    WHERE organization_id = org_id
      AND amount_paid > 0
    ORDER BY disbursement_date
  LOOP
    
    RAISE NOTICE '──────────────────────────────────────────────────────';
    RAISE NOTICE 'Processing Loan: %', loan_record.loan_number;
    RAISE NOTICE '  Principal: KES %', TO_CHAR(loan_record.principal, 'FM999,999,990.00');
    RAISE NOTICE '  Total Due: KES %', TO_CHAR(loan_record.total_amount, 'FM999,999,990.00');
    RAISE NOTICE '  Amount Paid: KES %', TO_CHAR(loan_record.amount_paid, 'FM999,999,990.00');
    RAISE NOTICE '  Balance: KES %', TO_CHAR(loan_record.balance, 'FM999,999,990.00');
    
    remaining_to_allocate := loan_record.amount_paid;
    
    -- Calculate number of payments based on loan duration and status
    days_between := loan_record.maturity_date - loan_record.disbursement_date;
    
    IF loan_record.status = 'closed' OR loan_record.balance <= 0 THEN
      -- Fully paid - estimate based on loan duration (assume monthly)
      num_payments := GREATEST(CEIL(days_between / 30.0), 1);
    ELSE
      -- Partially paid - estimate based on % paid
      num_payments := GREATEST(
        CEIL((loan_record.amount_paid / loan_record.total_amount) * CEIL(days_between / 30.0)),
        1
      );
    END IF;
    
    -- Cap at reasonable maximum
    num_payments := LEAST(num_payments, 24);
    
    RAISE NOTICE '  Creating % payment(s) over % days', num_payments, days_between;
    
    -- Create individual repayment transactions
    FOR i IN 1..num_payments LOOP
      
      -- Calculate payment amount for this installment
      IF i = num_payments THEN
        -- Last payment - use remaining amount
        payment_amount := remaining_to_allocate;
      ELSE
        -- Regular payment - divide evenly
        payment_amount := ROUND(loan_record.amount_paid / num_payments, 2);
      END IF;
      
      -- Skip if payment amount is zero or negative
      IF payment_amount <= 0 THEN
        CONTINUE;
      END IF;
      
      -- Calculate principal vs interest allocation (proportional to original loan)
      IF loan_record.total_amount > 0 THEN
        principal_portion := ROUND(
          payment_amount * (loan_record.principal / loan_record.total_amount),
          2
        );
        interest_portion := payment_amount - principal_portion;
      ELSE
        principal_portion := payment_amount;
        interest_portion := 0;
      END IF;
      
      -- Calculate payment date - spread evenly across loan duration
      payment_date := loan_record.disbursement_date + 
                     ((days_between * i) / num_payments)::INTEGER * INTERVAL '1 day';
      
      -- Don't create future payments
      IF payment_date > CURRENT_DATE THEN
        payment_date := CURRENT_DATE;
      END IF;
      
      -- Generate repayment ID
      repayment_id := gen_random_uuid();
      
      -- Insert repayment record
      INSERT INTO repayments (
        id,
        organization_id,
        loan_id,
        client_id,
        amount,
        principal_amount,
        interest_amount,
        penalty_amount,
        payment_date,
        payment_method,
        transaction_ref,
        receipt_number,
        received_by,
        notes,
        status,
        approval_status,
        created_at,
        updated_at
      ) VALUES (
        repayment_id,
        org_id,
        loan_record.id,
        loan_record.client_id,
        payment_amount,
        principal_portion,
        interest_portion,
        0.00,
        payment_date,
        CASE 
          WHEN RANDOM() < 0.7 THEN 'M-Pesa'
          WHEN RANDOM() < 0.85 THEN 'Cash'
          ELSE 'Bank Transfer'
        END,
        'TXN-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 10)),
        'RCT-' || TO_CHAR(payment_date, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 3, '0'),
        'System',
        'Payment ' || i || ' of ' || num_payments || ' for ' || loan_record.loan_number,
        'completed',
        'Approved',
        payment_date,
        payment_date
      );
      
      total_repayments_created := total_repayments_created + 1;
      remaining_to_allocate := remaining_to_allocate - payment_amount;
      
    END LOOP;
    
    RAISE NOTICE '  ✅ Created % repayment record(s)', num_payments;
    
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ REPAYMENTS POPULATED SUCCESSFULLY';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Total Repayment Records Created: %', total_repayments_created;
  RAISE NOTICE '';
  
  -- Verify total
  DECLARE
    repayments_total DECIMAL(15,2);
    loans_total DECIMAL(15,2);
  BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO repayments_total
    FROM repayments WHERE organization_id = org_id;
    
    SELECT COALESCE(SUM(amount_paid), 0) INTO loans_total
    FROM loans WHERE organization_id = org_id;
    
    RAISE NOTICE 'Verification:';
    RAISE NOTICE '  Total in Repayments Table: KES %', TO_CHAR(repayments_total, 'FM999,999,990.00');
    RAISE NOTICE '  Total from Loans Table: KES %', TO_CHAR(loans_total, 'FM999,999,990.00');
    
    IF ABS(repayments_total - loans_total) < 10 THEN
      RAISE NOTICE '  ✅ MATCH! Difference: KES %', TO_CHAR(ABS(repayments_total - loans_total), 'FM990.00');
    ELSE
      RAISE NOTICE '  ⚠️  Difference: KES %', TO_CHAR(ABS(repayments_total - loans_total), 'FM999,999,990.00');
    END IF;
  END;
  
  RAISE NOTICE '';
  
END $$;

-- ============================================================================
-- VERIFY REPAYMENTS
-- ============================================================================

-- Summary
SELECT 
  COUNT(*) as total_repayments,
  TO_CHAR(SUM(amount), 'FM999,999,990.00') as total_collections,
  TO_CHAR(SUM(principal_amount), 'FM999,999,990.00') as total_principal_repaid,
  TO_CHAR(SUM(interest_amount), 'FM999,999,990.00') as total_interest_collected,
  TO_CHAR(AVG(amount), 'FM999,999,990.00') as avg_payment
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;

-- Recent repayments
SELECT 
  r.receipt_number,
  l.loan_number,
  TO_CHAR(r.amount, 'FM999,999,990.00') as amount,
  TO_CHAR(r.principal_amount, 'FM999,999,990.00') as principal,
  TO_CHAR(r.interest_amount, 'FM999,999,990.00') as interest,
  r.payment_method,
  r.payment_date,
  r.status
FROM repayments r
JOIN loans l ON r.loan_id = l.id
WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
ORDER BY r.payment_date DESC
LIMIT 15;

-- Repayments by payment method
SELECT 
  payment_method,
  COUNT(*) as num_payments,
  TO_CHAR(SUM(amount), 'FM999,999,990.00') as total_amount
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
GROUP BY payment_method
ORDER BY SUM(amount) DESC;
