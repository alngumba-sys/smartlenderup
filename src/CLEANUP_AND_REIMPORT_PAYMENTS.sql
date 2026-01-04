-- ==========================================
-- CLEANUP AND REIMPORT PAYMENTS - CORRECTED
-- SmartLenderUp - Kenya
-- ==========================================
-- Step 1: Delete all existing repayments
-- Step 2: Reimport with correct mappings (getting client_id from loans table)

-- STEP 1: Delete existing payments
DELETE FROM repayments 
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- STEP 2: Reimport with correct client_id derived from loans table
INSERT INTO repayments (
  id,
  organization_id,
  loan_id,
  client_id,
  amount,
  payment_date,
  payment_method,
  transaction_ref,
  principal_amount,
  interest_amount,
  penalty_amount,
  status,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid,
  l.id as loan_id,
  l.client_id, -- Get client_id from the loan itself
  p.amount,
  p.payment_date::timestamptz,
  p.payment_method,
  p.transaction_ref,
  p.principal_amount,
  p.interest_amount,
  p.penalty_amount,
  'Approved',
  p.payment_date::timestamptz,
  NOW()
FROM (VALUES
  -- 10 FULLY PAID LOANS (55,000 each = 550,000 total)
  ('LN00001', 55000, 50000, 5000, 0, '2025-11-27', 'M-Pesa', 'MPESA-REF-001'),
  ('LN00002', 55000, 50000, 5000, 0, '2025-11-28', 'M-Pesa', 'MPESA-REF-002'),
  ('LN00003', 55000, 50000, 5000, 0, '2025-11-23', 'M-Pesa', 'MPESA-REF-003'),
  ('LN00004', 55000, 50000, 5000, 0, '2025-11-28', 'Bank Transfer', 'BANK-TXN-004'),
  ('LN00005', 55000, 50000, 5000, 0, '2025-11-30', 'M-Pesa', 'MPESA-REF-005'),
  ('LN00006', 55000, 50000, 5000, 0, '2025-12-06', 'M-Pesa', 'MPESA-REF-006'),
  ('LN00007', 55000, 50000, 5000, 0, '2025-12-07', 'Cash', 'CASH-REC-007'),
  ('LN00008', 55000, 50000, 5000, 0, '2025-12-10', 'M-Pesa', 'MPESA-REF-008'),
  ('LN00009', 55000, 50000, 5000, 0, '2025-12-13', 'M-Pesa', 'MPESA-REF-009'),
  ('LN00012', 55000, 50000, 5000, 0, '2025-12-01', 'M-Pesa', 'MPESA-REF-012'),
  
  -- 13 PARTIAL PAYMENTS ON OVERDUE LOANS (21,600 each = 280,800 total)
  ('LN00010', 21600, 20000, 1600, 0, '2025-11-27', 'M-Pesa', 'MPESA-REF-010-P1'),
  ('LN00011', 21600, 20000, 1600, 0, '2025-12-05', 'M-Pesa', 'MPESA-REF-011-P1'),
  ('LN00013', 21600, 20000, 1600, 0, '2025-11-30', 'M-Pesa', 'MPESA-REF-013-P1'),
  ('LN00014', 21600, 20000, 1600, 0, '2025-12-08', 'Bank Transfer', 'BANK-TXN-014-P1'),
  ('LN00015', 21600, 20000, 1600, 0, '2025-12-15', 'M-Pesa', 'MPESA-REF-015-P1'),
  ('LN00016', 21600, 20000, 1600, 0, '2025-12-18', 'M-Pesa', 'MPESA-REF-016-P1'),
  ('LN00017', 21600, 20000, 1600, 0, '2025-12-20', 'Cash', 'CASH-REC-017-P1'),
  ('LN00018', 21600, 20000, 1600, 0, '2025-12-22', 'M-Pesa', 'MPESA-REF-018-P1'),
  ('LN00019', 21600, 20000, 1600, 0, '2025-12-25', 'M-Pesa', 'MPESA-REF-019-P1'),
  ('LN00020', 21600, 20000, 1600, 0, '2025-12-28', 'M-Pesa', 'MPESA-REF-020-P1'),
  ('LN00021', 21600, 20000, 1600, 0, '2025-12-30', 'M-Pesa', 'MPESA-REF-021-P1'),
  ('LN00022', 21600, 20000, 1600, 0, '2025-12-18', 'M-Pesa', 'MPESA-REF-022-P1'),
  ('LN00023', 21600, 20000, 1600, 0, '2025-12-20', 'Bank Transfer', 'BANK-TXN-023-P1')
) AS p(loan_number, amount, principal_amount, interest_amount, penalty_amount, payment_date, payment_method, transaction_ref)
INNER JOIN loans l ON l.loan_number = p.loan_number 
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Verify import
SELECT 
  COUNT(*) as total_payments,
  SUM(amount) as total_amount
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Expected Result:
-- total_payments: 23
-- total_amount: 830,800
