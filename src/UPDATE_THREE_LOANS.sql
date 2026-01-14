-- =============================================
-- UPDATE THREE LOANS - BV FUNGUO LTD
-- =============================================
-- Organization ID: 958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9
--
-- REAL DATABASE COLUMNS (from COMPLETE_DATABASE_RESET.sql):
-- • amount (principal amount)
-- • total_amount (principal + interest + fees)
-- • amount_paid (total amount paid)
-- • balance (outstanding balance)
--
-- CHANGES:
-- 1. LN00013 (YUSUF OLELA OMONDI): Interest 30,000 + Paid Amount 100,000
-- 2. LN00017 (BLOOMING BUD CENTER): Paid Amount 71,700
-- 3. LN00014 (KIFARU SAMSOM MASHA): Paid Amount 44,000
--
-- ✅ Just click RUN to execute!
-- =============================================

BEGIN;

-- ┌─────────────────────────────────────────────┐
-- │  UPDATE 1: LN00013 - YUSUF OLELA OMONDI    │
-- └─────────────────────────────────────────────┘

UPDATE loans
SET 
  total_amount = amount + 30000,  -- Total = Principal + Interest(30,000)
  amount_paid = 100000,
  balance = (amount + 30000) - 100000,  -- Recalculate balance
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013'
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- ┌─────────────────────────────────────────────┐
-- │  UPDATE 2: LN00017 - BLOOMING BUD CENTER   │
-- └─────────────────────────────────────────────┘

UPDATE loans
SET 
  amount_paid = 71700,
  balance = total_amount - 71700,  -- Recalculate balance
  updated_at = NOW()
WHERE 
  loan_number = 'LN00017'
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- ┌─────────────────────────────────────────────┐
-- │  UPDATE 3: LN00014 - KIFARU SAMSOM MASHA   │
-- └─────────────────────────────────────────────┘

UPDATE loans
SET 
  amount_paid = 44000,
  balance = total_amount - 44000,  -- Recalculate balance
  updated_at = NOW()
WHERE 
  loan_number = 'LN00014'
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

COMMIT;

-- ┌─────────────────────────────────────────────┐
-- │  VERIFY UPDATES                             │
-- └─────────────────────────────────────────────┘

SELECT '✅ ALL UPDATES COMPLETED!' as "Status";

SELECT 
  l.loan_number as "📋 Loan ID",
  c.client_number as "🆔 Client ID",
  COALESCE(c.name, c.first_name || ' ' || c.last_name, c.business_name) as "👤 Client Name",
  l.amount as "💰 Principal (KES)",
  (l.total_amount - l.amount) as "📈 Interest (KES)",
  l.total_amount as "💵 Total Amount (KES)",
  l.amount_paid as "✅ Paid (KES)",
  l.balance as "⚠️ Outstanding (KES)",
  l.status as "🔔 Status"
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.loan_number IN ('LN00013', 'LN00017', 'LN00014')
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY l.loan_number;

-- =============================================
-- ✅ DONE!
-- =============================================
-- 
-- WHAT WAS UPDATED:
-- ✅ LN00013: Interest = 30,000 | Paid = 100,000
-- ✅ LN00017: Paid = 71,700
-- ✅ LN00014: Paid = 44,000
-- ✅ Balances recalculated automatically
-- 
-- CORRECT COLUMN NAMES (from COMPLETE_DATABASE_RESET.sql):
-- LOANS: amount, total_amount, amount_paid, balance
-- CLIENTS: name, first_name, last_name, business_name (NO group_name)
-- =============================================
