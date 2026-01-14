-- =============================================
-- ONE-CLICK EXECUTION - LN00013 UPDATE (CORRECT TABLE!)
-- =============================================
-- Organization: BV Funguo Ltd
-- Organization ID: 958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9
-- 
-- ⚠️ BEFORE RUNNING:
-- Change interest rate on line 18 if needed (currently 15.0%)
-- 
-- ✅ TO EXECUTE:
-- Just click RUN - everything happens in one transaction!
-- =============================================

BEGIN;

-- Update interest rate
UPDATE loans 
SET 
  interest_rate = 15.0,  -- ⬅️ CHANGE THIS if needed
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;

-- Record payment (using payments table, not repayments!)
INSERT INTO payments (
  id,
  loan_id,
  payment_number,
  amount,
  principal_paid,
  interest_paid,
  penalty_paid,
  payment_method,
  payment_reference,
  payment_date,
  received_by,
  status,
  notes,
  created_at
)
SELECT 
  uuid_generate_v4(),
  l.id,
  'PAY' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
  100000,
  100000,
  0,
  0,
  'mpesa',
  'MP' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  NOW(),
  (SELECT id FROM users WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid LIMIT 1),
  'completed',
  'Payment of KES 100,000 for YUSUF OLELA OMONDI - Loan LN00013',
  NOW()
FROM loans l
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;

-- Update outstanding balance
UPDATE loans 
SET 
  outstanding_balance = outstanding_balance - 100000,
  paid_amount = COALESCE(paid_amount, 0) + 100000,
  last_payment_date = NOW(),
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;

COMMIT;

-- Verify results
SELECT 
  '✅ UPDATES COMPLETED SUCCESSFULLY!' as "Status",
  'Check results below' as "Message";

SELECT 
  l.loan_number as "Loan ID",
  c.name as "Client Name",
  l.interest_rate as "Interest Rate (%)",
  l.outstanding_balance as "Outstanding (KES)",
  l.status as "Status"
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;

SELECT 
  p.payment_number as "Payment #",
  p.amount as "Amount (KES)",
  p.payment_date as "Payment Date",
  p.payment_method as "Method",
  p.payment_reference as "Reference",
  p.status as "Status"
FROM payments p
JOIN loans l ON p.loan_id = l.id
WHERE l.loan_number = 'LN00013'
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid
ORDER BY p.created_at DESC
LIMIT 5;

-- =============================================
-- ✅ DONE! 
-- =============================================
-- Next Steps:
-- 1. Deploy code changes:
--    git add .
--    git commit -m "Filter Record Payment dropdown"
--    git push origin main
-- 2. Visit https://smartlenderup.com to see changes
-- =============================================
