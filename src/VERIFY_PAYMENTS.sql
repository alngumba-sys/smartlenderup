-- ==========================================
-- VERIFICATION QUERY - Check Payment Records
-- SmartLenderUp - Kenya
-- ==========================================
-- Run this query in Supabase SQL Editor to verify if payment records exist

-- Check how many repayments exist for your organization
SELECT 
  COUNT(*) as total_payments,
  SUM(amount) as total_amount,
  MIN(payment_date) as earliest_payment,
  MAX(payment_date) as latest_payment
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Show all payment records (if any)
SELECT 
  id,
  loan_id,
  client_id,
  amount,
  payment_date,
  payment_method,
  payment_reference,
  status,
  created_at
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY payment_date DESC
LIMIT 25;

-- ==========================================
-- EXPECTED RESULTS IF IMPORT_PAYMENTS.sql WAS RUN:
-- ==========================================
-- total_payments: 23
-- total_amount: 830,800
-- earliest_payment: 2025-11-23
-- latest_payment: 2025-12-30
