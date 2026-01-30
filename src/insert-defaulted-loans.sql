-- ============================================================================
-- DEFAULTED LOANS INSERT SCRIPT
-- ============================================================================
-- This script inserts 4 defaulted loans into the loans table
-- All loans have status 'default' which will be capitalized to 'Default'
-- With days_in_arrears >= 90, they will appear in the Defaulted tab
-- ============================================================================

-- First, let's verify the client IDs we need:
-- Ramona Ndungu - Client NRC: 20034554
-- Stephen Mtutu Nzwii - Client NRC: H376839
-- Ben Mbevi - (multiple loans)

-- ============================================================================
-- DEFAULTED LOAN 1: Ramona Ndungu - Loan #5052
-- ============================================================================
INSERT INTO loans (
  id,
  loan_number,
  client_id,
  client_name,
  product_id,
  product_name,
  application_date,
  disbursement_date,
  principal_amount,
  interest_rate,
  interest_type,
  loan_term,
  term_unit,
  total_interest,
  total_repayable,
  installment_amount,
  disbursed_amount,
  paid_amount,
  outstanding_balance,
  balance,
  penalty_balance,
  total_balance,
  status,
  approval_status,
  repayment_frequency,
  facilitation_fee,
  processing_fee,
  days_in_arrears,
  created_at,
  updated_at,
  organization_id
)
SELECT
  gen_random_uuid(),
  '5052',
  c.id,
  c.first_name || ' ' || c.last_name,
  lp.id,
  'PERSONAL LOAN',
  '2020-01-23T00:00:00Z',
  '2020-01-23T00:00:00Z',
  20000.00,
  10.0,
  'Flat',
  12,
  'Months',
  2000.00,
  22000.00,
  1833.33,
  20000.00,
  0.00,
  22000.00,
  22000.00,
  0.00,
  22000.00,
  'default',
  'Disbursed',
  'Monthly',
  0.00,
  0.00,
  1500,
  '2020-01-23T00:00:00Z',
  CURRENT_TIMESTAMP,
  c.organization_id
FROM clients c
CROSS JOIN loan_products lp
WHERE c.client_number = 'CL00013'  -- Ramona Ndungu
  AND lp.name = 'Personal Loan'
LIMIT 1;

-- ============================================================================
-- DEFAULTED LOAN 2: Stephen Mtutu Nzwii - Loan #5044
-- ============================================================================
INSERT INTO loans (
  id,
  loan_number,
  client_id,
  client_name,
  product_id,
  product_name,
  application_date,
  disbursement_date,
  principal_amount,
  interest_rate,
  interest_type,
  loan_term,
  term_unit,
  total_interest,
  total_repayable,
  installment_amount,
  disbursed_amount,
  paid_amount,
  outstanding_balance,
  balance,
  penalty_balance,
  total_balance,
  status,
  approval_status,
  repayment_frequency,
  facilitation_fee,
  processing_fee,
  days_in_arrears,
  created_at,
  updated_at,
  organization_id
)
SELECT
  gen_random_uuid(),
  '5044',
  c.id,
  c.first_name || ' ' || c.last_name,
  lp.id,
  'PERSONAL LOAN',
  '2020-01-23T00:00:00Z',
  '2020-01-23T00:00:00Z',
  200000.00,
  10.0,
  'Flat',
  12,
  'Months',
  20000.00,
  220000.00,
  18333.33,
  200000.00,
  0.00,
  220000.00,
  220000.00,
  0.00,
  220000.00,
  'default',
  'Disbursed',
  'Monthly',
  0.00,
  0.00,
  1500,
  '2020-01-23T00:00:00Z',
  CURRENT_TIMESTAMP,
  c.organization_id
FROM clients c
CROSS JOIN loan_products lp
WHERE c.client_number = 'CL00016'  -- Stephen Mtutu Nzwii
  AND lp.name = 'Personal Loan'
LIMIT 1;

-- ============================================================================
-- DEFAULTED LOAN 3: Ben Mbevi - Loan #5035
-- ============================================================================
INSERT INTO loans (
  id,
  loan_number,
  client_id,
  client_name,
  product_id,
  product_name,
  application_date,
  disbursement_date,
  principal_amount,
  interest_rate,
  interest_type,
  loan_term,
  term_unit,
  total_interest,
  total_repayable,
  installment_amount,
  disbursed_amount,
  paid_amount,
  outstanding_balance,
  balance,
  penalty_balance,
  total_balance,
  status,
  approval_status,
  repayment_frequency,
  facilitation_fee,
  processing_fee,
  days_in_arrears,
  created_at,
  updated_at,
  organization_id
)
SELECT
  gen_random_uuid(),
  '5035',
  c.id,
  c.first_name || ' ' || c.last_name,
  lp.id,
  'PERSONAL LOAN',
  '2020-01-22T00:00:00Z',
  '2020-01-22T00:00:00Z',
  50000.00,
  10.0,
  'Flat',
  12,
  'Months',
  5000.00,
  55000.00,
  4583.33,
  50000.00,
  0.00,
  55000.00,
  55000.00,
  0.00,
  55000.00,
  'default',
  'Disbursed',
  'Monthly',
  0.00,
  0.00,
  1501,
  '2020-01-22T00:00:00Z',
  CURRENT_TIMESTAMP,
  c.organization_id
FROM clients c
CROSS JOIN loan_products lp
WHERE c.client_number = 'CL00005'  -- Ben Mbevi
  AND lp.name = 'Personal Loan'
LIMIT 1;

-- ============================================================================
-- DEFAULTED LOAN 4: Ben Mbevi - Loan #5021
-- ============================================================================
INSERT INTO loans (
  id,
  loan_number,
  client_id,
  client_name,
  product_id,
  product_name,
  application_date,
  disbursement_date,
  principal_amount,
  interest_rate,
  interest_type,
  loan_term,
  term_unit,
  total_interest,
  total_repayable,
  installment_amount,
  disbursed_amount,
  paid_amount,
  outstanding_balance,
  balance,
  penalty_balance,
  total_balance,
  status,
  approval_status,
  repayment_frequency,
  facilitation_fee,
  processing_fee,
  days_in_arrears,
  created_at,
  updated_at,
  organization_id
)
SELECT
  gen_random_uuid(),
  '5021',
  c.id,
  c.first_name || ' ' || c.last_name,
  lp.id,
  'PERSONAL LOAN',
  '2020-01-19T00:00:00Z',
  '2020-01-19T00:00:00Z',
  50000.00,
  10.0,
  'Flat',
  12,
  'Months',
  5000.00,
  55000.00,
  4583.33,
  50000.00,
  0.00,
  55000.00,
  55000.00,
  0.00,
  55000.00,
  'default',
  'Disbursed',
  'Monthly',
  0.00,
  0.00,
  1504,
  '2020-01-19T00:00:00Z',
  CURRENT_TIMESTAMP,
  c.organization_id
FROM clients c
CROSS JOIN loan_products lp
WHERE c.client_number = 'CL00005'  -- Ben Mbevi
  AND lp.name = 'Personal Loan'
LIMIT 1;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the defaulted loans were inserted correctly
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

-- Summary
SELECT 
  status,
  COUNT(*) as loan_count,
  SUM(outstanding_balance) as total_outstanding
FROM loans
WHERE status IN ('Written Off', 'Default / Past Due')
GROUP BY status;