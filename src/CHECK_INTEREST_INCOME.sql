-- =============================================
-- CHECK INTEREST INCOME CALCULATION
-- =============================================
-- Organization ID: 958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9
--
-- This query will show:
-- • Total interest from each loan (total_amount - amount)
-- • Total interest paid (calculated from amount_paid)
-- • Interest outstanding
-- 
-- ✅ Just click RUN to see the breakdown!
-- =============================================

-- ┌─────────────────────────────────────────────┐
-- │  INTEREST INCOME CALCULATION                │
-- └─────────────────────────────────────────────┘

SELECT 
  '📊 INTEREST INCOME BREAKDOWN' as "Report Title",
  '' as "Loan ID",
  '' as "Client Name",
  '' as "Principal",
  '' as "Total Interest",
  '' as "Interest Paid",
  '' as "Interest Outstanding";

SELECT 
  l.loan_number as "Loan ID",
  COALESCE(c.name, c.first_name || ' ' || c.last_name, c.business_name) as "Client Name",
  l.amount as "Principal (KES)",
  (l.total_amount - l.amount) as "Total Interest (KES)",
  CASE 
    WHEN l.amount_paid <= l.amount THEN 0  -- Still paying principal
    ELSE l.amount_paid - l.amount          -- Paid more than principal = interest paid
  END as "Interest Paid (KES)",
  CASE 
    WHEN l.balance <= (l.total_amount - l.amount) THEN l.balance  -- Remaining balance is all interest
    ELSE (l.total_amount - l.amount) - (l.amount_paid - l.amount) -- Calculate remaining interest
  END as "Interest Outstanding (KES)",
  l.status as "Status"
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND l.status IN ('Active', 'Disbursed', 'Completed')
ORDER BY l.loan_number;

-- ┌─────────────────────────────────────────────┐
-- │  TOTAL SUMMARY                              │
-- └─────────────────────────────────────────────┘

SELECT 
  '💰 TOTAL INTEREST SUMMARY' as "Summary";

SELECT 
  SUM(l.total_amount - l.amount) as "Total Interest (All Loans) - KES",
  SUM(
    CASE 
      WHEN l.amount_paid <= l.amount THEN 0
      ELSE l.amount_paid - l.amount
    END
  ) as "Total Interest PAID - KES",
  SUM(
    CASE 
      WHEN l.balance <= (l.total_amount - l.amount) THEN l.balance
      ELSE (l.total_amount - l.amount) - GREATEST(0, l.amount_paid - l.amount)
    END
  ) as "Total Interest OUTSTANDING - KES"
FROM loans l
WHERE l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND l.status IN ('Active', 'Disbursed', 'Completed');

-- ┌─────────────────────────────────────────────┐
-- │  ALTERNATIVE: Sum from Repayments Table    │
-- └─────────────────────────────────────────────┘

SELECT 
  '💸 REPAYMENTS TABLE CHECK' as "Check";

SELECT 
  COALESCE(SUM(interest), 0) as "Total Interest from Repayments - KES",
  COUNT(*) as "Number of Repayments"
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- =============================================
-- ✅ DONE!
-- =============================================
-- 
-- This will show:
-- ✅ Interest breakdown by loan
-- ✅ Total interest paid (should be 227,500)
-- ✅ Interest from repayments table (for comparison)
-- =============================================
