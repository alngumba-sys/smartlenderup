-- =====================================================
-- SUPABASE DATABASE SETUP FOR SMARTLENDERUP
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE CONTACT_MESSAGES TABLE
-- =====================================================

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS contact_messages CASCADE;

-- Create contact_messages table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_messages
-- Allow anyone to insert (send contact message)
CREATE POLICY "Anyone can send contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to read all messages (for Super Admin)
CREATE POLICY "Authenticated users can read contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update messages (mark as read/unread)
CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete messages
CREATE POLICY "Authenticated users can delete contact messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Also allow anonymous users to read/update/delete for demo purposes
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

-- Check if pricing_config table exists, if not create it
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name TEXT NOT NULL UNIQUE,
  monthly_price DECIMAL(10, 2) NOT NULL,
  annual_price DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  trial_days INTEGER DEFAULT 14,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trial_days column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pricing_config' AND column_name = 'trial_days'
  ) THEN
    ALTER TABLE pricing_config ADD COLUMN trial_days INTEGER DEFAULT 14;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_pricing_config_plan_name ON pricing_config(plan_name);
CREATE INDEX IF NOT EXISTS idx_pricing_config_is_active ON pricing_config(is_active);

-- Enable Row Level Security
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Create policies for pricing_config
CREATE POLICY "Anyone can read pricing config"
  ON pricing_config
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update pricing config"
  ON pricing_config
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert pricing config"
  ON pricing_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for anonymous users (for demo)
CREATE POLICY "Anonymous users can update pricing config"
  ON pricing_config
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can insert pricing config"
  ON pricing_config
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- =====================================================
-- 3. INSERT DEFAULT PRICING DATA (IF NOT EXISTS)
-- =====================================================

-- Insert or update Growth plan
INSERT INTO pricing_config (
  plan_name, 
  monthly_price, 
  annual_price, 
  trial_days, 
  features,
  is_active
) VALUES (
  'Growth',
  199,
  1990,
  14,
  '["Up to 500 active clients", "Basic loan products", "Standard reporting", "Email support", "Mobile access"]'::jsonb,
  true
)
ON CONFLICT (plan_name) 
DO UPDATE SET 
  trial_days = EXCLUDED.trial_days,
  updated_at = NOW();

-- Insert or update Professional plan
INSERT INTO pricing_config (
  plan_name, 
  monthly_price, 
  annual_price, 
  trial_days, 
  features,
  is_active
) VALUES (
  'Professional',
  299,
  2990,
  14,
  '["Up to 2,000 active clients", "Advanced loan products", "Custom workflows", "Priority support", "API access", "Advanced analytics"]'::jsonb,
  true
)
ON CONFLICT (plan_name) 
DO UPDATE SET 
  trial_days = EXCLUDED.trial_days,
  updated_at = NOW();

-- Insert or update Enterprise plan
INSERT INTO pricing_config (
  plan_name, 
  monthly_price, 
  annual_price, 
  trial_days, 
  features,
  is_active
) VALUES (
  'Enterprise',
  599,
  5990,
  14,
  '["Unlimited clients", "Full feature access", "Dedicated support", "Custom integrations", "White-label options", "SLA guarantee"]'::jsonb,
  true
)
ON CONFLICT (plan_name) 
DO UPDATE SET 
  trial_days = EXCLUDED.trial_days,
  updated_at = NOW();

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Verify contact_messages table
SELECT 'contact_messages table created' as status, 
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'contact_messages') as exists;

-- Verify pricing_config table and trial_days column
SELECT 'pricing_config.trial_days column' as status,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'pricing_config' AND column_name = 'trial_days') as exists;

-- Show current pricing config
SELECT id, plan_name, monthly_price, annual_price, trial_days, is_active 
FROM pricing_config 
ORDER BY monthly_price;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Now you can:
-- 1. Send contact messages from the landing page
-- 2. View them in Super Admin Dashboard
-- 3. Configure trial periods in Pricing Control Panel
-- =====================================================
