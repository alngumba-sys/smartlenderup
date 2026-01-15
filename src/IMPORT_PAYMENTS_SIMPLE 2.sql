-- ==========================================
-- IMPORT PAYMENT RECORDS - SIMPLE SCHEMA VERSION
-- SmartLenderUp - Kenya
-- ==========================================
-- Use this version if your repayments table has the SIMPLE schema:
-- (id, organization_id, loan_id, client_id, amount, principal_amount, interest_amount, payment_date, payment_method, reference_number, notes, created_at, updated_at)

-- First, let's check if we can insert - test with one record
-- If this works, uncomment the rest

INSERT INTO repayments (
  id,
  organization_id,
  loan_id,
  client_id,
  amount,
  principal_amount,
  interest_amount,
  payment_date,
  payment_method,
  reference_number,
  notes,
  created_at,
  updated_at
) VALUES
-- Payment 1: STEPHEN MULU NZAVI - LN00001 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-11-27',
  'M-Pesa',
  'MPESA-REF-001',
  'Full loan payment',
  '2025-11-27'::TIMESTAMPTZ,
  NOW()
),

-- Payment 2: ROONEY - LN00002 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00002' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00002' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-11-28',
  'M-Pesa',
  'MPESA-REF-002',
  'Full loan payment',
  '2025-11-28'::TIMESTAMPTZ,
  NOW()
),

-- Payment 3: JOSPHAT M MATHEKA - LN00003 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00003' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00003' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-11-23',
  'M-Pesa',
  'MPESA-REF-003',
  'Full loan payment',
  '2025-11-23'::TIMESTAMPTZ,
  NOW()
),

-- Payment 4: BEN K MBUVI - LN00004 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00004' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00004' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-11-28',
  'Bank Transfer',
  'BANK-TXN-004',
  'Full loan payment',
  '2025-11-28'::TIMESTAMPTZ,
  NOW()
),

-- Payment 5: NATALIA THOMAS - LN00005 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00005' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00005' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-11-30',
  'M-Pesa',
  'MPESA-REF-005',
  'Full loan payment',
  '2025-11-30'::TIMESTAMPTZ,
  NOW()
),

-- Payment 6: ERIC MUTHAMA - LN00006 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00006' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00006' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-12-06',
  'M-Pesa',
  'MPESA-REF-006',
  'Full loan payment',
  '2025-12-06'::TIMESTAMPTZ,
  NOW()
),

-- Payment 7: SAUMU OUMA - LN00007 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00007' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00007' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-12-07',
  'Cash',
  'CASH-REC-007',
  'Full loan payment',
  '2025-12-07'::TIMESTAMPTZ,
  NOW()
),

-- Payment 8: SEBASTIAN M PETER - LN00008 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00008' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00008' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-12-10',
  'M-Pesa',
  'MPESA-REF-008',
  'Full loan payment',
  '2025-12-10'::TIMESTAMPTZ,
  NOW()
),

-- Payment 9: ELIZABETH WAWERU KIDIGA - LN00009 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00009' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00009' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-12-13',
  'M-Pesa',
  'MPESA-REF-009',
  'Full loan payment',
  '2025-12-13'::TIMESTAMPTZ,
  NOW()
),

-- Payment 10: STEPHEN MULU NZAVI (2nd loan) - LN00012 - 55,000 paid
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00012' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  55000,
  50000,
  5000,
  '2025-12-01',
  'M-Pesa',
  'MPESA-REF-012',
  'Full loan payment - 2nd loan',
  '2025-12-01'::TIMESTAMPTZ,
  NOW()
),

-- ==========================================
-- PARTIAL PAYMENTS FOR OVERDUE LOANS
-- ==========================================

-- Payment 11: STEPHEN MULU NZAVI (3rd loan) - LN00010 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00010' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-11-27',
  'M-Pesa',
  'MPESA-REF-010-P1',
  'Partial payment on 3rd loan',
  '2025-11-27'::TIMESTAMPTZ,
  NOW()
),

-- Payment 12: ROONEY (2nd loan) - LN00011 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00011' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00010' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-05',
  'M-Pesa',
  'MPESA-REF-011-P1',
  'Partial payment',
  '2025-12-05'::TIMESTAMPTZ,
  NOW()
),

-- Payment 13: JOSPHAT M MATHEKA (2nd loan) - LN00013 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00013' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00003' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-11-30',
  'M-Pesa',
  'MPESA-REF-013-P1',
  'Partial payment',
  '2025-11-30'::TIMESTAMPTZ,
  NOW()
),

-- Payment 14: BEN K MBUVI (2nd loan) - LN00014 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00014' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00004' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-08',
  'Bank Transfer',
  'BANK-TXN-014-P1',
  'Partial payment',
  '2025-12-08'::TIMESTAMPTZ,
  NOW()
),

-- Payment 15: NATALIA THOMAS (2nd loan) - LN00015 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00015' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00005' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-15',
  'M-Pesa',
  'MPESA-REF-015-P1',
  'Partial payment',
  '2025-12-15'::TIMESTAMPTZ,
  NOW()
),

-- Payment 16: ERIC MUTHAMA (2nd loan) - LN00016 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00016' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00006' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-18',
  'M-Pesa',
  'MPESA-REF-016-P1',
  'Partial payment',
  '2025-12-18'::TIMESTAMPTZ,
  NOW()
),

-- Payment 17: SAUMU OUMA (2nd loan) - LN00017 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00017' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00007' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-20',
  'Cash',
  'CASH-REC-017-P1',
  'Partial payment',
  '2025-12-20'::TIMESTAMPTZ,
  NOW()
),

-- Payment 18: SEBASTIAN M PETER (2nd loan) - LN00018 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00018' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00008' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-22',
  'M-Pesa',
  'MPESA-REF-018-P1',
  'Partial payment',
  '2025-12-22'::TIMESTAMPTZ,
  NOW()
),

-- Payment 19: ELIZABETH WAWERU KIDIGA (2nd loan) - LN00019 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00019' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00009' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-25',
  'M-Pesa',
  'MPESA-REF-019-P1',
  'Partial payment',
  '2025-12-25'::TIMESTAMPTZ,
  NOW()
),

-- Payment 20: BEN K MBUVI (3rd loan) - LN00020 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00020' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00004' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-28',
  'M-Pesa',
  'MPESA-REF-020-P1',
  'Partial payment',
  '2025-12-28'::TIMESTAMPTZ,
  NOW()
),

-- Payment 21: STEPHEN MULU NZAVI (4th loan) - LN00021 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00021' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-30',
  'M-Pesa',
  'MPESA-REF-021-P1',
  'Partial payment on 4th loan',
  '2025-12-30'::TIMESTAMPTZ,
  NOW()
),

-- Payment 22: JACKSON KAMAU - LN00022 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00022' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00016' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-18',
  'M-Pesa',
  'MPESA-REF-022-P1',
  'Partial payment',
  '2025-12-18'::TIMESTAMPTZ,
  NOW()
),

-- Payment 23: MARY NJERI - LN00023 - Partial payment 21,600
(
  gen_random_uuid()::TEXT,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM loans WHERE loan_number = 'LN00023' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  (SELECT id FROM clients WHERE client_number = 'CL00017' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  21600,
  20000,
  1600,
  '2025-12-20',
  'Bank Transfer',
  'BANK-TXN-023-P1',
  'Partial payment',
  '2025-12-20'::TIMESTAMPTZ,
  NOW()
);

-- ==========================================
-- SUMMARY
-- ==========================================
-- Total Payments Imported: 23 records
-- - 10 full payments (closed loans): KSh 550,000
-- - 13 partial payments (overdue loans): KSh 280,800
-- Total Collections Amount: KSh 830,800
-- Payment Dates: November-December 2025
-- Payment Methods: M-Pesa (19), Bank Transfer (3), Cash (2)
