-- =====================================================
-- DIAGNOSTIC SCRIPT - Run this FIRST to see your database structure
-- =====================================================
-- This will show you what tables and columns exist
-- =====================================================

-- 1. List all tables in your database
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Show pricing_config table structure (if it exists)
SELECT 
  column_name, 
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pricing_config'
ORDER BY ordinal_position;

-- 3. Show pricing_config data (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_config') THEN
    RAISE NOTICE 'pricing_config table exists, showing data...';
  ELSE
    RAISE NOTICE 'pricing_config table does NOT exist';
  END IF;
END $$;

-- Try to select from pricing_config (will fail if table doesn't exist)
SELECT * FROM pricing_config LIMIT 5;

-- 4. Check if contact_messages table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
    RAISE NOTICE '✅ contact_messages table exists';
  ELSE
    RAISE NOTICE '❌ contact_messages table does NOT exist';
  END IF;
END $$;

-- 5. Show contact_messages table structure (if it exists)
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'contact_messages'
ORDER BY ordinal_position;

-- =====================================================
-- RESULTS INTERPRETATION:
-- =====================================================
-- Look at the output to see:
-- 1. What tables exist
-- 2. What columns are in pricing_config
-- 3. What data is in pricing_config
-- 4. Whether contact_messages exists
-- =====================================================
