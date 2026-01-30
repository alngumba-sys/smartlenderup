-- ============================================================================
-- VERIFY ACTUAL LOAN DATA
-- ============================================================================
-- Let's see what data we actually have in the loans table
-- ============================================================================

-- Summary of all loans
SELECT 
  status,
  COUNT(*) as loan_count,
  TO_CHAR(SUM(amount), 'FM999,999,990.00') as total_principal,
  TO_CHAR(SUM(total_amount), 'FM999,999,990.00') as total_amount_due,
  TO_CHAR(SUM(balance), 'FM999,999,990.00') as total_balance_remaining,
  TO_CHAR(SUM(amount_paid), 'FM999,999,990.00') as total_paid
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
GROUP BY status
ORDER BY status;

-- Detailed breakdown
SELECT 
  '=== OVERALL TOTALS ===' as section,
  '' as detail,
  '' as amount;

SELECT 
  'Total Loans' as section,
  COUNT(*)::TEXT as detail,
  '' as amount
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

SELECT 
  'Total Disbursed' as section,
  'Principal only' as detail,
  'KES ' || TO_CHAR(SUM(amount), 'FM999,999,990.00') as amount
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

SELECT 
  'Total Amount Due' as section,
  'Principal + Interest' as detail,
  'KES ' || TO_CHAR(SUM(total_amount), 'FM999,999,990.00') as amount
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

SELECT 
  'Total Interest Charged' as section,
  'Total Interest on all loans' as detail,
  'KES ' || TO_CHAR(SUM(total_amount - amount), 'FM999,999,990.00') as amount
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

SELECT 
  'Total Balance Remaining' as section,
  'Principal + Interest still owed' as detail,
  'KES ' || TO_CHAR(SUM(balance), 'FM999,999,990.00') as amount
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

SELECT 
  'Total Amount Paid' as section,
  'Actual repayments received' as detail,
  'KES ' || TO_CHAR(SUM(amount_paid), 'FM999,999,990.00') as amount
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Sample of individual loans
SELECT 
  loan_id,
  borrower_name,
  status,
  TO_CHAR(amount, 'FM999,999,990.00') as principal,
  TO_CHAR(total_amount, 'FM999,999,990.00') as total_due,
  TO_CHAR(balance, 'FM999,999,990.00') as remaining,
  TO_CHAR(amount_paid, 'FM999,999,990.00') as paid,
  disbursement_date
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY disbursement_date DESC
LIMIT 10;
