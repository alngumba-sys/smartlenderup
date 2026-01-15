-- =====================================================
-- ADD TRIAL AND PAYMENT COLUMNS TO ORGANIZATIONS TABLE
-- SmartLenderUp Test Project
-- =====================================================
-- This script adds the missing trial and payment-related
-- columns to the organizations table
-- =====================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql
-- =====================================================

-- Add trial and payment columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(12, 2);

-- Add comments for documentation
COMMENT ON COLUMN organizations.trial_start_date IS 'Date when the trial started';
COMMENT ON COLUMN organizations.trial_end_date IS 'Date when the trial ends (14 days from start)';
COMMENT ON COLUMN organizations.subscription_status IS 'Status: trial, active, expired, cancelled';
COMMENT ON COLUMN organizations.payment_status IS 'Payment status: pending, paid, overdue';
COMMENT ON COLUMN organizations.subscription_plan IS 'Plan type: basic, professional, enterprise';
COMMENT ON COLUMN organizations.last_payment_date IS 'Date of last successful payment';
COMMENT ON COLUMN organizations.payment_amount IS 'Amount paid in last transaction';

-- Update existing organizations to have trial dates (14 days from created_at)
UPDATE organizations 
SET 
  trial_start_date = created_at,
  trial_end_date = created_at + INTERVAL '14 days',
  subscription_status = 'trial',
  payment_status = 'pending'
WHERE trial_start_date IS NULL;

-- Create index for faster queries on subscription status
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status 
ON organizations(subscription_status);

CREATE INDEX IF NOT EXISTS idx_organizations_payment_status 
ON organizations(payment_status);

CREATE INDEX IF NOT EXISTS idx_organizations_trial_end_date 
ON organizations(trial_end_date);

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
  AND column_name IN (
    'trial_start_date',
    'trial_end_date', 
    'subscription_status',
    'payment_status',
    'subscription_plan',
    'last_payment_date',
    'payment_amount'
  )
ORDER BY column_name;

-- =====================================================
-- MIGRATION COMPLETE!
-- The organizations table now has all required columns
-- for trial and payment management
-- =====================================================
