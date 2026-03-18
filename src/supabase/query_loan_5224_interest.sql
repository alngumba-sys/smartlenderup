-- ============================================
-- QUERY TO FIND INTEREST FOR LOAN 5224
-- ============================================
-- This query shows where the 45,000 interest value comes from

-- Main query: Find loan 5224's interest
SELECT 
  id,
  loan_number,
  client_name,
  principal_amount,
  interest_rate,
  duration_months as term,
  interest_amount,  -- ⭐ THIS IS WHERE 45,000 IS STORED
  total_amount,
  
  -- Show the calculation
  (principal_amount * interest_rate * duration_months) / 100 as calculated_interest,
  
  -- Verify the math
  CASE 
    WHEN interest_amount = (principal_amount * interest_rate * duration_months) / 100 
    THEN '✅ Matches calculation'
    ELSE '❌ Does not match'
  END as verification
  
FROM public.loans
WHERE loan_number = '5224' 
   OR id = '5224'
   OR loan_number LIKE '%5224%';

-- ============================================
-- BREAKDOWN FOR LOAN 5224
-- ============================================
-- Expected calculation:
-- Principal: 300,000
-- Rate: 7.5%
-- Term: 2 months
-- Interest = (300,000 × 7.5 × 2) / 100 = 45,000

-- ============================================
-- ANSWER: The 45,000 comes from:
-- ============================================
-- TABLE: loans
-- COLUMN: interest_amount
-- TYPE: DECIMAL(15,2)
-- 
-- Formula: (principal_amount × interest_rate × duration_months) / 100
-- Calculation: (300,000 × 7.5 × 2) / 100 = 45,000
-- ============================================

-- Query to check all loans' interest calculations
SELECT 
  loan_number,
  client_name,
  principal_amount,
  interest_rate,
  duration_months,
  interest_amount as stored_interest,
  (principal_amount * interest_rate * duration_months) / 100 as calculated_interest,
  interest_amount - ((principal_amount * interest_rate * duration_months) / 100) as difference
FROM public.loans
WHERE status IN ('active', 'disbursed')
ORDER BY loan_number
LIMIT 20;
