-- =============================================
-- COPY-PASTE READY: UPDATE LN00013
-- =============================================
-- INSTRUCTIONS:
-- 1. Run Section A to get your organization ID
-- 2. Copy the UUID result
-- 3. In Sections B, C, D: Replace ALL 6 instances of 'YOUR_ORG_ID_HERE' with your UUID
-- 4. In Section B: Change 12.0 to your desired interest rate
-- 5. Run each section one by one
-- =============================================

-- =============================================
-- SECTION A: GET YOUR ORGANIZATION ID
-- =============================================
SELECT id, organization_name, username 
FROM organizations 
ORDER BY organization_name;

-- ⬆️ Copy your organization ID (UUID) from the results above


-- =============================================
-- SECTION B: UPDATE INTEREST RATE
-- =============================================
UPDATE loans 
SET 
  interest_rate = 12.0,  -- ⬅️ CHANGE TO YOUR DESIRED RATE
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR ORG ID HERE


-- =============================================
-- SECTION C: RECORD PAYMENT OF KES 100,000
-- =============================================
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
  'YOUR_ORG_ID_HERE',  -- ⬅️ PASTE YOUR ORG ID HERE
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
  AND l.organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR ORG ID HERE


-- =============================================
-- SECTION D: UPDATE OUTSTANDING BALANCE
-- =============================================
UPDATE loans 
SET 
  outstanding_balance = outstanding_balance - 100000,
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR ORG ID HERE


-- =============================================
-- SECTION E: VERIFY RESULTS
-- =============================================
-- Check loan details
SELECT 
  l.loan_number,
  c.client_number,
  c.name as client_name,
  l.principal_amount,
  l.interest_rate as "Interest Rate (%)",
  l.outstanding_balance as "Outstanding Balance",
  l.status,
  l.updated_at as "Last Updated"
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR ORG ID HERE

-- Check payment records (most recent first)
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
  AND l.organization_id = 'YOUR_ORG_ID_HERE'  -- ⬅️ PASTE YOUR ORG ID HERE
ORDER BY r.created_at DESC
LIMIT 10;


-- =============================================
-- DONE! ✅
-- =============================================
-- If all sections ran successfully, you should see:
-- ✅ Updated interest rate in Section E (first query)
-- ✅ New payment record in Section E (second query)
-- ✅ Reduced outstanding balance in Section E (first query)
-- =============================================
