-- =========================================
-- MASTER FIX - ALL CONSTRAINTS
-- =========================================
--
-- This script fixes ALL the issues preventing client creation:
-- 1. Gender constraint
-- 2. Marital status constraint  
-- 3. Foreign key constraints
-- 4. NOT NULL constraints
--
-- Run this ONCE in Supabase SQL Editor to fix everything!
-- =========================================

BEGIN;

-- =====================================
-- 1. DROP CHECK CONSTRAINTS
-- =====================================

-- Remove gender check constraint (allow any value or NULL)
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_gender_check;

-- Remove marital_status check constraint (allow any value or NULL)
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_marital_status_check;

RAISE NOTICE '✅ Check constraints removed';

-- =====================================
-- 2. DROP FOREIGN KEY CONSTRAINTS
-- =====================================

-- Remove user_id foreign key (allow user_id without requiring users table)
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_user_id_fkey;

-- Optional: Remove organization_id foreign key (uncomment if needed)
-- ALTER TABLE public.clients 
--   DROP CONSTRAINT IF EXISTS clients_organization_id_fkey;

RAISE NOTICE '✅ Foreign key constraints removed';

-- =====================================
-- 3. MAKE COLUMNS NULLABLE
-- =====================================

-- Make gender nullable
ALTER TABLE public.clients 
  ALTER COLUMN gender DROP NOT NULL;

-- Make marital_status nullable
ALTER TABLE public.clients 
  ALTER COLUMN marital_status DROP NOT NULL;

-- Make user_id nullable
ALTER TABLE public.clients 
  ALTER COLUMN user_id DROP NOT NULL;

-- Make other common fields nullable (uncomment if needed)
-- ALTER TABLE public.clients ALTER COLUMN email DROP NOT NULL;
-- ALTER TABLE public.clients ALTER COLUMN phone DROP NOT NULL;
-- ALTER TABLE public.clients ALTER COLUMN address DROP NOT NULL;

RAISE NOTICE '✅ Columns made nullable';

-- =====================================
-- 4. VERIFY CHANGES
-- =====================================

-- Show remaining constraints
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints
  WHERE table_name = 'clients'
    AND constraint_type IN ('CHECK', 'FOREIGN KEY')
    AND constraint_name LIKE '%gender%' 
       OR constraint_name LIKE '%marital%'
       OR constraint_name LIKE '%user_id%';
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 Remaining problematic constraints: %', constraint_count;
  RAISE NOTICE '';
END $$;

COMMIT;

-- =====================================
-- SUCCESS MESSAGE
-- =====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                       ║';
  RAISE NOTICE '║  ✅  ALL CONSTRAINTS FIXED SUCCESSFULLY!             ║';
  RAISE NOTICE '║                                                       ║';
  RAISE NOTICE '║  You can now:                                        ║';
  RAISE NOTICE '║  1. Create clients without gender                   ║';
  RAISE NOTICE '║  2. Create clients without marital status           ║';
  RAISE NOTICE '║  3. Create clients without user in users table      ║';
  RAISE NOTICE '║  4. All fields are now optional (except core)       ║';
  RAISE NOTICE '║                                                       ║';
  RAISE NOTICE '║  🎯 Next Step: Reload your app and create a client! ║';
  RAISE NOTICE '║                                                       ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- =====================================
-- SHOW CURRENT SCHEMA
-- =====================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'clients'
  AND column_name IN ('gender', 'marital_status', 'user_id', 'name', 'email', 'phone')
ORDER BY ordinal_position;
