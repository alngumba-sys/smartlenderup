-- =====================================================
-- DEBUG: CHECK ACTUAL LOAN DATA IN DATABASE
-- =====================================================

-- 1. Show ALL distinct status values that exist
SELECT 
  'Actual Status Values in Database' as report,
  status,
  COUNT(*) as count
FROM loans
GROUP BY status
ORDER BY count DESC;

-- 2. Show sample of loan records with all key fields
SELECT 
  'Sample Loan Records' as report,
  id,
  loan_number,
  client_id,
  principal_amount,
  amount_paid,
  outstanding_balance,
  status,
  disbursement_date,
  created_at
FROM loans
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check for data quality issues
SELECT 
  'Data Quality Summary' as report,
  COUNT(*) as total_loans,
  COUNT(*) FILTER (WHERE status IS NULL) as null_status,
  COUNT(*) FILTER (WHERE status = '') as empty_status,
  COUNT(*) FILTER (WHERE outstanding_balance IS NULL) as null_outstanding,
  COUNT(*) FILTER (WHERE outstanding_balance = 0) as zero_outstanding,
  COUNT(*) FILTER (WHERE outstanding_balance > 0) as positive_outstanding
FROM loans;

-- 4. Show what the chart SHOULD see (based on current filters)
SELECT 
  'What Chart Should Display' as report,
  CASE 
    WHEN status IN ('Active', 'Disbursed') THEN 'Active/Disbursed'
    WHEN status = 'Fully Paid' THEN 'Fully Paid'
    WHEN status = 'In Arrears' THEN 'In Arrears'
    WHEN status = 'Written Off' THEN 'Written Off'
    ELSE 'Other: ' || COALESCE(status, 'NULL')
  END as chart_category,
  COUNT(*) as loan_count,
  SUM(outstanding_balance) as total_outstanding
FROM loans
GROUP BY chart_category
ORDER BY loan_count DESC;
