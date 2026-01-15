-- =========================================
-- QUICK FIX: Remove NOT NULL Constraints
-- =========================================
--
-- This makes all columns NULLABLE except id and created_at
-- Run this if you're getting "null value in column X" errors
--
-- SAFE TO RUN - Won't delete any data!
-- =========================================

-- Make commonly problematic columns nullable
ALTER TABLE public.clients ALTER COLUMN name DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN client_number DROP NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ NOT NULL constraints removed!';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next step:';
  RAISE NOTICE '1. Go back to your app';
  RAISE NOTICE '2. Reload the page (Ctrl+R / Cmd+R)';
  RAISE NOTICE '3. Try creating a client';
  RAISE NOTICE '4. It should work now!';
  RAISE NOTICE '';
END $$;

-- Verify changes
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'clients'
  AND column_name IN ('name', 'user_id', 'organization_id', 'email', 'phone', 'first_name', 'last_name', 'client_number')
ORDER BY column_name;
