-- =====================================================
-- CHECK LOAN STATUS VALUES
-- =====================================================

-- Check what status values exist in the loans table
SELECT 
  status,
  COUNT(*) as count,
  SUM(principal_amount) as total_principal,
  SUM(outstanding_balance) as total_outstanding
FROM loans
GROUP BY status
ORDER BY count DESC;

-- Check sample loans with their status
SELECT 
  id,
  loan_number,
  client_id,
  principal_amount,
  outstanding_balance,
  status,
  created_at
FROM loans
ORDER BY created_at DESC
LIMIT 10;

-- Check for null or empty status values
SELECT 
  COUNT(*) as loans_with_null_status
FROM loans
WHERE status IS NULL OR status = '';
