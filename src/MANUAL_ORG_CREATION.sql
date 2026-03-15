-- =====================================================
-- MANUAL ORGANIZATION CREATION FOR victormuthama@gmail.com
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Insert organization for victormuthama@gmail.com
INSERT INTO organizations (
  id,
  organization_name,
  organization_type,
  country,
  currency,
  email,
  phone,
  address,
  password_hash,
  username,
  status
) VALUES (
  gen_random_uuid(),                    -- Auto-generate UUID
  'Victor Test Organization',           -- Organization name (change as needed)
  'mother_company',                     -- Organization type
  'Kenya',                              -- Country
  'KES',                                -- Currency
  'victormuthama@gmail.com',           -- Email (LOGIN USERNAME)
  '+254712345678',                     -- Phone (change as needed)
  'Nairobi, Kenya',                    -- Address (change as needed)
  'Test@2345',                         -- PASSWORD (PLAIN TEXT - matches your screenshot)
  'VICT',                              -- Username code (4 letters, auto-generated)
  'active'                             -- Status
);

-- Verify the organization was created
SELECT 
  id,
  organization_name,
  email,
  password_hash,
  username,
  status,
  created_at
FROM organizations 
WHERE email = 'victormuthama@gmail.com';
