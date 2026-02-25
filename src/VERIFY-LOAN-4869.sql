-- ========================================
-- VERIFICATION SCRIPT FOR LOAN 4869
-- ========================================
-- Run this after executing LOAN-4869-UPDATE.sql
-- ========================================

SELECT '============================================' as "";
SELECT 'LOAN 4869 VERIFICATION REPORT' as "";
SELECT '============================================' as "";
SELECT '' as "";

-- 1. Loan Summary
SELECT '1️⃣  LOAN SUMMARY' as "";
SELECT '--------------------------------------------' as "";
SELECT 
  loan_number as "Loan #",
  (SELECT name FROM clients WHERE id = loans.client_id) as "Client Name",
  amount as "Principal",
  total_amount as "Total Repayable",
  amount_paid as "Paid Amount",
  balance as "Outstanding",
  status as "Status",
  TO_CHAR(disbursement_date, 'YYYY-MM-DD') as "Disbursed",
  TO_CHAR(settlement_date, 'YYYY-MM-DD') as "Settled"
FROM loans
WHERE loan_number = '4869';

SELECT '' as "";
SELECT '--------------------------------------------' as "";

-- 2. Payment Breakdown
SELECT '2️⃣  PAYMENT BREAKDOWN' as "";
SELECT '--------------------------------------------' as "";
SELECT 
  TO_CHAR(payment_date, 'YYYY-MM-DD') as "Payment Date",
  installment_number as "#",
  amount as "Amount",
  principal_amount as "Principal",
  interest_amount as "Interest",
  payment_method as "Method",
  status as "Status",
  COALESCE(notes, '-') as "Notes"
FROM payments
WHERE loan_id IN (SELECT id FROM loans WHERE loan_number = '4869')
ORDER BY payment_date;

SELECT '' as "";
SELECT '--------------------------------------------' as "";

-- 3. Financial Validation
SELECT '3️⃣  FINANCIAL VALIDATION' as "";
SELECT '--------------------------------------------' as "";
WITH loan_calc AS (
  SELECT 
    l.loan_number,
    l.amount,
    l.total_amount as original_total,
    l.amount_paid,
    l.balance,
    COALESCE(SUM(p.amount), 0) as sum_of_payments,
    COALESCE(SUM(p.principal_amount), 0) as total_principal_paid,
    COALESCE(SUM(p.interest_amount), 0) as total_interest_paid
  FROM loans l
  LEFT JOIN payments p ON p.loan_id = l.id
  WHERE l.loan_number = '4869'
  GROUP BY l.loan_number, l.amount, l.total_amount, l.amount_paid, l.balance
)
SELECT 
  CASE 
    WHEN amount_paid = sum_of_payments THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as "Paid = Sum(Payments)",
  CASE 
    WHEN balance = 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as "Outstanding = 0",
  CASE 
    WHEN total_principal_paid = amount THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as "Principal Fully Paid",
  CASE 
    WHEN amount_paid = 60600 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as "Correct Total (60,600)"
FROM loan_calc;

SELECT '' as "";
SELECT '--------------------------------------------' as "";

-- 4. Discount Calculation
SELECT '4️⃣  DISCOUNT CALCULATION' as "";
SELECT '--------------------------------------------' as "";
WITH loan_calc AS (
  SELECT 
    l.amount,
    l.interest_rate,
    COALESCE(SUM(p.interest_amount), 0) as interest_paid,
    65000 as original_total_repayable,
    l.total_amount as discounted_total,
    l.amount_paid
  FROM loans l
  LEFT JOIN payments p ON p.loan_id = l.id
  WHERE l.loan_number = '4869'
  GROUP BY l.amount, l.interest_rate, l.total_amount, l.amount_paid
)
SELECT 
  amount as "Principal",
  (original_total_repayable - amount) as "Original Interest",
  interest_paid as "Interest Paid",
  ((original_total_repayable - amount) - interest_paid) as "Interest Discount",
  original_total_repayable as "Original Total",
  discounted_total as "Discounted Total",
  (original_total_repayable - discounted_total) as "Total Discount",
  ROUND(((original_total_repayable - discounted_total)::numeric / original_total_repayable * 100), 2) || '%' as "Discount %"
FROM loan_calc;

SELECT '' as "";
SELECT '--------------------------------------------' as "";

-- 5. Timeline Check
SELECT '5️⃣  TIMELINE VERIFICATION' as "";
SELECT '--------------------------------------------' as "";
SELECT 
  TO_CHAR(disbursement_date, 'YYYY-MM-DD') as "Disbursed",
  TO_CHAR(maturity_date, 'YYYY-MM-DD') as "Original Maturity",
  TO_CHAR(settlement_date, 'YYYY-MM-DD') as "Actual Settlement",
  term_period || ' ' || term_period_unit as "Original Term",
  EXTRACT(MONTH FROM AGE(settlement_date, disbursement_date)) || ' months' as "Actual Duration",
  CASE 
    WHEN settlement_date < maturity_date THEN '✅ Early Payment'
    WHEN settlement_date = maturity_date THEN '✅ On Time'
    ELSE '❌ Late Payment'
  END as "Payment Status"
FROM loans
WHERE loan_number = '4869';

SELECT '' as "";
SELECT '--------------------------------------------' as "";

-- 6. Final Status Check
SELECT '6️⃣  FINAL STATUS' as "";
SELECT '--------------------------------------------' as "";
SELECT 
  CASE 
    WHEN status IN ('settled', 'Paid') AND balance = 0 AND amount_paid = 60600 
    THEN '✅✅✅ LOAN 4869 SUCCESSFULLY UPDATED ✅✅✅'
    ELSE '⚠️  WARNING: Loan may need review'
  END as "Status"
FROM loans
WHERE loan_number = '4869';

SELECT '' as "";
SELECT '============================================' as "";
SELECT 'END OF VERIFICATION REPORT' as "";
SELECT '============================================' as "";
