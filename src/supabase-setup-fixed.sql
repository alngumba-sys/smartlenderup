-- =====================================================
-- SUPABASE DATABASE SETUP FOR SMARTLENDERUP - FIXED
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE CONTACT_MESSAGES TABLE
-- =====================================================

-- Create contact_messages table (if not exists)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can send contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can delete contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anonymous users can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anonymous users can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anonymous users can delete contact messages" ON contact_messages;

-- Create policies for contact_messages
CREATE POLICY "Anyone can send contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete contact messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can read contact messages"
  ON contact_messages
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can delete contact messages"
  ON contact_messages
  FOR DELETE
  TO anon
  USING (true);

-- =====================================================
-- 2. ADD TRIAL_DAYS COLUMN TO PRICING_CONFIG
-- =====================================================

-- Add trial_days column if it doesn't exist
DO $$ 
BEGIN
  -- Check if the column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pricing_config' 
    AND column_name = 'trial_days'
  ) THEN
    -- Add the column
    ALTER TABLE pricing_config ADD COLUMN trial_days INTEGER DEFAULT 14;
    
    -- Update existing records to have trial_days = 14
    UPDATE pricing_config SET trial_days = 14 WHERE trial_days IS NULL;
    
    RAISE NOTICE 'Added trial_days column to pricing_config table';
  ELSE
    RAISE NOTICE 'trial_days column already exists in pricing_config table';
  END IF;
END $$;

-- =====================================================
-- 3. VERIFICATION QUERIES
-- =====================================================

-- Verify contact_messages table
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'contact_messages'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE '✅ contact_messages table exists';
  ELSE
    RAISE NOTICE '❌ contact_messages table NOT found';
  END IF;
END $$;

-- Verify trial_days column
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pricing_config' 
    AND column_name = 'trial_days'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE '✅ pricing_config.trial_days column exists';
  ELSE
    RAISE NOTICE '❌ pricing_config.trial_days column NOT found';
  END IF;
END $$;

-- Show pricing_config table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pricing_config'
ORDER BY ordinal_position;

-- Show current pricing config data
SELECT * FROM pricing_config;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Now you can:
-- 1. Send contact messages from the landing page
-- 2. View them in Super Admin Dashboard
-- 3. Configure trial periods in Pricing Control Panel
-- =====================================================
