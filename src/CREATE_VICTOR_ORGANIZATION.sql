-- ============================================
-- CREATE VICTOR MUTHAMA'S ORGANIZATION
-- ============================================
-- This script creates an organization for victormuthama@gmail.com
-- so you can login with your email
-- ============================================

-- Step 1: Ensure the organizations table exists (run this if you haven't set up the database yet)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  organization_type TEXT DEFAULT 'mother_company',
  parent_id UUID,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  country TEXT DEFAULT 'Kenya',
  currency TEXT DEFAULT 'KES',
  subscription_status TEXT DEFAULT 'trial',
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '14 days',
  subscription_plan TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  number_format TEXT DEFAULT 'comma',
  fiscal_year_start TEXT DEFAULT '01-01',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE
);

-- Step 2: Disable RLS for testing (IMPORTANT!)
ALTER TABLE IF EXISTS organizations DISABLE ROW LEVEL SECURITY;

-- Step 3: Create Victor's organization
-- ⚠️ IMPORTANT: Change the password below to your desired password!
INSERT INTO organizations (
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
  password_hash,
  username
) VALUES (
  'BV Funguo Ltd',  -- Organization name
  'mother_company',
  'victormuthama@gmail.com',  -- Your email
  '+254700000000',  -- Your phone number (change this!)
  'Nairobi, Kenya',
  'Kenya',
  'KES',
  'trial',
  NOW(),
  NOW() + INTERVAL '14 days',
  'active',
  'Victor@123',  -- ⚠️ CHANGE THIS PASSWORD! (this is what you'll use to login)
  'victormuthama'  -- Username (optional, can login with email instead)
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Step 4: Verify the organization was created
SELECT 
  id,
  organization_name,
  email,
  username,
  phone,
  country,
  currency,
  status,
  subscription_status,
  trial_end_date,
  created_at
FROM organizations 
WHERE email = 'victormuthama@gmail.com';

-- Step 5: Check if other required tables exist
SELECT 
  'organizations' as table_name, 
  COUNT(*) as row_count 
FROM organizations
UNION ALL
SELECT 
  'clients' as table_name, 
  COALESCE((SELECT COUNT(*) FROM clients WHERE organization_id IN (SELECT id FROM organizations WHERE email = 'victormuthama@gmail.com')), 0) as row_count
UNION ALL
SELECT 
  'loans' as table_name, 
  COALESCE((SELECT COUNT(*) FROM loans WHERE organization_id IN (SELECT id FROM organizations WHERE email = 'victormuthama@gmail.com')), 0) as row_count;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Organization created successfully!' as status;
SELECT '📧 Email: victormuthama@gmail.com' as login_email;
SELECT '🔑 Password: Victor@123' as login_password;
SELECT '⚠️  IMPORTANT: Change the password in line 51 before running this script!' as warning;
SELECT '👉 Next step: Login to SmartLenderUp with your credentials' as next_step;

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If you get an error "relation organizations does not exist":
-- 1. First run: /supabase/COMPLETE_DATABASE_SETUP.sql
-- 2. Then run this script again

-- If you get an error about RLS:
-- 1. Run: /supabase/DISABLE_RLS_FOR_TESTING.sql
-- 2. Then run this script again

-- If you want to change the password later:
-- UPDATE organizations 
-- SET password_hash = 'YourNewPassword', updated_at = NOW() 
-- WHERE email = 'victormuthama@gmail.com';
