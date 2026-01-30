-- ============================================================================
-- INVESTIGATE PAYMENT DATA STRUCTURE
-- ============================================================================

-- Check if there's a loan_payments or repayments table
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%payment%' OR table_name LIKE '%repay%'
ORDER BY table_name;

-- Check the loans table structure for payment-related columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'loans'
    AND table_schema = 'public'
    AND (column_name LIKE '%paid%' OR column_name LIKE '%payment%' OR column_name LIKE '%balance%')
ORDER BY 
    ordinal_position;

-- Check actual loan data
SELECT 
  loan_id,
  borrower_name,
  status,
  amount as principal,
  total_amount as total_due,
  balance,
  amount_paid,
  (total_amount - balance) as amount_repaid,
  disbursement_date,
  maturity_date
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY disbursement_date DESC
LIMIT 15;

-- Summary by status
SELECT 
  status,
  COUNT(*) as count,
  TO_CHAR(SUM(amount), 'FM999,999,990.00') as total_principal,
  TO_CHAR(SUM(total_amount), 'FM999,999,990.00') as total_amount_due,
  TO_CHAR(SUM(balance), 'FM999,999,990.00') as total_balance,
  TO_CHAR(SUM(amount_paid), 'FM999,999,990.00') as total_amount_paid,
  TO_CHAR(SUM(total_amount - balance), 'FM999,999,990.00') as total_collected
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
GROUP BY status;

-- Grand totals
SELECT 
  'GRAND TOTAL' as status,
  COUNT(*) as count,
  TO_CHAR(SUM(amount), 'FM999,999,990.00') as total_principal,
  TO_CHAR(SUM(total_amount), 'FM999,999,990.00') as total_amount_due,
  TO_CHAR(SUM(balance), 'FM999,999,990.00') as total_balance,
  TO_CHAR(SUM(amount_paid), 'FM999,999,990.00') as total_amount_paid,
  TO_CHAR(SUM(total_amount - balance), 'FM999,999,990.00') as total_collected
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
