-- =========================================
-- FIX user_id NOT NULL CONSTRAINT
-- =========================================
--
-- This removes the NOT NULL constraint from the user_id column
-- so that clients can be created without requiring a user_id
--
-- Run this in Supabase SQL Editor
-- =========================================

-- Make user_id column nullable
ALTER TABLE public.clients 
  ALTER COLUMN user_id DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clients' 
AND column_name = 'user_id';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ user_id column is now nullable!';
  RAISE NOTICE 'You can now create clients without providing a user_id';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next: Try creating a client in your app!';
END $$;
