-- ═══════════════════════════════════════════════════════════════════
-- 🔍 STEP 1: VERIFY COLUMNS ACTUALLY EXIST IN DATABASE
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- ⬆️ LOOK AT THE OUTPUT ABOVE!
-- Do you see 'duration_months' in the list? YES or NO?

-- ═══════════════════════════════════════════════════════════════════
-- 🔍 STEP 2: CHECK SPECIFICALLY FOR THE MISSING COLUMNS
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'duration_months'
    ) THEN '✅ duration_months EXISTS'
    ELSE '❌ duration_months MISSING'
  END as duration_months_status,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'monthly_installment'
    ) THEN '✅ monthly_installment EXISTS'
    ELSE '❌ monthly_installment MISSING'
  END as monthly_installment_status,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'outstanding_balance'
    ) THEN '✅ outstanding_balance EXISTS'
    ELSE '❌ outstanding_balance MISSING'
  END as outstanding_balance_status;

-- ═══════════════════════════════════════════════════════════════════
-- 🔍 STEP 3: CHECK TABLE PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'loans';

-- ═══════════════════════════════════════════════════════════════════
-- 📋 WHAT TO DO NEXT:
-- ═══════════════════════════════════════════════════════════════════
-- 1. Run this script
-- 2. Screenshot the results
-- 3. Share with me so I can see what's actually in your database
-- ═══════════════════════════════════════════════════════════════════
