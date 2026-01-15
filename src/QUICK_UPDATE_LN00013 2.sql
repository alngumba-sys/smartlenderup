-- =============================================
-- QUICK UPDATE FOR LOAN LN00013
-- =============================================
-- Instructions:
-- 1. First, get your organization_id:

SELECT id, organization_name, username 
FROM organizations 
ORDER BY organization_name;

-- Copy your organization_id from the results above, then run the sections below


-- =============================================
-- SECTION 1: UPDATE INTEREST RATE
-- =============================================
-- Change 12.0 to your desired interest rate
-- Change 'YOUR_ORG_ID_HERE' to your actual org ID

UPDATE loans 
SET 
  interest_rate = 12.0,  -- ⬅️ SET YOUR DESIRED INTEREST RATE HERE
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = 'YOUR_ORG_ID_HERE';


-- =============================================
-- SECTION 2: RECORD PAYMENT OF KES 100,000
-- =============================================

-- First, insert the repayment record
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
  created_at
)
SELECT 
  gen_random_uuid(),
  'YOUR_ORG_ID_HERE',  -- ⬅️ REPLACE THIS
  l.id,
  l.client_id,
  100000,
  CURRENT_DATE,
  'M-PESA',
  'MP' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  'REC' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0'),
  'Super Admin',
  'Payment of KES 100,000 for YUSUF OLELA OMONDI - Loan LN00013',
  'Approved',
  NOW()
FROM loans l
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ REPLACE THIS


-- Second, update the outstanding balance
UPDATE loans 
SET 
  outstanding_balance = outstanding_balance - 100000,
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ REPLACE THIS


-- =============================================
-- SECTION 3: VERIFY CHANGES
-- =============================================

-- View updated loan details
SELECT 
  l.loan_number,
  c.client_number,
  c.name as client_name,
  l.principal_amount,
  l.interest_rate,
  l.outstanding_balance,
  l.status,
  l.updated_at
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ REPLACE THIS

-- View repayment records
SELECT 
  r.receipt_number,
  r.amount,
  r.payment_date,
  r.payment_method,
  r.transaction_reference,
  r.status,
  r.created_at
FROM repayments r
JOIN loans l ON r.loan_id = l.id
WHERE l.loan_number = 'LN00013'
  AND l.organization_id = 'YOUR_ORG_ID_HERE'  -- ⬅️ REPLACE THIS
ORDER BY r.created_at DESC;
