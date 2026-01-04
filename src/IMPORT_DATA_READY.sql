-- =====================================================
-- SmartLenderUp Data Import SQL - READY TO RUN
-- Organization ID: 958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9
-- 23 Historical Loan Records with Borrowers & Guarantors
-- =====================================================

-- INSTRUCTIONS:
-- 1. Copy this ENTIRE file
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run" or press Ctrl+Enter
-- 4. Wait 5-10 seconds for completion

-- =====================================================
-- STEP 1: INSERT CLIENTS (Borrowers) - UNIQUE ONLY
-- =====================================================

INSERT INTO clients (
  id, 
  organization_id, 
  client_number, 
  first_name, 
  last_name, 
  name, 
  phone, 
  id_number, 
  status, 
  kyc_status, 
  verification_status, 
  created_at, 
  updated_at
) VALUES
-- CL00001: STEPHEN MULU NZAVI (appears 4 times - multiple loans)
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00001', 'STEPHEN', 'MULU NZAVI', 'STEPHEN MULU NZAVI', '721861725', '11376836', 'active', 'approved', 'verified', '2025-10-27', NOW()),

-- CL00002: ROONEY
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00002', 'ROONEY', '', 'ROONEY', '725481920', NULL, 'active', 'approved', 'verified', '2025-10-28', NOW()),

-- CL00003: JOSPHAT M MATHEKA (appears 2 times)
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00003', 'JOSPHAT', 'M MATHEKA', 'JOSPHAT M MATHEKA', '724314868', NULL, 'active', 'approved', 'verified', '2025-10-23', NOW()),

-- CL00004: BEN K MBUVI (appears 3 times)
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00004', 'BEN', 'K MBUVI', 'BEN K MBUVI', '722798702', '10879661', 'active', 'approved', 'verified', '2025-10-28', NOW()),

-- CL00005: NATALIA THOMAS
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00005', 'NATALIA', 'THOMAS', 'NATALIA THOMAS', '714239823', '31490174', 'active', 'approved', 'verified', '2025-10-31', NOW()),

-- CL00006: ERIC MUTHAMA (appears 2 times)
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00006', 'ERIC', 'MUTHAMA', 'ERIC MUTHAMA', '727266009', '25267113', 'active', 'approved', 'verified', '2025-11-06', NOW()),

-- CL00007: SAUMU OUMA
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00007', 'SAUMU', 'OUMA', 'SAUMU OUMA', NULL, NULL, 'active', 'approved', 'verified', '2025-11-07', NOW()),

-- CL00008: SEBASTIAN M PETER
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00008', 'SEBASTIAN', 'M PETER', 'SEBASTIAN M PETER', '725707944', '25225003', 'active', 'approved', 'verified', '2025-11-10', NOW()),

-- CL00009: ELIZABETH WAWERU KIDIGA
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00009', 'ELIZABETH', 'WAWERU KIDIGA', 'ELIZABETH WAWERU KIDIGA', '718764331', '22000875', 'active', 'approved', 'verified', '2025-11-13', NOW()),

-- CL00010: GEORGE KAWAYA
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00010', 'GEORGE', 'KAWAYA', 'GEORGE KAWAYA', '768374146', NULL, 'active', 'approved', 'verified', '2025-11-20', NOW()),

-- CL00011: YUSUF OLELA OMONDI
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00011', 'YUSUF', 'OLELA OMONDI', 'YUSUF OLELA OMONDI', '742100886', '12508228', 'active', 'approved', 'verified', '2025-12-03', NOW()),

-- CL00012: KIFARU SAMSOM MASHA
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00012', 'KIFARU', 'SAMSOM MASHA', 'KIFARU SAMSOM MASHA', '708875888', '13143767', 'active', 'approved', 'verified', '2025-12-03', NOW()),

-- CL00013: OLIVINE INVESTMENTS LTD
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00013', 'OLIVINE', 'INVESTMENTS LTD', 'OLIVINE INVESTMENTS LTD', NULL, NULL, 'active', 'approved', 'verified', '2025-12-03', NOW()),

-- CL00014: BLOOMING BUD CENTER
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00014', 'BLOOMING', 'BUD CENTER', 'BLOOMING BUD CENTER', '726948793', '24090458', 'active', 'approved', 'verified', '2025-12-05', NOW()),

-- CL00015: BENSON NJOROGE
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00015', 'BENSON', 'NJOROGE', 'BENSON NJOROGE', '720244602', NULL, 'active', 'approved', 'verified', '2025-12-22', NOW()),

-- CL00016: GEOFREY ROGERS KILEMBA
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00016', 'GEOFREY', 'ROGERS KILEMBA', 'GEOFREY ROGERS KILEMBA', '724046842', '23260758', 'active', 'approved', 'verified', '2025-12-22', NOW()),

-- CL00017: JAMES MBUVI
(gen_random_uuid(), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'CL00017', 'JAMES', 'MBUVI', 'JAMES MBUVI', '724046842', '23260758', 'active', 'approved', 'verified', '2025-12-24', NOW());


-- =====================================================
-- STEP 2: INSERT LOANS (All 23 Records)
-- =====================================================

INSERT INTO loans (
  id,
  organization_id,
  client_id,
  loan_number,
  amount,
  interest_rate,
  term_period,
  term_period_unit,
  repayment_frequency,
  total_amount,
  balance,
  amount_paid,
  application_date,
  disbursement_date,
  maturity_date,
  expected_repayment_date,
  phase,
  status,
  created_at,
  updated_at
) VALUES

-- Loan 1: STEPHEN MULU NZAVI - 50,000 @ 10% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00001',
  50000,
  10.0,
  1,
  'months',
  'monthly',
  55000,
  0,
  55000,
  '2025-10-27',
  '2025-10-27',
  '2025-11-27',
  '2025-11-27',
  5,
  'closed',
  '2025-10-27',
  NOW()
),

-- Loan 2: ROONEY - 50,000 @ 10% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00002' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00002',
  50000,
  10.0,
  1,
  'months',
  'monthly',
  55000,
  0,
  55000,
  '2025-10-28',
  '2025-10-28',
  '2025-11-30',
  '2025-11-30',
  5,
  'closed',
  '2025-10-28',
  NOW()
),

-- Loan 3: JOSPHAT M MATHEKA - 250,000 @ 10% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00003' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00003',
  250000,
  10.0,
  1,
  'months',
  'monthly',
  275000,
  0,
  275000,
  '2025-10-23',
  '2025-10-23',
  '2025-11-23',
  '2025-11-23',
  5,
  'closed',
  '2025-10-23',
  NOW()
),

-- Loan 4: BEN K MBUVI - 50,000 @ 10% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00004' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00004',
  50000,
  10.0,
  1,
  'months',
  'monthly',
  55000,
  0,
  55000,
  '2025-10-28',
  '2025-10-28',
  '2025-11-30',
  '2025-11-30',
  5,
  'closed',
  '2025-10-28',
  NOW()
),

-- Loan 5: NATALIA THOMAS - 100,000 @ 5% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00005' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00005',
  100000,
  5.0,
  1,
  'months',
  'monthly',
  105000,
  0,
  105000,
  '2025-10-31',
  '2025-10-31',
  '2025-11-30',
  '2025-11-30',
  5,
  'closed',
  '2025-10-31',
  NOW()
),

-- Loan 6: JOSPHAT M MATHEKA (Sister) - 50,000 @ 5% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00003' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00006',
  50000,
  5.0,
  1,
  'months',
  'monthly',
  52500,
  0,
  52500,
  '2025-11-03',
  '2025-11-03',
  '2025-12-18',
  '2025-12-18',
  5,
  'closed',
  '2025-11-03',
  NOW()
),

-- Loan 7: ERIC MUTHAMA - 100,000 @ 10% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00006' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00007',
  100000,
  10.0,
  1,
  'months',
  'monthly',
  110000,
  0,
  110000,
  '2025-11-06',
  '2025-11-06',
  '2025-12-06',
  '2025-12-06',
  5,
  'closed',
  '2025-11-06',
  NOW()
),

-- Loan 8: SAUMU OUMA - 30,000 @ 5% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00007' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00008',
  30000,
  5.0,
  1,
  'months',
  'monthly',
  31500,
  0,
  31500,
  '2025-11-07',
  '2025-11-07',
  '2025-12-07',
  '2025-12-07',
  5,
  'closed',
  '2025-11-07',
  NOW()
),

-- Loan 9: SEBASTIAN M PETER - 75,000 @ 5% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00008' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00009',
  75000,
  5.0,
  1,
  'months',
  'monthly',
  78750,
  0,
  78750,
  '2025-11-10',
  '2025-11-10',
  '2025-12-10',
  '2025-12-10',
  5,
  'closed',
  '2025-11-10',
  NOW()
),

-- Loan 10: ELIZABETH WAWERU KIDIGA - 100,000 @ 10% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00009' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00010',
  100000,
  10.0,
  1,
  'months',
  'monthly',
  110000,
  0,
  110000,
  '2025-11-13',
  '2025-11-13',
  '2025-12-12',
  '2025-12-12',
  5,
  'closed',
  '2025-11-13',
  NOW()
),

-- Loan 11: GEORGE KAWAYA - 50,000 @ 10% 90 Days - OVERDUE (Outstanding: -43,400)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00010' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00011',
  50000,
  10.0,
  3,
  'months',
  'monthly',
  65000,
  -43400,
  21600,
  '2025-11-20',
  '2025-11-20',
  '2026-02-20',
  '2026-02-20',
  5,
  'overdue',
  '2025-11-20',
  NOW()
),

-- Loan 12: STEPHEN MULU NZAVI (2nd) - 50,000 @ 10% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00012',
  50000,
  10.0,
  1,
  'months',
  'monthly',
  55000,
  0,
  55000,
  '2025-11-29',
  '2025-11-29',
  '2025-12-29',
  '2025-12-29',
  5,
  'closed',
  '2025-11-29',
  NOW()
),

-- Loan 13: YUSUF OLELA OMONDI - 200,000 @ 10% 60 Days - OVERDUE (Outstanding: -240,000)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00011' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00013',
  200000,
  10.0,
  2,
  'months',
  'monthly',
  240000,
  -240000,
  0,
  '2025-12-03',
  '2025-12-03',
  '2026-01-03',
  '2026-01-03',
  5,
  'overdue',
  '2025-12-03',
  NOW()
),

-- Loan 14: KIFARU SAMSOM MASHA - 40,000 @ 10% - OVERDUE (Outstanding: -44,000)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00012' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00014',
  40000,
  10.0,
  1,
  'months',
  'monthly',
  44000,
  -44000,
  0,
  '2025-12-03',
  '2025-12-03',
  '2026-01-03',
  '2026-01-03',
  5,
  'overdue',
  '2025-12-03',
  NOW()
),

-- Loan 15: OLIVINE INVESTMENTS LTD - 150,000 @ 2.5% 90 Days - OVERDUE (Outstanding: -161,250)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00013' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00015',
  150000,
  2.5,
  3,
  'months',
  'monthly',
  161250,
  -161250,
  0,
  '2025-12-03',
  '2025-12-03',
  '2026-03-03',
  '2026-03-03',
  5,
  'overdue',
  '2025-12-03',
  NOW()
),

-- Loan 16: STEPHEN MULU NZAVI (3rd) - 100,000 @ 10% - FULLY PAID
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00016',
  100000,
  10.0,
  1,
  'months',
  'monthly',
  110000,
  0,
  110000,
  '2025-12-03',
  '2025-12-03',
  '2026-01-03',
  '2026-01-03',
  5,
  'closed',
  '2025-12-03',
  NOW()
),

-- Loan 17: BLOOMING BUD CENTER - 200,000 @ 2.5% 90 Days - OVERDUE (Outstanding: -215,000)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00014' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00017',
  200000,
  2.5,
  3,
  'months',
  'monthly',
  215000,
  -215000,
  0,
  '2025-12-05',
  '2025-12-05',
  '2026-03-05',
  '2026-03-05',
  5,
  'overdue',
  '2025-12-05',
  NOW()
),

-- Loan 18: ERIC MUTHAMA (2nd) - 150,000 @ 10% - OVERDUE (Outstanding: -165,000)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00006' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00018',
  150000,
  10.0,
  1,
  'months',
  'monthly',
  165000,
  -165000,
  0,
  '2025-12-17',
  '2025-12-17',
  '2026-01-30',
  '2026-01-30',
  5,
  'overdue',
  '2025-12-17',
  NOW()
),

-- Loan 19: BEN K MBUVI (2nd) - 100,000 @ 10% - OVERDUE (Outstanding: -110,000)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00004' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00019',
  100000,
  10.0,
  1,
  'months',
  'monthly',
  110000,
  -110000,
  0,
  '2025-12-22',
  '2025-12-22',
  '2026-01-30',
  '2026-01-30',
  5,
  'overdue',
  '2025-12-22',
  NOW()
),

-- Loan 20: BENSON NJOROGE - 200,000 @ 10% - OVERDUE (Outstanding: -220,000)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00015' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00020',
  200000,
  10.0,
  1,
  'months',
  'monthly',
  220000,
  -220000,
  0,
  '2025-12-22',
  '2025-12-22',
  '2026-01-30',
  '2026-01-30',
  5,
  'overdue',
  '2025-12-22',
  NOW()
),

-- Loan 21: GEOFREY ROGERS KILEMBA - 20,000 @ 10% - OVERDUE (Outstanding: -22,000)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00016' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00021',
  20000,
  10.0,
  1,
  'months',
  'monthly',
  22000,
  -22000,
  0,
  '2025-12-22',
  '2025-12-22',
  '2026-01-30',
  '2026-01-30',
  5,
  'overdue',
  '2025-12-22',
  NOW()
),

-- Loan 22: STEPHEN MULU NZAVI (4th) - 100,000 @ 10% - OVERDUE (Outstanding: -110,000)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00022',
  100000,
  10.0,
  1,
  'months',
  'monthly',
  110000,
  -110000,
  0,
  '2025-12-23',
  '2025-12-23',
  '2026-01-30',
  '2026-01-30',
  5,
  'overdue',
  '2025-12-23',
  NOW()
),

-- Loan 23: JAMES MBUVI - 50,000 @ 7.5% 60 Days - OVERDUE (Outstanding: -57,500)
(
  gen_random_uuid(),
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  (SELECT id FROM clients WHERE client_number = 'CL00017' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'),
  'LN00023',
  50000,
  7.5,
  2,
  'months',
  'monthly',
  57500,
  -57500,
  0,
  '2025-12-24',
  '2025-12-24',
  '2026-02-28',
  '2026-02-28',
  5,
  'overdue',
  '2025-12-24',
  NOW()
);


-- =====================================================
-- STEP 3: INSERT GUARANTORS (23 Records)
-- =====================================================

INSERT INTO loan_guarantors (
  id,
  loan_id,
  guarantor_name,
  guarantor_id_number,
  guarantor_phone,
  relationship_to_client,
  consent_given,
  created_at
) VALUES

-- Guarantor for Loan 1 (STEPHEN MULU NZAVI #1)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'VICTOR K MUTHAMA', '22195225', '723627992', 'Guarantor', true, NOW()),

-- Guarantor for Loan 2 (ROONEY)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00002' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'JOSPHAT M MATHEKA', 'N/A', '724314868', 'Guarantor', true, NOW()),

-- Guarantor for Loan 3 (JOSPHAT M MATHEKA #1)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00003' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'JOSPHAT M MATHEKA', 'N/A', '724314868', 'Guarantor', true, NOW()),

-- Guarantor for Loan 4 (BEN K MBUVI #1)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00004' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'BEN K MBUVI', '10879661', '722798702', 'Guarantor', true, NOW()),

-- Guarantor for Loan 5 (NATALIA THOMAS)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00005' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'JOSPHAT M MATHEKA', 'N/A', '724314868', 'Guarantor', true, NOW()),

-- Guarantor for Loan 6 (JOSPHAT M MATHEKA #2 - Sister)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00006' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'JOSPHAT M MATHEKA', 'N/A', '724314868', 'Guarantor', true, NOW()),

-- Guarantor for Loan 7 (ERIC MUTHAMA #1)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00007' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'VICTOR K MUTHAMA', '22195225', '723627992', 'Guarantor', true, NOW()),

-- Guarantor for Loan 8 (SAUMU OUMA)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00008' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'JOSPHAT M MATHEKA', 'N/A', '724314868', 'Guarantor', true, NOW()),

-- Guarantor for Loan 9 (SEBASTIAN M PETER)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00009' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'JOSPHAT M MATHEKA', 'N/A', '724314868', 'Guarantor', true, NOW()),

-- Guarantor for Loan 10 (ELIZABETH WAWERU KIDIGA)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00010' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'VICTOR K MUTHAMA', '22195225', '723627992', 'Guarantor', true, NOW()),

-- Guarantor for Loan 11 (GEORGE KAWAYA) - CAR COLLATERAL
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00011' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'CAR - KBJ 728Z', 'NZE121-0168610', '1NZ-1045029', 'Collateral', false, NOW()),

-- Guarantor for Loan 12 (STEPHEN MULU NZAVI #2)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00012' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'VICTOR K MUTHAMA', '22195225', '723627991', 'Guarantor', true, NOW()),

-- Guarantor for Loan 13 (YUSUF OLELA OMONDI)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00013' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'VICTOR K MUTHAMA', '22195225', '723627991', 'Guarantor', false, NOW()),

-- Guarantor for Loan 14 (KIFARU SAMSOM MASHA)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00014' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'YUSUF OLELA', '12508228', '742100886', 'Guarantor', false, NOW()),

-- Guarantor for Loan 15 (OLIVINE INVESTMENTS LTD)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00015' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'KAMENE NDEVENI', '10878262', '728330108', 'Guarantor', false, NOW()),

-- Guarantor for Loan 16 (STEPHEN MULU NZAVI #3)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00016' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'VICTOR K MUTHAMA', '22195225', '723627991', 'Guarantor', true, NOW()),

-- Guarantor for Loan 17 (BLOOMING BUD CENTER)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00017' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'BILLY BOSTON ANYONYI', '24090458', '726948793', 'Guarantor', false, NOW()),

-- Guarantor for Loan 18 (ERIC MUTHAMA #2)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00018' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'VICTOR K MUTHAMA', '22195225', '723627992', 'Guarantor', false, NOW()),

-- Guarantor for Loan 19 (BEN K MBUVI #2)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00019' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'BEN K MBUVI', '10879661', '722798702', 'Guarantor', false, NOW()),

-- Guarantor for Loan 20 (BENSON NJOROGE)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00020' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'VICTOR K MUTHAMA', '22195225', '723627992', 'Guarantor', false, NOW()),

-- Guarantor for Loan 21 (GEOFREY ROGERS KILEMBA) - POST DATED CHEQUE
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00021' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'SELF - PD CHEQUE', '23260758', '724046842', 'Self Guarantee', false, NOW()),

-- Guarantor for Loan 22 (STEPHEN MULU NZAVI #4)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00022' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'BEN K MBUVI', '21019115', '720300339', 'Guarantor', false, NOW()),

-- Guarantor for Loan 23 (JAMES MBUVI)
(gen_random_uuid(), (SELECT id FROM loans WHERE loan_number = 'LN00023' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'), 'BEN K MBUVI', '21019115', '720300339', 'Guarantor', false, NOW());


-- =====================================================
-- VERIFICATION QUERIES (Run these to confirm import)
-- =====================================================

-- Check clients imported
SELECT client_number, name, phone, id_number, status 
FROM clients 
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY client_number;

-- Check loans imported
SELECT loan_number, amount, interest_rate, total_amount, balance, status 
FROM loans 
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY loan_number;

-- Check guarantors imported
SELECT g.guarantor_name, g.guarantor_phone, l.loan_number
FROM loan_guarantors g
JOIN loans l ON g.loan_id = l.id
WHERE l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY l.loan_number;

-- Summary statistics
SELECT 
  COUNT(*) as total_loans,
  SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_loans,
  SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_loans,
  SUM(amount) as total_principal,
  SUM(balance) as total_outstanding
FROM loans 
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';