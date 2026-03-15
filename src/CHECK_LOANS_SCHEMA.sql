-- ═══════════════════════════════════════════════════════════════════
-- 🔍 COMPREHENSIVE SCHEMA CHECK FOR LOANS TABLE
-- ═══════════════════════════════════════════════════════════════════
-- This will show you EXACTLY what columns exist in your loans table
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- PART 1: Check if loans table exists
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'loans'
    ) THEN '✅ loans table EXISTS'
    ELSE '❌ loans table DOES NOT EXIST'
  END as table_status;

-- ═══════════════════════════════════════════════════════════════════
-- PART 2: List ALL columns in loans table
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name IN (
      'id', 'organization_id', 'client_id', 'principal_amount',
      'interest_rate', 'duration_months', 'status', 'total_amount',
      'monthly_installment', 'outstanding_balance', 'paid_amount',
      'loan_number', 'loan_product_id', 'purpose', 'processing_fee',
      'disbursed_at', 'first_payment_date', 'maturity_date',
      'disbursement_method', 'disbursement_reference',
      'approval_stage', 'current_approver_role_id',
      'created_at', 'updated_at'
    ) THEN '✅ REQUIRED'
    ELSE '⚪ OPTIONAL'
  END as column_status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY 
  CASE 
    WHEN column_name IN (
      'id', 'organization_id', 'client_id', 'principal_amount',
      'interest_rate', 'duration_months', 'status', 'total_amount',
      'monthly_installment', 'outstanding_balance', 'paid_amount',
      'loan_number', 'loan_product_id', 'purpose', 'processing_fee',
      'disbursed_at', 'first_payment_date', 'maturity_date',
      'disbursement_method', 'disbursement_reference',
      'approval_stage', 'current_approver_role_id',
      'created_at', 'updated_at'
    ) THEN 0
    ELSE 1
  END,
  column_name;

-- ═══════════════════════════════════════════════════════════════════
-- PART 3: Check for MISSING required columns
-- ═══════════════════════════════════════════════════════════════════

WITH required_columns AS (
  SELECT unnest(ARRAY[
    'id', 'organization_id', 'client_id', 'principal_amount',
    'interest_rate', 'duration_months', 'status', 'total_amount',
    'monthly_installment', 'outstanding_balance', 'paid_amount',
    'loan_number', 'loan_product_id', 'purpose', 'processing_fee',
    'disbursed_at', 'first_payment_date', 'maturity_date',
    'disbursement_method', 'disbursement_reference',
    'approval_stage', 'current_approver_role_id',
    'created_at', 'updated_at'
  ]) AS required_column_name
),
existing_columns AS (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'loans'
)
SELECT 
  rc.required_column_name AS missing_column,
  '❌ MISSING!' as status
FROM required_columns rc
LEFT JOIN existing_columns ec ON rc.required_column_name = ec.column_name
WHERE ec.column_name IS NULL
ORDER BY rc.required_column_name;

-- ═══════════════════════════════════════════════════════════════════
-- PART 4: Summary count
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  COUNT(*) as total_columns,
  COUNT(CASE 
    WHEN column_name IN (
      'id', 'organization_id', 'client_id', 'principal_amount',
      'interest_rate', 'duration_months', 'status', 'total_amount',
      'monthly_installment', 'outstanding_balance', 'paid_amount',
      'loan_number', 'loan_product_id', 'purpose', 'processing_fee',
      'disbursed_at', 'first_payment_date', 'maturity_date',
      'disbursement_method', 'disbursement_reference',
      'approval_stage', 'current_approver_role_id',
      'created_at', 'updated_at'
    ) THEN 1 
  END) as required_columns_present,
  24 as required_columns_total,
  CASE 
    WHEN COUNT(CASE 
      WHEN column_name IN (
        'id', 'organization_id', 'client_id', 'principal_amount',
        'interest_rate', 'duration_months', 'status', 'total_amount',
        'monthly_installment', 'outstanding_balance', 'paid_amount',
        'loan_number', 'loan_product_id', 'purpose', 'processing_fee',
        'disbursed_at', 'first_payment_date', 'maturity_date',
        'disbursement_method', 'disbursement_reference',
        'approval_stage', 'current_approver_role_id',
        'created_at', 'updated_at'
      ) THEN 1 
    END) = 24 THEN '✅ ALL REQUIRED COLUMNS PRESENT!'
    ELSE '❌ MISSING SOME REQUIRED COLUMNS!'
  END as schema_status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans';

-- ═══════════════════════════════════════════════════════════════════
-- PART 5: Check for the specific "duration_months" column
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'loans'
        AND column_name = 'duration_months'
    ) THEN '✅ duration_months EXISTS'
    ELSE '❌ duration_months DOES NOT EXIST!'
  END as duration_months_status,
  (
    SELECT data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loans'
      AND column_name = 'duration_months'
  ) as data_type;

-- ═══════════════════════════════════════════════════════════════════
-- 📋 INSTRUCTIONS:
-- ═══════════════════════════════════════════════════════════════════
-- 1. Copy this ENTIRE file
-- 2. Paste in Supabase SQL Editor
-- 3. Click "RUN"
-- 4. Review ALL 5 result sets:
--    - Part 1: Does loans table exist?
--    - Part 2: What columns exist? (shows all columns with status)
--    - Part 3: Which required columns are missing? (if any)
--    - Part 4: Summary count (how many required columns are present)
--    - Part 5: Specific check for duration_months
-- 
-- 5. Screenshot ALL results and share them
-- ═══════════════════════════════════════════════════════════════════
