-- =============================================
-- DELETE BANKS AND SHAREHOLDERS - BV FUNGUO LTD
-- =============================================
-- Organization ID: 958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9
--
-- This will DELETE:
-- • All bank accounts
-- • All shareholders
-- • All shareholder transactions
--
-- ⚠️ WARNING: This is PERMANENT! Cannot be undone!
-- ✅ Only click RUN if you're sure!
-- =============================================

BEGIN;

-- ┌─────────────────────────────────────────────┐
-- │  DELETE SHAREHOLDER TRANSACTIONS FIRST     │
-- └─────────────────────────────────────────────┘
-- (Must delete transactions before shareholders due to foreign key)

DELETE FROM shareholder_transactions
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- ┌─────────────────────────────────────────────┐
-- │  DELETE SHAREHOLDERS                        │
-- └─────────────────────────────────────────────┘

DELETE FROM shareholders
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- ┌─────────────────────────────────────────────┐
-- │  DELETE BANK ACCOUNTS                       │
-- └─────────────────────────────────────────────┘

DELETE FROM bank_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

COMMIT;

-- ┌─────────────────────────────────────────────┐
-- │  VERIFY DELETIONS                           │
-- └─────────────────────────────────────────────┘

SELECT '✅ ALL DELETIONS COMPLETED!' as "Status";

-- Check remaining records
SELECT 
  'Bank Accounts' as "Table",
  COUNT(*) as "Remaining Records"
FROM bank_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
UNION ALL
SELECT 
  'Shareholders',
  COUNT(*)
FROM shareholders
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
UNION ALL
SELECT 
  'Shareholder Transactions',
  COUNT(*)
FROM shareholder_transactions
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- =============================================
-- ✅ DONE!
-- =============================================
-- 
-- DELETED:
-- ✅ All shareholder transactions
-- ✅ All shareholders
-- ✅ All bank accounts
-- 
-- All records should show 0 in the verification above.
-- =============================================
