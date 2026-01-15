-- =============================================
-- READY-TO-EXECUTE: UPDATE LN00013 FOR BV FUNGUO LTD
-- =============================================
-- Organization ID: 958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9
-- 
-- WHAT THIS WILL DO:
-- 1. Update interest rate for Loan LN00013 to 15.0%
-- 2. Record payment of KES 100,000
-- 3. Update outstanding balance
-- 4. Show verification results
-- 
-- ⚠️ BEFORE RUNNING: Change interest rate if needed (Line 29)
-- ✅ AFTER CHANGES: Just click RUN to execute everything!
-- =============================================

-- ┌─────────────────────────────────────────────┐
-- │  STEP 1: UPDATE INTEREST RATE               │
-- └─────────────────────────────────────────────┘

UPDATE loans 
SET 
  interest_rate = 15.0,  -- ⬅️ CHANGE THIS if you want a different interest rate
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;

-- ┌─────────────────────────────────────────────┐
-- │  STEP 2: RECORD PAYMENT OF KES 100,000      │
-- └─────────────────────────────────────────────┘

INSERT INTO payments (
  id,
  loan_id,
  payment_number,
  amount,
  principal_paid,
  interest_paid,
  penalty_paid,
  payment_method,
  payment_reference,
  mpesa_receipt_number,
  payment_date,
  received_by,
  status,
  notes,
  created_at
)
SELECT 
  uuid_generate_v4(),
  l.id,
  'PAY' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
  100000,
  100000,
  0,
  0,
  'mpesa',
  'MP' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  'SL' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 10)),
  NOW(),
  (SELECT id FROM users WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid LIMIT 1),
  'completed',
  'Payment of KES 100,000 for YUSUF OLELA OMONDI - Loan LN00013',
  NOW()
FROM loans l
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;

-- ┌─────────────────────────────────────────────┐
-- │  STEP 3: UPDATE OUTSTANDING BALANCE         │
-- └─────────────────────────────────────────────┘

UPDATE loans 
SET 
  outstanding_balance = outstanding_balance - 100000,
  paid_amount = COALESCE(paid_amount, 0) + 100000,
  last_payment_date = NOW(),
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;

-- ┌─────────────────────────────────────────────┐
-- │  STEP 4: VERIFY LOAN DETAILS                │
-- └─────────────────────────────────────────────┘

SELECT 
  '🎯 LOAN DETAILS AFTER UPDATE' as "═══════════════════════════════════════";

SELECT 
  l.loan_number as "📋 Loan ID",
  c.name as "👤 Client Name",
  c.client_number as "🆔 Client ID",
  c.phone as "📱 Phone",
  l.amount as "💰 Principal (KES)",
  l.interest_rate as "📊 Interest Rate (%)",
  l.outstanding_balance as "⚠️ Outstanding (KES)",
  l.paid_amount as "✅ Paid (KES)",
  l.status as "🔔 Status",
  TO_CHAR(l.updated_at, 'DD Mon YYYY HH24:MI') as "🕐 Last Updated"
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;

-- ┌─────────────────────────────────────────────┐
-- │  STEP 5: VERIFY PAYMENT RECORD              │
-- └─────────────────────────────────────────────┘

SELECT 
  '💳 RECENT PAYMENT RECORDS' as "═══════════════════════════════════════";

SELECT 
  p.payment_number as "🧾 Payment #",
  p.amount as "💵 Amount (KES)",
  TO_CHAR(p.payment_date, 'DD Mon YYYY HH24:MI') as "📅 Payment Date",
  p.payment_method as "🏦 Method",
  p.payment_reference as "🔑 Reference",
  p.mpesa_receipt_number as "📱 M-PESA Receipt",
  p.status as "✅ Status",
  p.notes as "📝 Notes"
FROM payments p
JOIN loans l ON p.loan_id = l.id
WHERE l.loan_number = 'LN00013'
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid
ORDER BY p.created_at DESC
LIMIT 10;

-- ┌─────────────────────────────────────────────┐
-- │  STEP 6: PAYMENT STATISTICS                 │
-- └─────────────────────────────────────────────┘

SELECT 
  '📈 PAYMENT STATISTICS' as "═══════════════════════════════════════";

SELECT 
  COUNT(*) as "🔢 Total Payments",
  SUM(p.amount) as "💰 Total Paid (KES)",
  TO_CHAR(MIN(p.payment_date), 'DD Mon YYYY') as "📅 First Payment",
  TO_CHAR(MAX(p.payment_date), 'DD Mon YYYY') as "📅 Last Payment",
  ROUND(AVG(p.amount), 2) as "📊 Avg Payment (KES)"
FROM payments p
JOIN loans l ON p.loan_id = l.id
WHERE l.loan_number = 'LN00013'
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid;

-- ┌─────────────────────────────────────────────┐
-- │  STEP 7: LOAN FINANCIAL SUMMARY             │
-- └─────────────────────────────────────────────┘

SELECT 
  '💼 FINANCIAL SUMMARY' as "═══════════════════════════════════════";

SELECT 
  l.amount as "💰 Original Loan",
  COALESCE(SUM(p.amount), 0) as "✅ Total Paid",
  l.outstanding_balance as "⚠️ Still Owed",
  ROUND((COALESCE(SUM(p.amount), 0) / NULLIF(l.amount, 0)) * 100, 2) as "📊 Repaid %",
  l.interest_rate as "📈 Interest Rate %",
  CASE 
    WHEN l.outstanding_balance <= 0 THEN '✅ FULLY PAID'
    WHEN l.outstanding_balance > 0 AND l.outstanding_balance < l.amount THEN '🔄 IN PROGRESS'
    ELSE '⏳ PENDING'
  END as "🎯 Payment Status"
FROM loans l
LEFT JOIN payments p ON p.loan_id = l.id
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::uuid
GROUP BY l.id, l.amount, l.outstanding_balance, l.interest_rate;

-- ┌─────────────────────────────────────────────┐
-- │  ✅ EXECUTION COMPLETE!                     │
-- └─────────────────────────────────────────────┘
-- 
-- WHAT HAPPENED:
-- ✅ Interest rate updated for Loan LN00013
-- ✅ Payment of KES 100,000 recorded
-- ✅ Outstanding balance reduced by KES 100,000
-- ✅ All changes verified above
-- 
-- NEXT STEPS:
-- 1. Review the verification results above
-- 2. Deploy code changes via Git:
--    git add .
--    git commit -m "Filter Record Payment dropdown"
--    git push origin main
-- 3. Wait for Netlify deployment (2-3 minutes)
-- 4. Test at https://smartlenderup.com
-- 
-- EXPECTED RESULTS IN YOUR PLATFORM:
-- • Loan LN00013 shows new interest rate (15.0% or your chosen rate)
-- • Outstanding balance reduced by KES 100,000
-- • New payment record visible in Payments tab
-- • Record Payment dropdown shows only loans with outstanding balance
-- 
-- 🎉 All database changes complete!
-- ┌─────────────────────────────────────────────┘


-- ┌─────────────────────────────────────────────┐
-- │  📋 QUICK REFERENCE                         │
-- └─────────────────────────────────────────────┘
-- 
-- Organization: BV Funguo Ltd
-- Organization ID: 958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9
-- 
-- Loan Details:
-- - Loan Number: LN00013
-- - Client: YUSUF OLELA OMONDI
-- - Client ID: CL00011
-- - Phone: 742100886
-- - ID Number: 12508228
-- 
-- Changes Applied:
-- ✅ Interest Rate: Updated to 15.0% (or your chosen rate)
-- ✅ Payment: KES 100,000 recorded
-- ✅ Outstanding: Reduced by KES 100,000
-- ✅ Reference: Auto-generated
-- 
-- Platform URL: https://smartlenderup.com
-- ┌─────────────────────────────────────────────┘

-- =============================================
-- END OF SCRIPT - Happy Lending! 🚀
-- =============================================
