-- =====================================================
-- SmartLenderUp - ADD LOAN PRODUCTS & UPDATE LOANS
-- Organization ID: 958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9
-- Run this AFTER the initial import is complete
-- =====================================================

-- INSTRUCTIONS:
-- 1. This file adds loan products and updates existing loans
-- 2. It will NOT overwrite your existing data
-- 3. Copy this ENTIRE file and paste into Supabase SQL Editor
-- 4. Click "Run" or press Ctrl+Enter

-- =====================================================
-- STEP 1: CREATE LOAN PRODUCTS (7 Unique Products)
-- =====================================================

-- Product 1: 10% Interest - 30 Days (Most Common)
INSERT INTO loan_products (
  organization_id,
  product_name,
  name,
  description,
  min_amount,
  max_amount,
  interest_rate,
  min_term,
  max_term,
  term_unit,
  processing_fee_percentage,
  guarantor_required,
  collateral_required,
  status
) VALUES (
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  'Product 1 - Quick Loan 30D',
  'Product 1 - Quick Loan 30D',
  '10% interest rate with 30 days repayment period',
  20000,
  250000,
  10.0,
  1,
  1,
  'Months',
  0,
  false,
  false,
  'Active'
);

-- Product 2: 5% Interest - 30 Days
INSERT INTO loan_products (
  organization_id,
  product_name,
  name,
  description,
  min_amount,
  max_amount,
  interest_rate,
  min_term,
  max_term,
  term_unit,
  processing_fee_percentage,
  guarantor_required,
  collateral_required,
  status
) VALUES (
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  'Product 2 - Budget Loan 30D',
  'Product 2 - Budget Loan 30D',
  '5% interest rate with 30 days repayment period',
  30000,
  100000,
  5.0,
  1,
  1,
  'Months',
  0,
  false,
  false,
  'Active'
);

-- Product 3: 5% Interest - 15 Days
INSERT INTO loan_products (
  organization_id,
  product_name,
  name,
  description,
  min_amount,
  max_amount,
  interest_rate,
  min_term,
  max_term,
  term_unit,
  processing_fee_percentage,
  guarantor_required,
  collateral_required,
  status
) VALUES (
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  'Product 3 - Express Loan 15D',
  'Product 3 - Express Loan 15D',
  '5% interest rate with 15 days repayment period',
  30000,
  75000,
  5.0,
  1,
  1,
  'Months',
  0,
  false,
  false,
  'Active'
);

-- Product 4: 10% Interest - 90 Days
INSERT INTO loan_products (
  organization_id,
  product_name,
  name,
  description,
  min_amount,
  max_amount,
  interest_rate,
  min_term,
  max_term,
  term_unit,
  processing_fee_percentage,
  guarantor_required,
  collateral_required,
  status
) VALUES (
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  'Product 4 - Extended Loan 90D',
  'Product 4 - Extended Loan 90D',
  '10% interest rate with 90 days (3 months) repayment period',
  50000,
  200000,
  10.0,
  3,
  3,
  'Months',
  0,
  false,
  false,
  'Active'
);

-- Product 5: 10% Interest - 60 Days
INSERT INTO loan_products (
  organization_id,
  product_name,
  name,
  description,
  min_amount,
  max_amount,
  interest_rate,
  min_term,
  max_term,
  term_unit,
  processing_fee_percentage,
  guarantor_required,
  collateral_required,
  status
) VALUES (
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  'Product 5 - Standard Loan 60D',
  'Product 5 - Standard Loan 60D',
  '10% interest rate with 60 days (2 months) repayment period',
  50000,
  200000,
  10.0,
  2,
  2,
  'Months',
  0,
  false,
  false,
  'Active'
);

-- Product 6: 2.5% Interest - 90 Days
INSERT INTO loan_products (
  organization_id,
  product_name,
  name,
  description,
  min_amount,
  max_amount,
  interest_rate,
  min_term,
  max_term,
  term_unit,
  processing_fee_percentage,
  guarantor_required,
  collateral_required,
  status
) VALUES (
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  'Product 6 - Business Loan 90D',
  'Product 6 - Business Loan 90D',
  '2.5% interest rate with 90 days (3 months) repayment period for business clients',
  150000,
  500000,
  2.5,
  3,
  3,
  'Months',
  0,
  false,
  false,
  'Active'
);

-- Product 7: 7.5% Interest - 60 Days
INSERT INTO loan_products (
  organization_id,
  product_name,
  name,
  description,
  min_amount,
  max_amount,
  interest_rate,
  min_term,
  max_term,
  term_unit,
  processing_fee_percentage,
  guarantor_required,
  collateral_required,
  status
) VALUES (
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  'Product 7 - Flexible Loan 60D',
  'Product 7 - Flexible Loan 60D',
  '7.5% interest rate with 60 days (2 months) repayment period',
  50000,
  100000,
  7.5,
  2,
  2,
  'Months',
  0,
  false,
  false,
  'Active'
);


-- =====================================================
-- STEP 2: UPDATE LOANS WITH PRODUCT_ID & INTEREST_AMOUNT
-- =====================================================

-- Update Loan LN00001: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00001' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00002: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00002' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00003: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00003' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00004: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00004' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00005: 5% - 30 Days (Product 2)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 2 - Budget Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00005' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00006: 5% - 15 Days (Product 3)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 3 - Express Loan 15D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00006' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00007: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00007' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00008: 5% - 15 Days (Product 3)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 3 - Express Loan 15D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00008' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00009: 5% - 15 Days (Product 3)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 3 - Express Loan 15D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00009' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00010: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00010' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00011: 10% - 90 Days (Product 4)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 4 - Extended Loan 90D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00011' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00012: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00012' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00013: 10% - 60 Days (Product 5)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 5 - Standard Loan 60D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00013' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00014: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00014' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00015: 2.5% - 90 Days (Product 6)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 6 - Business Loan 90D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00015' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00016: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00016' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00017: 2.5% - 90 Days (Product 6)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 6 - Business Loan 90D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00017' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00018: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00018' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00019: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00019' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00020: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00020' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00021: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00021' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00022: 10% - 30 Days (Product 1)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 1 - Quick Loan 30D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00022' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Update Loan LN00023: 7.5% - 60 Days (Product 7)
UPDATE loans 
SET 
  product_id = (SELECT id FROM loan_products WHERE product_name = 'Product 7 - Flexible Loan 60D' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
WHERE loan_number = 'LN00023' AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all products created
SELECT id, product_name, interest_rate, min_term, max_term, status
FROM loan_products
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY product_name;

-- Check loans with product linked
SELECT 
  l.loan_number,
  c.name AS client_name,
  l.amount,
  l.interest_rate,
  l.total_amount,
  p.product_name,
  l.status
FROM loans l
JOIN clients c ON l.client_id = c.id
LEFT JOIN loan_products p ON l.product_id = p.id
WHERE l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY l.loan_number;

-- Summary by product
SELECT 
  p.product_name,
  COUNT(l.id) as total_loans,
  SUM(l.amount) as total_principal,
  SUM(l.total_amount) as total_repayable
FROM loan_products p
LEFT JOIN loans l ON p.id = l.product_id
WHERE p.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
GROUP BY p.product_name
ORDER BY p.product_name;