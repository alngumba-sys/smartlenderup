-- ============================================================================
-- UPDATE DEFAULTED LOANS STATUS
-- ============================================================================
-- This script updates the 4 existing defaulted loans to ensure they appear
-- in the Defaulted tab correctly
-- ============================================================================

-- Update the status and ensure days_in_arrears is set correctly
UPDATE loans
SET 
  status = 'default',  -- Will be capitalized to 'Default' by the frontend
  days_in_arrears = CASE loan_number
    WHEN '5052' THEN 1500
    WHEN '5044' THEN 1500
    WHEN '5035' THEN 1501
    WHEN '5021' THEN 1504
    ELSE days_in_arrears
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE loan_number IN ('5052', '5044', '5035', '5021');

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the updates
SELECT 
  loan_number,
  client_name,
  product_name,
  TO_CHAR(application_date, 'YYYY-MM-DD') as app_date,
  principal_amount,
  total_interest,
  disbursed_amount,
  outstanding_balance,
  balance,
  total_balance,
  status,
  days_in_arrears
FROM loans
WHERE loan_number IN ('5052', '5044', '5035', '5021')
ORDER BY application_date DESC;

-- Check count
SELECT 
  status,
  COUNT(*) as loan_count,
  SUM(outstanding_balance) as total_outstanding
FROM loans
WHERE loan_number IN ('5052', '5044', '5035', '5021')
GROUP BY status;
