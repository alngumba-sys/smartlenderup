-- =====================================================
-- UPDATE ORGANIZATION DETAILS TO BV FUNGUO LTD
-- =====================================================

-- Update the organization name and email
-- Note: Replace YOUR_ORGANIZATION_ID with your actual organization ID from the organizations table

UPDATE organizations
SET 
  organization_name = 'BV Funguo Ltd',
  email = 'victormuthama@gmail.com',
  updated_at = NOW()
WHERE id::text = (SELECT id::text FROM organizations LIMIT 1);

-- Verify the update
SELECT 
  id,
  organization_name,
  email,
  phone,
  country,
  created_at,
  updated_at
FROM organizations
WHERE organization_name = 'BV Funguo Ltd';
