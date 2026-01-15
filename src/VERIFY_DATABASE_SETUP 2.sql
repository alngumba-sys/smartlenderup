-- =====================================================
-- VERIFY DATABASE SETUP
-- =====================================================
-- Run this in Supabase SQL Editor to check if your
-- database has all the required columns
-- =====================================================

-- Check organizations table columns
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Expected columns (should include):
-- ✅ id
-- ✅ organization_name
-- ✅ organization_type
-- ✅ email
-- ✅ phone
-- ✅ address
-- ✅ country
-- ✅ currency
-- ✅ password_hash ⚠️ CRITICAL
-- ✅ username ⚠️ CRITICAL
-- ✅ trial_start_date
-- ✅ trial_end_date
-- ✅ subscription_status
-- ✅ status
-- ✅ created_at
-- ✅ updated_at

-- Quick check for critical auth columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='organizations' AND column_name='password_hash'
  ) THEN
    RAISE NOTICE '✅ password_hash column exists';
  ELSE
    RAISE NOTICE '❌ password_hash column MISSING - run QUICK_FIX_AUTH_COLUMNS.sql';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='organizations' AND column_name='username'
  ) THEN
    RAISE NOTICE '✅ username column exists';
  ELSE
    RAISE NOTICE '❌ username column MISSING - run QUICK_FIX_AUTH_COLUMNS.sql';
  END IF;
END $$;
