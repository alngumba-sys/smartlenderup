-- ============================================================================
-- INSERT 4 DEFAULTED LOANS (USING ACTUAL SCHEMA)
-- ============================================================================
-- Based on the actual loans table columns from IMPORT_DATA_READY.sql
-- Columns: id, organization_id, client_id, loan_number, amount, interest_rate,
--          term_period, term_period_unit, repayment_frequency, total_amount,
--          balance, amount_paid, application_date, disbursement_date,
--          maturity_date, expected_repayment_date, phase, status, 
--          created_at, updated_at
-- ============================================================================

-- Get your organization_id first
-- SELECT id FROM organizations WHERE name = 'BV Funguo Ltd';
-- Replace 'YOUR_ORG_ID' below with your actual organization ID

-- ============================================================================
-- DEFAULTED LOAN 1: Ben Mbuvi (CL00011) - Loan #5052 - KES 20,000
-- ============================================================================
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
) VALUES (
  gen_random_uuid(),
  (SELECT organization_id FROM clients WHERE client_number = 'CL00011' LIMIT 1),
  (SELECT id FROM clients WHERE client_number = 'CL00011' LIMIT 1),
  '5052',
  20000,
  10.0,
  12,
  'months',
  'Monthly',
  22000,
  22000,
  0,
  '2020-01-23',
  '2020-01-23',
  '2021-01-23',
  '2020-02-23',
  'disbursed',
  'default',
  '2020-01-23',
  NOW()
);

-- ============================================================================
-- DEFAULTED LOAN 2: Stephen Mulu Nzwii (CL00002) - Loan #5044 - KES 200,000
-- ============================================================================
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
) VALUES (
  gen_random_uuid(),
  (SELECT organization_id FROM clients WHERE client_number = 'CL00002' LIMIT 1),
  (SELECT id FROM clients WHERE client_number = 'CL00002' LIMIT 1),
  '5044',
  200000,
  10.0,
  12,
  'months',
  'Monthly',
  220000,
  220000,
  0,
  '2020-01-23',
  '2020-01-23',
  '2021-01-23',
  '2020-02-23',
  'disbursed',
  'default',
  '2020-01-23',
  NOW()
);

-- ============================================================================
-- DEFAULTED LOAN 3: Eric Muthama (CL00009) - Loan #5035 - KES 50,000
-- ============================================================================
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
) VALUES (
  gen_random_uuid(),
  (SELECT organization_id FROM clients WHERE client_number = 'CL00009' LIMIT 1),
  (SELECT id FROM clients WHERE client_number = 'CL00009' LIMIT 1),
  '5035',
  50000,
  10.0,
  12,
  'months',
  'Monthly',
  55000,
  55000,
  0,
  '2020-01-22',
  '2020-01-22',
  '2021-01-22',
  '2020-02-22',
  'disbursed',
  'default',
  '2020-01-22',
  NOW()
);

-- ============================================================================
-- DEFAULTED LOAN 4: Josphat Matheka (CL00004) - Loan #5021 - KES 50,000
-- ============================================================================
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
) VALUES (
  gen_random_uuid(),
  (SELECT organization_id FROM clients WHERE client_number = 'CL00004' LIMIT 1),
  (SELECT id FROM clients WHERE client_number = 'CL00004' LIMIT 1),
  '5021',
  50000,
  10.0,
  12,
  'months',
  'Monthly',
  55000,
  55000,
  0,
  '2020-01-19',
  '2020-01-19',
  '2021-01-19',
  '2020-02-19',
  'disbursed',
  'default',
  '2020-01-19',
  NOW()
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if loans were inserted
SELECT 
  l.loan_number,
  c.first_name || ' ' || c.last_name as client_name,
  l.amount,
  l.total_amount,
  l.balance,
  l.status,
  TO_CHAR(l.application_date, 'YYYY-MM-DD') as app_date
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.loan_number IN ('5052', '5044', '5035', '5021')
ORDER BY l.loan_number;

-- Total count
SELECT COUNT(*) as total_loans FROM loans;

-- By status
SELECT 
  status,
  COUNT(*) as count,
  SUM(balance) as total_balance
FROM loans
GROUP BY status
ORDER BY status;
