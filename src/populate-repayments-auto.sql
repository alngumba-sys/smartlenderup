-- ============================================================================
-- AUTO-DISCOVER AND POPULATE REPAYMENTS TABLE
-- ============================================================================
-- This script automatically discovers what columns exist and uses them
-- ============================================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  loan_record RECORD;
  payment_amount DECIMAL(15,2);
  principal_portion DECIMAL(15,2);
  interest_portion DECIMAL(15,2);
  remaining_to_allocate DECIMAL(15,2);
  num_payments INTEGER;
  payment_date DATE;
  i INTEGER;
  total_repayments_created INTEGER := 0;
  days_between INTEGER;
  insert_sql TEXT;
  
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '💰 POPULATING REPAYMENTS TABLE';
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
    RAISE NOTICE 'Loan: % | Paid: KES %', 
      loan_record.loan_number, 
      TO_CHAR(loan_record.amount_paid, 'FM999,999,990.00');
    
    remaining_to_allocate := loan_record.amount_paid;
    
    -- Calculate number of payments based on loan duration
    days_between := loan_record.maturity_date - loan_record.disbursement_date;
    
    IF loan_record.status = 'closed' OR loan_record.balance <= 0 THEN
      num_payments := GREATEST(CEIL(days_between / 30.0), 1);
    ELSE
      num_payments := GREATEST(
        CEIL((loan_record.amount_paid / loan_record.total_amount) * CEIL(days_between / 30.0)),
        1
      );
    END IF;
    
    num_payments := LEAST(num_payments, 24);
    
    -- Create repayment transactions
    FOR i IN 1..num_payments LOOP
      
      IF i = num_payments THEN
        payment_amount := remaining_to_allocate;
      ELSE
        payment_amount := ROUND(loan_record.amount_paid / num_payments, 2);
      END IF;
      
      IF payment_amount <= 0 THEN
        CONTINUE;
      END IF;
      
      -- Calculate principal vs interest
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
      
      -- Calculate payment date
      payment_date := loan_record.disbursement_date + 
                     ((days_between * i) / num_payments)::INTEGER * INTERVAL '1 day';
      
      IF payment_date > CURRENT_DATE THEN
        payment_date := CURRENT_DATE;
      END IF;
      
      -- Insert with minimal required fields (id, org_id, loan_id, amount, payment_date)
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
        status,
        created_at
      ) VALUES (
        gen_random_uuid(),
        org_id,
        loan_record.id,
        loan_record.client_id,
        payment_amount,
        principal_portion,
        interest_portion,
        payment_date,
        CASE 
          WHEN RANDOM() < 0.7 THEN 'M-Pesa'
          WHEN RANDOM() < 0.85 THEN 'Cash'
          ELSE 'Bank Transfer'
        END,
        'completed',
        payment_date
      );
      
      total_repayments_created := total_repayments_created + 1;
      remaining_to_allocate := remaining_to_allocate - payment_amount;
      
    END LOOP;
    
    RAISE NOTICE '  ✅ Created % payments', num_payments;
    
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SUCCESS: % REPAYMENTS CREATED', total_repayments_created;
  RAISE NOTICE '════════════════════════════════════════════════════════';
  
  -- Verify totals
  DECLARE
    repayments_total DECIMAL(15,2);
    loans_total DECIMAL(15,2);
  BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO repayments_total
    FROM repayments WHERE organization_id = org_id;
    
    SELECT COALESCE(SUM(amount_paid), 0) INTO loans_total
    FROM loans WHERE organization_id = org_id;
    
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFICATION:';
    RAISE NOTICE '  Repayments Table: KES %', TO_CHAR(repayments_total, 'FM999,999,990.00');
    RAISE NOTICE '  Loans Table: KES %', TO_CHAR(loans_total, 'FM999,999,990.00');
    RAISE NOTICE '  Difference: KES %', TO_CHAR(ABS(repayments_total - loans_total), 'FM999,999,990.00');
    RAISE NOTICE '';
  END;
  
END $$;

-- Summary
SELECT 
  'REPAYMENTS SUMMARY' as report,
  COUNT(*) as total_transactions,
  TO_CHAR(SUM(amount), 'FM999,999,990.00') as total_collections,
  TO_CHAR(SUM(principal_amount), 'FM999,999,990.00') as principal_repaid,
  TO_CHAR(SUM(interest_amount), 'FM999,999,990.00') as interest_collected
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;

-- Recent repayments
SELECT 
  'RECENT PAYMENTS' as report,
  l.loan_number,
  TO_CHAR(r.amount, 'FM999,999,990.00') as amount,
  r.payment_method,
  r.payment_date
FROM repayments r
JOIN loans l ON r.loan_id = l.id
WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
ORDER BY r.payment_date DESC
LIMIT 10;

-- By payment method
SELECT 
  'BY PAYMENT METHOD' as report,
  payment_method,
  COUNT(*) as count,
  TO_CHAR(SUM(amount), 'FM999,999,990.00') as total
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
GROUP BY payment_method
ORDER BY SUM(amount) DESC;
