-- =========================================
-- FIX FOREIGN KEY CONSTRAINTS
-- =========================================
--
-- Remove foreign key constraints that are causing sync errors
-- This allows clients to be created without requiring a user in the users table
--
-- Run this in Supabase SQL Editor
-- =========================================

-- Drop the user_id foreign key constraint
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_user_id_fkey;

-- Make user_id nullable
ALTER TABLE public.clients 
  ALTER COLUMN user_id DROP NOT NULL;

-- Drop the organization_id foreign key (if it exists and causes issues)
-- ALTER TABLE public.clients 
--   DROP CONSTRAINT IF EXISTS clients_organization_id_fkey;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Foreign key constraints removed!';
  RAISE NOTICE 'Clients can now be created without user_id in users table';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next: Reload your app and try creating a client!';
  RAISE NOTICE '';
END $$;

-- Verify the changes
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='clients';
