-- ========================================
-- SmartLenderUp Database Migration Script
-- For Live Production Environment
-- Project ID: yrsnylrcgejnrxphjvtf
-- ========================================

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS project_states CASCADE;
DROP TABLE IF EXISTS stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS stripe_customers CASCADE;

-- ========================================
-- 1. PROJECT STATES TABLE
-- Single-object sync pattern for all app data
-- ========================================
CREATE TABLE project_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  project_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one project per user+org combination
  UNIQUE(user_id, organization_name)
);

-- Add index for faster queries
CREATE INDEX idx_project_states_user_org ON project_states(user_id, organization_name);
CREATE INDEX idx_project_states_updated ON project_states(updated_at DESC);

-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_states_updated_at
  BEFORE UPDATE ON project_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 2. STRIPE CUSTOMERS TABLE
-- Track Stripe customer information
-- ========================================
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  organization_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_customers_user ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 3. STRIPE SUBSCRIPTIONS TABLE
-- Track subscription status and trial info
-- ========================================
CREATE TABLE stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key to stripe_customers
  CONSTRAINT fk_stripe_customer 
    FOREIGN KEY (stripe_customer_id) 
    REFERENCES stripe_customers(stripe_customer_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_stripe_subscriptions_user ON stripe_subscriptions(user_id);
CREATE INDEX idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX idx_stripe_subscriptions_customer ON stripe_subscriptions(stripe_customer_id);
CREATE INDEX idx_stripe_subscriptions_status ON stripe_subscriptions(status);

CREATE TRIGGER update_stripe_subscriptions_updated_at
  BEFORE UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE project_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Project States Policies
CREATE POLICY "Users can view their own project states"
  ON project_states FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own project states"
  ON project_states FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own project states"
  ON project_states FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own project states"
  ON project_states FOR DELETE
  USING (auth.uid()::text = user_id);

-- Stripe Customers Policies
CREATE POLICY "Users can view their own stripe customer info"
  ON stripe_customers FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own stripe customer info"
  ON stripe_customers FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own stripe customer info"
  ON stripe_customers FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Stripe Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions"
  ON stripe_subscriptions FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON stripe_subscriptions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON stripe_subscriptions FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ========================================
-- 5. SAMPLE DATA (Optional - for testing)
-- ========================================

-- You can insert sample data here if needed
-- Example:
-- INSERT INTO project_states (user_id, organization_name, project_data)
-- VALUES (
--   'test-user-123',
--   'SmartLenderUp Demo',
--   '{
--     "clients": [],
--     "loans": [],
--     "payments": [],
--     "settings": {}
--   }'::jsonb
-- );

-- ========================================
-- 6. VERIFICATION QUERIES
-- ========================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('project_states', 'stripe_customers', 'stripe_subscriptions');

-- Verify indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('project_states', 'stripe_customers', 'stripe_subscriptions');

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('project_states', 'stripe_customers', 'stripe_subscriptions');

-- ========================================
-- MIGRATION COMPLETE! ✅
-- ========================================
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all tables, indexes, and policies are created
-- 3. Test your application with the live database
-- ========================================
