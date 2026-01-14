-- =============================================
-- UPDATE LOAN LN00013 (YUSUF OLELA OMONDI) SCRIPT
-- =============================================
-- This script will:
-- 1. Allow you to update the interest rate for Loan LN00013
-- 2. Record a payment of KES 100,000
-- 
-- IMPORTANT: Replace 'YOUR_ORG_ID_HERE' with your actual organization ID
--            Replace 'NEW_INTEREST_RATE' with your desired interest rate
-- =============================================

-- =============================================
-- STEP 1: UPDATE INTEREST RATE
-- =============================================
-- Current interest rate for LN00013: 10.0%
-- Modify the interest_rate value below to your desired rate

UPDATE loans 
SET 
  interest_rate = 12.0,  -- ⬅️ CHANGE THIS VALUE to your desired interest rate
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ REPLACE with your actual organization ID

-- Verify the update
SELECT 
  loan_number,
  client_name,
  principal_amount,
  interest_rate,
  outstanding_balance,
  status
FROM loans
WHERE loan_number = 'LN00013' 
  AND organization_id = 'YOUR_ORG_ID_HERE';


-- =============================================
-- STEP 2: RECORD PAYMENT OF KES 100,000
-- =============================================
-- This will create a repayment record for KES 100,000

INSERT INTO repayments (
  id,
  organization_id,
  loan_id,
  client_id,
  amount,
  payment_date,
  payment_method,
  transaction_reference,
  receipt_number,
  received_by,
  notes,
  status,
  bank_account_id,
  created_at
)
VALUES (
  gen_random_uuid(),
  'YOUR_ORG_ID_HERE',  -- ⬅️ REPLACE with your actual organization ID
  (SELECT id FROM loans WHERE loan_number = 'LN00013' AND organization_id = 'YOUR_ORG_ID_HERE'),
  (SELECT client_id FROM loans WHERE loan_number = 'LN00013' AND organization_id = 'YOUR_ORG_ID_HERE'),
  100000,  -- Payment amount: KES 100,000
  CURRENT_DATE,  -- Payment date: Today
  'M-PESA',  -- Payment method
  'SK12ABC34D',  -- Transaction reference (modify as needed)
  'REC' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),  -- Auto-generate receipt number
  'Super Admin',  -- Received by
  'Payment recorded for YUSUF OLELA OMONDI - Loan LN00013',
  'Approved',
  NULL,  -- Or specify a bank_account_id if you want to link to a specific account
  NOW()
);

-- =============================================
-- STEP 3: UPDATE LOAN OUTSTANDING BALANCE
-- =============================================
-- Reduce the outstanding balance by KES 100,000

UPDATE loans 
SET 
  outstanding_balance = outstanding_balance - 100000,
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ REPLACE with your actual organization ID

-- =============================================
-- STEP 4: VERIFY THE CHANGES
-- =============================================
-- Check the loan details after update
SELECT 
  l.loan_number,
  l.client_name,
  c.client_number,
  l.principal_amount,
  l.interest_rate,
  l.outstanding_balance,
  l.status,
  l.updated_at
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = 'YOUR_ORG_ID_HERE';

-- Check the repayment record
SELECT 
  r.receipt_number,
  r.amount,
  r.payment_date,
  r.payment_method,
  r.transaction_reference,
  r.status,
  r.notes
FROM repayments r
JOIN loans l ON r.loan_id = l.id
WHERE l.loan_number = 'LN00013'
  AND l.organization_id = 'YOUR_ORG_ID_HERE'
ORDER BY r.created_at DESC
LIMIT 5;

-- =============================================
-- INSTRUCTIONS FOR EXECUTION:
-- =============================================
-- 1. Go to your Supabase Dashboard → SQL Editor
-- 2. Find your organization_id by running:
--    SELECT id, organization_name, username FROM organizations;
-- 3. Replace ALL instances of 'YOUR_ORG_ID_HERE' with your actual organization ID
-- 4. Set the new interest rate in STEP 1 (currently set to 12.0%)
-- 5. Optionally modify the payment details in STEP 2 (date, method, reference, etc.)
-- 6. Run the entire script
-- 7. Review the results from STEP 4 to verify changes
-- =============================================
