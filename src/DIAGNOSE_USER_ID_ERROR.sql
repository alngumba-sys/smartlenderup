-- ============================================
-- 🔍 DIAGNOSE "user_id does not exist" ERROR
-- ============================================
-- Run these queries ONE AT A TIME to find the problem
-- ============================================

-- QUERY 1: Check what tables you already have
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================

-- QUERY 2: Check if organizations table exists and what columns it has
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================

-- QUERY 3: Find all places where user_id is referenced
SELECT 
  'COLUMN' as type,
  table_name as location,
  column_name as detail
FROM information_schema.columns 
WHERE column_name = 'user_id' 
  AND table_schema = 'public'

UNION ALL

SELECT 
  'CONSTRAINT' as type,
  table_name as location,
  constraint_name as detail
FROM information_schema.table_constraints
WHERE constraint_name LIKE '%user%'
  AND table_schema = 'public'

UNION ALL

SELECT 
  'INDEX' as type,
  tablename as location,
  indexname as detail
FROM pg_indexes
WHERE indexname LIKE '%user%'
  AND schemaname = 'public'

UNION ALL

SELECT 
  'VIEW' as type,
  table_name as location,
  view_definition as detail
FROM information_schema.views
WHERE view_definition LIKE '%user_id%'
  AND table_schema = 'public';

-- ============================================

-- QUERY 4: Check for policies that reference user_id
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
WHERE schemaname = 'public';

-- ============================================

-- QUERY 5: Check for triggers
SELECT 
  trigger_schema,
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
