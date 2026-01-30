-- ============================================================================
-- DEFAULTED LOANS INSERT SCRIPT (FINAL - FIXED COLUMNS)
-- ============================================================================
-- This script inserts 4 defaulted loans with status 'default' and high days_in_arrears
-- Using only columns that exist in the loans table
-- ============================================================================

-- ============================================================================
-- DEFAULTED LOAN 1: Ben Mbuvi (CL00011) - Loan #5052
-- ============================================================================
INSERT INTO loans (
  id,
  loan_number,
  client_id,
  product_id,
  product_name,
  application_date,
  disbursement_date,
  amount,
  interest_rate,
  interest_type,
  loan_term,
  term_period,
  term_period_unit,
  total_interest,
  total_amount,
  installment_amount,
  disbursed_amount,
  amount_paid,
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
  arrears_amount,
  overdue_amount,
  penalty_amount,
  created_at,
  updated_at,
  organization_id
)
SELECT
  gen_random_uuid(),
  '5052',
  c.id,
  lp.id,
  lp.name,
  '2020-01-23',
  '2020-01-23',
  20000.00,
  10.0,
  'Flat',
  12,
  12,
  'months',
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
  'disbursed',
  'Monthly',
  0.00,
  0.00,
  1500,
  22000.00,
  22000.00,
  0.00,
  '2020-01-23',
  CURRENT_TIMESTAMP,
  c.organization_id
FROM clients c
CROSS JOIN loan_products lp
WHERE c.client_number = 'CL00011'  -- Ben Mbuvi
  AND lp.name = 'Personal Loan'
LIMIT 1;

-- ============================================================================
-- DEFAULTED LOAN 2: Stephen Mulu Nzwii (CL00002) - Loan #5044
-- ============================================================================
INSERT INTO loans (
  id,
  loan_number,
  client_id,
  product_id,
  product_name,
  application_date,
  disbursement_date,
  amount,
  interest_rate,
  interest_type,
  loan_term,
  term_period,
  term_period_unit,
  total_interest,
  total_amount,
  installment_amount,
  disbursed_amount,
  amount_paid,
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
  arrears_amount,
  overdue_amount,
  penalty_amount,
  created_at,
  updated_at,
  organization_id
)
SELECT
  gen_random_uuid(),
  '5044',
  c.id,
  lp.id,
  lp.name,
  '2020-01-23',
  '2020-01-23',
  200000.00,
  10.0,
  'Flat',
  12,
  12,
  'months',
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
  'disbursed',
  'Monthly',
  0.00,
  0.00,
  1500,
  220000.00,
  220000.00,
  0.00,
  '2020-01-23',
  CURRENT_TIMESTAMP,
  c.organization_id
FROM clients c
CROSS JOIN loan_products lp
WHERE c.client_number = 'CL00002'  -- Stephen Mulu Nzwii
  AND lp.name = 'Personal Loan'
LIMIT 1;

-- ============================================================================
-- DEFAULTED LOAN 3: Eric Muthama (CL00009) - Loan #5035
-- ============================================================================
INSERT INTO loans (
  id,
  loan_number,
  client_id,
  product_id,
  product_name,
  application_date,
  disbursement_date,
  amount,
  interest_rate,
  interest_type,
  loan_term,
  term_period,
  term_period_unit,
  total_interest,
  total_amount,
  installment_amount,
  disbursed_amount,
  amount_paid,
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
  arrears_amount,
  overdue_amount,
  penalty_amount,
  created_at,
  updated_at,
  organization_id
)
SELECT
  gen_random_uuid(),
  '5035',
  c.id,
  lp.id,
  lp.name,
  '2020-01-22',
  '2020-01-22',
  50000.00,
  10.0,
  'Flat',
  12,
  12,
  'months',
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
  'disbursed',
  'Monthly',
  0.00,
  0.00,
  1501,
  55000.00,
  55000.00,
  0.00,
  '2020-01-22',
  CURRENT_TIMESTAMP,
  c.organization_id
FROM clients c
CROSS JOIN loan_products lp
WHERE c.client_number = 'CL00009'  -- Eric Muthama
  AND lp.name = 'Personal Loan'
LIMIT 1;

-- ============================================================================
-- DEFAULTED LOAN 4: Josphat Matheka (CL00004) - Loan #5021
-- ============================================================================
INSERT INTO loans (
  id,
  loan_number,
  client_id,
  product_id,
  product_name,
  application_date,
  disbursement_date,
  amount,
  interest_rate,
  interest_type,
  loan_term,
  term_period,
  term_period_unit,
  total_interest,
  total_amount,
  installment_amount,
  disbursed_amount,
  amount_paid,
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
  arrears_amount,
  overdue_amount,
  penalty_amount,
  created_at,
  updated_at,
  organization_id
)
SELECT
  gen_random_uuid(),
  '5021',
  c.id,
  lp.id,
  lp.name,
  '2020-01-19',
  '2020-01-19',
  50000.00,
  10.0,
  'Flat',
  12,
  12,
  'months',
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
  'disbursed',
  'Monthly',
  0.00,
  0.00,
  1504,
  55000.00,
  55000.00,
  0.00,
  '2020-01-19',
  CURRENT_TIMESTAMP,
  c.organization_id
FROM clients c
CROSS JOIN loan_products lp
WHERE c.client_number = 'CL00004'  -- Josphat Matheka
  AND lp.name = 'Personal Loan'
LIMIT 1;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the defaulted loans were inserted correctly
SELECT 
  l.loan_number,
  c.first_name || ' ' || c.last_name as client_name,
  l.product_name,
  TO_CHAR(l.application_date, 'YYYY-MM-DD') as app_date,
  l.amount as principal_amount,
  l.total_interest,
  l.disbursed_amount,
  l.outstanding_balance,
  l.balance,
  l.total_balance,
  l.status,
  l.days_in_arrears,
  l.arrears_amount
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.loan_number IN ('5052', '5044', '5035', '5021')
ORDER BY l.loan_number;

-- Check total count
SELECT COUNT(*) as total_loans FROM loans;

-- Summary by status
SELECT 
  status,
  COUNT(*) as loan_count,
  SUM(outstanding_balance) as total_outstanding
FROM loans
GROUP BY status
ORDER BY status;
