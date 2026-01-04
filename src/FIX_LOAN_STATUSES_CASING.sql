-- ==========================================
-- FIX LOAN STATUSES - CORRECT CASING
-- SmartLenderUp - Kenya
-- ==========================================
-- Dashboard expects EXACT casing: 'In Arrears', 'Fully Paid'
-- Database has: 'In arrears', 'Fully paid'

UPDATE loans
SET status = 'Fully Paid',
    updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND LOWER(status) = 'fully paid';

UPDATE loans
SET status = 'In Arrears',
    updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND LOWER(status) = 'in arrears';

-- Verify the fix
SELECT 
  status,
  COUNT(*) as count
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
GROUP BY status
ORDER BY status;

-- Expected Result:
-- 'Fully Paid': 10 loans
-- 'In Arrears': 13 loans
