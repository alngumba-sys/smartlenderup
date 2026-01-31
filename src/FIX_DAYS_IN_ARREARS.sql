-- =====================================================
-- FIX INCORRECT DAYS IN ARREARS IN DATABASE
-- =====================================================
-- Problem: Loans showing 1500+ days overdue when they were just disbursed
-- Solution: Recalculate days_in_arrears based on actual disbursement dates

-- Step 1: Reset all days_in_arrears to 0 for recently disbursed loans
UPDATE loans
SET days_in_arrears = 0,
    arrears_amount = 0,
    overdue_amount = 0
WHERE disbursement_date >= '2026-01-01'
  AND status IN ('active', 'Active', 'disbursed', 'Disbursed');

-- Step 2: Calculate accurate days in arrears for loans past their first payment date
-- This assumes monthly repayment frequency (30 days after disbursement)
UPDATE loans
SET days_in_arrears = CASE
  WHEN CURRENT_DATE > (disbursement_date + INTERVAL '30 days') 
    AND balance > 0
  THEN EXTRACT(DAY FROM (CURRENT_DATE - (disbursement_date + INTERVAL '30 days')))::INTEGER
  ELSE 0
END,
arrears_amount = CASE
  WHEN CURRENT_DATE > (disbursement_date + INTERVAL '30 days') 
    AND balance > 0
  THEN balance
  ELSE 0
END
WHERE status IN ('active', 'Active', 'disbursed', 'Disbursed');

-- Step 3: Verify the fix
SELECT 
  loan_number,
  client_id,
  disbursement_date,
  days_in_arrears,
  arrears_amount,
  balance,
  status,
  CASE
    WHEN disbursement_date + INTERVAL '30 days' > CURRENT_DATE THEN 'Not Yet Due'
    ELSE 'Past Due Date'
  END as payment_status
FROM loans
WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
ORDER BY disbursement_date DESC
LIMIT 20;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. This script assumes monthly repayment (30 days)
-- 2. For weekly/biweekly loans, adjust the INTERVAL accordingly
-- 3. The frontend now also calculates days_in_arrears dynamically
--    to prevent this issue in the future
-- 4. Days in arrears should only start counting AFTER the first
--    payment due date, not from disbursement date
-- =====================================================
