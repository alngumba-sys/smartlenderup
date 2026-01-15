-- =====================================================
-- FINAL FIX - Simple & Bulletproof
-- =====================================================
-- Copy this ENTIRE script and run it in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Create contact_messages table
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to do everything (for demo purposes)
DROP POLICY IF EXISTS "Allow all on contact_messages" ON contact_messages;
CREATE POLICY "Allow all on contact_messages" 
  ON contact_messages 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- =====================================================
-- STEP 2: Add trial_days to pricing_config
-- =====================================================

-- First, check if pricing_config table exists
DO $$ 
BEGIN
  -- If pricing_config doesn't exist, create it
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'pricing_config'
  ) THEN
    CREATE TABLE pricing_config (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT,
      price_monthly NUMERIC,
      price_annual NUMERIC,
      trial_days INTEGER DEFAULT 14,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Created pricing_config table';
  END IF;
  
  -- Now add trial_days column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'pricing_config' 
    AND column_name = 'trial_days'
  ) THEN
    ALTER TABLE pricing_config ADD COLUMN trial_days INTEGER DEFAULT 14;
    RAISE NOTICE '✅ Added trial_days column';
  ELSE
    RAISE NOTICE '✅ trial_days column already exists';
  END IF;
  
END $$;

-- Set up security for pricing_config
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Allow everyone to do everything (for demo purposes)
DROP POLICY IF EXISTS "Allow all on pricing_config" ON pricing_config;
CREATE POLICY "Allow all on pricing_config" 
  ON pricing_config 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- =====================================================
-- STEP 3: Verify everything worked
-- =====================================================

-- Check contact_messages
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'contact_messages') THEN
    RAISE NOTICE '✅✅✅ contact_messages table EXISTS';
  ELSE
    RAISE NOTICE '❌❌❌ contact_messages table MISSING';
  END IF;
END $$;

-- Check pricing_config
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'pricing_config') THEN
    RAISE NOTICE '✅✅✅ pricing_config table EXISTS';
  ELSE
    RAISE NOTICE '❌❌❌ pricing_config table MISSING';
  END IF;
END $$;

-- Check trial_days column
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'pricing_config' 
    AND column_name = 'trial_days'
  ) THEN
    RAISE NOTICE '✅✅✅ trial_days column EXISTS';
  ELSE
    RAISE NOTICE '❌❌❌ trial_days column MISSING';
  END IF;
END $$;

-- Show pricing_config structure
SELECT 
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'pricing_config'
ORDER BY ordinal_position;

-- =====================================================
-- ✅ DONE! Look at the messages above
-- If you see ✅✅✅ for everything, you're good!
-- Now refresh your browser (Ctrl+Shift+R)
-- =====================================================
