-- =====================================================
-- FIX: Loan Status Chart Showing Zeros - FINAL FIX
-- =====================================================
-- Issue: Dashboard chart was case-sensitive, but database has lowercase statuses
-- Solution: Made chart filters case-insensitive + this SQL ensures data is correct

-- =====================================================
-- STEP 1: Check Current Status Distribution
-- =====================================================
SELECT 
  status,
  COUNT(*) as loan_count,
  SUM(outstanding_balance) as total_outstanding
FROM loans
GROUP BY status
ORDER BY loan_count DESC;

-- =====================================================
-- STEP 2: Verify Outstanding Balance Calculation
-- =====================================================
-- Check if outstanding_balance is correctly calculated
SELECT 
  loan_number,
  principal_amount,
  amount_paid,
  outstanding_balance,
  -- What it SHOULD be:
  (principal_amount - COALESCE(amount_paid, 0)) as calculated_balance,
  -- Difference:
  (outstanding_balance - (principal_amount - COALESCE(amount_paid, 0))) as balance_difference
FROM loans
WHERE ABS(outstanding_balance - (principal_amount - COALESCE(amount_paid, 0))) > 0.01
ORDER BY ABS(balance_difference) DESC
LIMIT 20;

-- =====================================================
-- STEP 3: Fix Outstanding Balance (if needed)
-- =====================================================
-- Uncomment and run if outstanding_balance needs recalculation:
/*
UPDATE loans
SET outstanding_balance = principal_amount - COALESCE(amount_paid, 0)
WHERE ABS(outstanding_balance - (principal_amount - COALESCE(amount_paid, 0))) > 0.01;
*/

-- =====================================================
-- STEP 4: Standardize Status Values (Optional)
-- =====================================================
-- If you want to standardize status capitalization in database:
-- (The frontend now handles case-insensitive matching, so this is OPTIONAL)

/*
-- Standardize to Title Case format:
UPDATE loans
SET status = CASE 
  WHEN LOWER(status) = 'active' THEN 'Active'
  WHEN LOWER(status) = 'disbursed' THEN 'Disbursed'
  WHEN LOWER(status) IN ('in arrears', 'overdue') THEN 'In Arrears'
  WHEN LOWER(status) IN ('fully paid', 'paid off', 'closed') THEN 'Fully Paid'
  WHEN LOWER(status) IN ('written off', 'defaulted') THEN 'Written Off'
  ELSE status
END
WHERE LOWER(status) IN ('active', 'disbursed', 'in arrears', 'overdue', 'fully paid', 'paid off', 'closed', 'written off', 'defaulted');
*/

-- =====================================================
-- STEP 5: Final Verification
-- =====================================================
-- After frontend changes, your chart should show:
SELECT 
  CASE 
    WHEN LOWER(status) IN ('active', 'disbursed') THEN 'Active'
    WHEN LOWER(status) IN ('fully paid', 'closed', 'paid off') THEN 'Fully Paid'
    WHEN LOWER(status) IN ('in arrears', 'overdue') THEN 'In Arrears'
    WHEN LOWER(status) IN ('written off', 'defaulted') THEN 'Written Off'
    ELSE 'Other'
  END as chart_category,
  COUNT(*) as count,
  SUM(outstanding_balance) as total_outstanding
FROM loans
GROUP BY chart_category
ORDER BY count DESC;

-- =====================================================
-- EXPECTED RESULTS (Based on Your Data):
-- =====================================================
-- Active: 0 (you have 'In arrears' and 'Fully paid' only)
-- Fully Paid: 12 loans
-- In Arrears: 13 loans (should now show - was 0 before!)
-- Written Off: 0
-- =====================================================

-- ✅ WHAT WAS FIXED IN CODE:
-- 1. DashboardTab.tsx - Made status filters case-insensitive
-- 2. DataContext.tsx - Fixed outstanding_balance field mapping
-- 3. Added proper null safety and fallback values
-- =====================================================
