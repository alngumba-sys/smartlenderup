-- ==========================================
-- CHECK ACTUAL LOAN STATUSES IN DATABASE
-- SmartLenderUp - Kenya
-- ==========================================

-- 1. Check all unique status values
SELECT DISTINCT status, COUNT(*) as count
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
GROUP BY status;

-- 2. Check specific loan records with details
SELECT 
  loan_number,
  amount,
  balance,
  status,
  phase,
  created_at
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY loan_number
LIMIT 25;

-- 3. Count total loans
SELECT COUNT(*) as total_loans
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
