-- =====================================================
-- ADD AUTHENTICATION COLUMNS TO ORGANIZATIONS TABLE
-- =====================================================
-- This migration adds password_hash and username columns
-- to the organizations table for simplified authentication.
-- 
-- Run this if you already executed COMPLETE_DATABASE_RESET.sql
-- before the authentication columns were added.
-- =====================================================

-- Add password_hash column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='organizations' AND column_name='password_hash'
  ) THEN
    ALTER TABLE organizations ADD COLUMN password_hash TEXT;
    RAISE NOTICE 'Added password_hash column to organizations table';
  ELSE
    RAISE NOTICE 'password_hash column already exists';
  END IF;
END $$;

-- Add username column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='organizations' AND column_name='username'
  ) THEN
    ALTER TABLE organizations ADD COLUMN username VARCHAR(100);
    RAISE NOTICE 'Added username column to organizations table';
  ELSE
    RAISE NOTICE 'username column already exists';
  END IF;
END $$;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND column_name IN ('password_hash', 'username')
ORDER BY column_name;
