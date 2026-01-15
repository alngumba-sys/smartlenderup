-- ==========================================
-- FIX LOAN STATUSES TO MATCH DASHBOARD
-- SmartLenderUp - Kenya
-- ==========================================
-- Dashboard expects: 'Active', 'Fully Paid', 'In Arrears', 'Written Off'
-- We imported: 'closed' and 'overdue'
-- This script updates the statuses to match

UPDATE loans
SET status = 'Fully Paid',
    updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND status = 'closed';

UPDATE loans
SET status = 'In Arrears',
    updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND status = 'overdue';

-- Verify the fix
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  SUM(balance) as total_outstanding
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
GROUP BY status
ORDER BY status;

-- Expected Result:
-- 'Fully Paid': 10 loans
-- 'In Arrears': 13 loans
