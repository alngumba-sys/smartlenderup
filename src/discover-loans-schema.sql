-- ============================================================================
-- DISCOVER LOANS TABLE SCHEMA
-- ============================================================================

-- Check the loans table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- Sample loan data to see what we're working with
SELECT 
  id,
  loan_number,
  client_id,
  amount,
  total_amount,
  amount_paid,
  balance,
  disbursement_date,
  maturity_date,
  status
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
  AND amount_paid > 0
LIMIT 5;

-- Count loans with payments
SELECT 
  COUNT(*) as loans_with_payments,
  TO_CHAR(SUM(amount_paid), 'FM999,999,990.00') as total_paid
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
  AND amount_paid > 0;
