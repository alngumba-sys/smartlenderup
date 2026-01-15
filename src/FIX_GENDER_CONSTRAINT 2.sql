-- =========================================
-- FIX GENDER CONSTRAINT
-- =========================================
--
-- Remove the gender check constraint so NULL values are allowed
-- This prevents the sync error when gender is not provided
--
-- Run this in Supabase SQL Editor
-- =========================================

-- Drop the gender check constraint
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_gender_check;

-- Make the column nullable (if it isn't already)
ALTER TABLE public.clients 
  ALTER COLUMN gender DROP NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Gender constraint removed!';
  RAISE NOTICE 'Gender column can now be NULL or any text value';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next: Reload your app and try creating a client!';
  RAISE NOTICE '';
END $$;

-- Verify the change
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'clients' 
  AND column_name = 'gender';
