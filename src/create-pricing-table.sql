-- SQL Script to Create Pricing Configuration Table
-- Run this in your Supabase SQL Editor

-- Create pricing_config table
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plans JSONB NOT NULL,
  global_discount NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for displaying pricing on website)
CREATE POLICY "Public can view pricing" ON pricing_config
  FOR SELECT
  USING (true);

-- Only authenticated users can insert/update (Super Admin)
CREATE POLICY "Authenticated users can manage pricing" ON pricing_config
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pricing_config_updated_at ON pricing_config(updated_at DESC);

-- Insert default pricing configuration
INSERT INTO pricing_config (plans, global_discount)
VALUES (
  '[
    {
      "id": "starter",
      "name": "Starter",
      "monthlyPrice": 0,
      "yearlyPrice": 0,
      "isVisible": true,
      "limits": { "users": 10, "projects": 10, "storageGB": 5 },
      "features": {
        "analytics": false,
        "export": true,
        "aiInsights": false,
        "prioritySupport": false,
        "customIntegrations": false
      }
    },
    {
      "id": "growth",
      "name": "Growth",
      "monthlyPrice": 99,
      "yearlyPrice": 990,
      "isVisible": true,
      "limits": { "users": 500, "projects": 100, "storageGB": 50 },
      "features": {
        "analytics": true,
        "export": true,
        "aiInsights": false,
        "prioritySupport": true,
        "customIntegrations": false
      }
    },
    {
      "id": "professional",
      "name": "Professional",
      "monthlyPrice": 249,
      "yearlyPrice": 2490,
      "isVisible": true,
      "isPopular": true,
      "limits": { "users": 2000, "projects": 500, "storageGB": 200 },
      "features": {
        "analytics": true,
        "export": true,
        "aiInsights": true,
        "prioritySupport": true,
        "customIntegrations": true
      }
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "monthlyPrice": 999,
      "yearlyPrice": 9990,
      "isVisible": true,
      "limits": { "users": 99999, "projects": 99999, "storageGB": 1000 },
      "features": {
        "analytics": true,
        "export": true,
        "aiInsights": true,
        "prioritySupport": true,
        "customIntegrations": true
      }
    }
  ]'::jsonb,
  0
)
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT * FROM pricing_config ORDER BY updated_at DESC LIMIT 1;
