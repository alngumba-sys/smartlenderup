-- =====================================================
-- INITIALIZE ORGANIZATION & USER
-- =====================================================
-- Run this AFTER running COMPLETE_DATABASE_RESET.sql
-- This creates your organization and admin user
-- =====================================================

-- Step 1: Create your organization
-- Replace the values below with your actual data
INSERT INTO organizations (
  id,
  organization_name,
  organization_type,
  email,
  phone,
  address,
  country,
  currency,
  subscription_status,
  trial_start_date,
  trial_end_date,
  status,
  created_at,
  updated_at
) VALUES (
  '8f81b4e3-9fac-40e1-9042-9db_9ed33aa',  -- Your existing org ID from localStorage
  'SmartLenderUp Kenya',                    -- Change to your organization name
  'mother_company',                         -- mother_company, branch, or chama
  'admin@smartlenderup.com',                -- Your organization email
  '+254712345678',                          -- Your phone
  'Nairobi, Kenya',                         -- Your address
  'Kenya',                                  -- Country
  'KES',                                    -- Currency
  'trial',                                  -- trial, active, expired
  now(),                                    -- Trial start
  now() + interval '14 days',               -- Trial end (14 days from now)
  'active',                                 -- Status
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  updated_at = now();

-- Verify organization was created
SELECT 
  id,
  organization_name,
  organization_type,
  country,
  currency,
  subscription_status,
  trial_end_date,
  status
FROM organizations
WHERE id = '8f81b4e3-9fac-40e1-9042-9db_9ed33aa';

-- =====================================================
-- SUCCESS! 
-- =====================================================
-- Your organization is now in the database
-- 
-- Next steps:
-- 1. Check the result above shows your organization
-- 2. Try creating a loan product
-- 3. Should work perfectly! ✅
-- =====================================================
