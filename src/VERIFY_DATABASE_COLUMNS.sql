-- =====================================================
-- VERIFY YOUR LOANS TABLE COLUMNS
-- =====================================================
-- Run this to see EXACTLY what columns exist in your database
-- =====================================================

-- 1. List ALL columns in your loans table
SELECT 
  '📊 YOUR ACTUAL LOANS TABLE COLUMNS:' as info,
  ordinal_position as "#",
  column_name,
  data_type,
  CASE 
    WHEN is_nullable = 'YES' THEN '✅ NULLABLE'
    ELSE '❌ REQUIRED'
  END as nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY ordinal_position;

-- 2. Check if specific columns exist
SELECT 
  '🔍 CHECKING SPECIFIC COLUMNS:' as info,
  'loan_number' as column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'loan_number'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  '',
  'loan_officer_id',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'loan_officer_id'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  '',
  'application_date',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'application_date'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  '',
  'disbursement_reference',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'disbursement_reference'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  '',
  'first_payment_date',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'first_payment_date'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  '',
  'maturity_date',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'maturity_date'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  '',
  'days_in_arrears',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'days_in_arrears'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END;

-- 3. Show minimum required columns for the app to work
SELECT 
  '🎯 MINIMUM REQUIRED COLUMNS (These MUST exist):' as info,
  unnest(ARRAY[
    'id',
    'organization_id',
    'client_id',
    'principal_amount',
    'interest_rate',
    'duration_months',
    'status',
    'total_amount',
    'monthly_installment',
    'outstanding_balance',
    'paid_amount'
  ]) as column_name,
  CASE 
    WHEN column_name IN (
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'loans'
    ) THEN '✅ PRESENT'
    ELSE '❌ MISSING - APP WILL NOT WORK!'
  END as status
FROM information_schema.columns
WHERE table_name = 'loans'
  AND column_name IN (
    'id', 'organization_id', 'client_id', 'principal_amount',
    'interest_rate', 'duration_months', 'status', 'total_amount',
    'monthly_installment', 'outstanding_balance', 'paid_amount'
  )
GROUP BY column_name;

-- 4. Count total columns
SELECT 
  '📈 SUMMARY:' as info,
  COUNT(*) as total_columns,
  COUNT(*) FILTER (WHERE is_nullable = 'YES') as nullable_columns,
  COUNT(*) FILTER (WHERE is_nullable = 'NO') as required_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans';

-- 5. Show table constraints
SELECT 
  '🔐 TABLE CONSTRAINTS:' as info,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'loans'
ORDER BY constraint_type;
