-- =========================================
-- DIAGNOSTIC: CHECK ACTUAL TABLE SCHEMA
-- =========================================
--
-- Run this in Supabase SQL Editor to see the REAL table structure
-- This will show you ALL columns, NOT NULL constraints, and defaults
--
-- =========================================

-- 1. CHECK ALL COLUMNS AND CONSTRAINTS
-- =========================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- 2. CHECK ALL CONSTRAINTS (NOT NULL, UNIQUE, etc.)
-- =========================================

SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'clients'
ORDER BY tc.constraint_type, kcu.column_name;

-- 3. CHECK WHICH COLUMNS ARE REQUIRED (NOT NULL)
-- =========================================

SELECT 
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'clients'
  AND is_nullable = 'NO'  -- Only show NOT NULL columns
ORDER BY column_name;

-- 4. CHECK ROW LEVEL SECURITY POLICIES
-- =========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'clients';

-- 5. QUICK TABLE INFO
-- =========================================

DO $$
DECLARE
  total_cols INTEGER;
  required_cols INTEGER;
  table_exists BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'clients'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE NOTICE '❌ Table "clients" does NOT exist!';
    RAISE NOTICE 'You need to create it first.';
    RETURN;
  END IF;
  
  -- Count total columns
  SELECT COUNT(*) INTO total_cols
  FROM information_schema.columns
  WHERE table_name = 'clients';
  
  -- Count required (NOT NULL) columns
  SELECT COUNT(*) INTO required_cols
  FROM information_schema.columns
  WHERE table_name = 'clients'
  AND is_nullable = 'NO';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE '  TABLE: clients';
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Total columns: %', total_cols;
  RAISE NOTICE 'Required columns (NOT NULL): %', required_cols;
  RAISE NOTICE '';
  RAISE NOTICE 'See query results above for details!';
  RAISE NOTICE '═══════════════════════════════════════';
END $$;
