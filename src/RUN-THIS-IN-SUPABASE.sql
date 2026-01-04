-- ═══════════════════════════════════════════════════════════════
-- 🚨 COPY THIS ENTIRE FILE AND RUN IT IN SUPABASE SQL EDITOR
-- ═══════════════════════════════════════════════════════════════
-- 
-- INSTRUCTIONS:
-- 1. Select ALL text in this file (Ctrl+A)
-- 2. Copy it (Ctrl+C)
-- 3. Go to: https://supabase.com/dashboard
-- 4. Click your SmartLenderUp project
-- 5. Click "SQL Editor" on the left
-- 6. Click "New Query"
-- 7. Paste this code (Ctrl+V)
-- 8. Click the green "RUN" button
-- 9. Wait for success messages
-- 10. Refresh your app (Ctrl+Shift+R)
--
-- ═══════════════════════════════════════════════════════════════

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trial_days to pricing_config (if table exists)
DO $$ 
BEGIN
  -- Check if pricing_config table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pricing_config'
  ) THEN
    -- Add trial_days column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'pricing_config' 
      AND column_name = 'trial_days'
    ) THEN
      ALTER TABLE pricing_config ADD COLUMN trial_days INTEGER DEFAULT 14;
      RAISE NOTICE '✅ Added trial_days column to pricing_config';
    ELSE
      RAISE NOTICE '✅ trial_days column already exists';
    END IF;
  ELSE
    -- Create pricing_config table if it doesn't exist
    CREATE TABLE pricing_config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      plan_type TEXT NOT NULL,
      monthly_price DECIMAL(10,2),
      annual_price DECIMAL(10,2),
      trial_days INTEGER DEFAULT 14,
      features JSONB,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE '✅ Created pricing_config table with trial_days';
  END IF;
END $$;

-- Set up Row Level Security for contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Public can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Public can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Public can delete contact messages" ON contact_messages;

-- Create simple policies (allow all for demo)
CREATE POLICY "Public can insert contact messages"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read contact messages"
  ON contact_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can update contact messages"
  ON contact_messages FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete contact messages"
  ON contact_messages FOR DELETE
  TO public
  USING (true);

-- Set up Row Level Security for pricing_config
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can read pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Public can update pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Public can insert pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Public can delete pricing config" ON pricing_config;

-- Create policies for pricing_config
CREATE POLICY "Public can read pricing config"
  ON pricing_config FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can update pricing config"
  ON pricing_config FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can insert pricing config"
  ON pricing_config FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can delete pricing config"
  ON pricing_config FOR DELETE
  TO public
  USING (true);

-- Verify setup
DO $$
DECLARE
  has_contact_messages BOOLEAN;
  has_pricing_config BOOLEAN;
  has_trial_days BOOLEAN;
BEGIN
  -- Check contact_messages
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'contact_messages'
  ) INTO has_contact_messages;
  
  -- Check pricing_config
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'pricing_config'
  ) INTO has_pricing_config;
  
  -- Check trial_days
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'pricing_config' 
    AND column_name = 'trial_days'
  ) INTO has_trial_days;
  
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE '        SETUP VERIFICATION';
  RAISE NOTICE '═══════════════════════════════════════';
  
  IF has_contact_messages THEN
    RAISE NOTICE '✅ contact_messages table exists';
  ELSE
    RAISE NOTICE '❌ contact_messages table MISSING';
  END IF;
  
  IF has_pricing_config THEN
    RAISE NOTICE '✅ pricing_config table exists';
  ELSE
    RAISE NOTICE '❌ pricing_config table MISSING';
  END IF;
  
  IF has_trial_days THEN
    RAISE NOTICE '✅ trial_days column exists';
  ELSE
    RAISE NOTICE '❌ trial_days column MISSING';
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════';
  
  IF has_contact_messages AND has_pricing_config AND has_trial_days THEN
    RAISE NOTICE '🎉 ALL CHECKS PASSED!';
    RAISE NOTICE 'Now refresh your browser: Ctrl+Shift+R';
  ELSE
    RAISE NOTICE '⚠️  Some checks failed. Review errors above.';
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════';
END $$;

-- Show table structures
SELECT 
  'contact_messages columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'contact_messages'
ORDER BY ordinal_position;

SELECT 
  'pricing_config columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'pricing_config'
ORDER BY ordinal_position;

-- ═══════════════════════════════════════════════════════════════
-- ✅ DONE! 
-- Look at the "Messages" tab in Supabase to see the results
-- You should see ✅ for all checks
-- Now refresh your browser and the error will be gone!
-- ═══════════════════════════════════════════════════════════════
