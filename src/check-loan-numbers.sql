-- ============================================================================
-- CHECK LOAN NUMBERS vs UUIDs
-- ============================================================================

-- See what loan_number format is being used
SELECT 
  'LOAN NUMBERS' as report,
  id as uuid,
  loan_number,
  client_id,
  amount,
  amount_paid,
  disbursement_date,
  status
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
  AND amount_paid > 0
ORDER BY loan_number
LIMIT 10;

-- Check what repayments currently have
SELECT 
  'REPAYMENTS LOAN IDs' as report,
  r.id as repayment_id,
  r.loan_id,
  TO_CHAR(r.amount, 'FM999,999,990.00') as amount,
  r.payment_date,
  l.loan_number
FROM repayments r
LEFT JOIN loans l ON r.loan_id = l.id
WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
ORDER BY r.payment_date DESC
LIMIT 10;

-- Count how many repayments have matching loans
SELECT 
  'MATCH STATUS' as report,
  COUNT(*) as total_repayments,
  COUNT(l.id) as matched_loans,
  COUNT(*) - COUNT(l.id) as unmatched
FROM repayments r
LEFT JOIN loans l ON r.loan_id = l.id
WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
