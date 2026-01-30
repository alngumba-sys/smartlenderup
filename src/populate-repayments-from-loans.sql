-- ============================================================================
-- POPULATE REPAYMENTS TABLE FROM LOAN PAYMENT DATA
-- ============================================================================
-- This creates realistic repayment transaction records based on 
-- what has already been paid on each loan
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
  payment_per_installment DECIMAL(15,2);
  running_balance DECIMAL(15,2);
  payment_date DATE;
  i INTEGER;
  total_repayments_created INTEGER := 0;
  
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
      repayment_frequency,
      number_of_repayments,
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
    running_balance := loan_record.total_amount;
    
    -- Determine number of payments to create based on amount paid
    IF loan_record.status = 'closed' OR loan_record.balance <= 0 THEN
      -- Fully paid - create full payment schedule
      num_payments := loan_record.number_of_repayments;
    ELSE
      -- Partially paid - estimate number of payments made
      payment_per_installment := loan_record.total_amount / loan_record.number_of_repayments;
      num_payments := LEAST(
        CEIL(loan_record.amount_paid / payment_per_installment),
        loan_record.number_of_repayments
      );
      -- Ensure at least 1 payment if amount_paid > 0
      IF num_payments = 0 THEN
        num_payments := 1;
      END IF;
    END IF;
    
    RAISE NOTICE '  Creating % payment(s)', num_payments;
    
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
      
      -- Calculate principal vs interest allocation (proportional to original loan)
      principal_portion := ROUND(
        payment_amount * (loan_record.principal / loan_record.total_amount),
        2
      );
      interest_portion := payment_amount - principal_portion;
      
      -- Update running balance
      running_balance := running_balance - payment_amount;
      
      -- Calculate payment date based on repayment frequency
      CASE loan_record.repayment_frequency
        WHEN 'daily' THEN
          payment_date := loan_record.disbursement_date + (i * INTERVAL '1 day');
        WHEN 'weekly' THEN
          payment_date := loan_record.disbursement_date + (i * INTERVAL '1 week');
        WHEN 'bi-weekly' THEN
          payment_date := loan_record.disbursement_date + (i * INTERVAL '2 weeks');
        WHEN 'monthly' THEN
          payment_date := loan_record.disbursement_date + (i * INTERVAL '1 month');
        ELSE
          payment_date := loan_record.disbursement_date + (i * INTERVAL '1 month');
      END CASE;
      
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
          WHEN RANDOM() < 0.5 THEN 'Cash'
          ELSE 'Bank Transfer'
        END,
        'TXN-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 10)),
        'RCT-' || TO_CHAR(payment_date, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 3, '0'),
        'System',
        'Payment ' || i || ' of ' || num_payments,
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
  RAISE NOTICE 'Verification:';
  RAISE NOTICE '  Total in Repayments Table: KES %',
    (SELECT TO_CHAR(COALESCE(SUM(amount), 0), 'FM999,999,990.00')
     FROM repayments WHERE organization_id = org_id);
  RAISE NOTICE '  Total from Loans Table: KES %',
    (SELECT TO_CHAR(COALESCE(SUM(amount_paid), 0), 'FM999,999,990.00')
     FROM loans WHERE organization_id = org_id);
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
  TO_CHAR(SUM(interest_amount), 'FM999,999,990.00') as total_interest_collected
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;

-- Sample repayments
SELECT 
  r.receipt_number,
  l.loan_number,
  TO_CHAR(r.amount, 'FM999,999,990.00') as amount,
  r.payment_method,
  r.payment_date,
  r.status
FROM repayments r
JOIN loans l ON r.loan_id = l.id
WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
ORDER BY r.payment_date DESC
LIMIT 20;
