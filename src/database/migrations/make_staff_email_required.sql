-- Make email required for staff users
-- Run this migration in your Supabase SQL Editor

-- Step 1: Update any existing records with null emails to a placeholder
-- (You should manually update these with real emails before running this migration)
UPDATE staff_users
SET email = CONCAT('staff_', id, '@placeholder.local')
WHERE email IS NULL OR email = '';

-- Step 2: Make the email column NOT NULL
ALTER TABLE staff_users
ALTER COLUMN email SET NOT NULL;

-- Step 3: Add a unique constraint on email within the same organization
-- This prevents duplicate emails within the same organization
ALTER TABLE staff_users
ADD CONSTRAINT staff_users_email_org_unique UNIQUE (organization_id, email);

-- Verification query
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'staff_users' 
AND column_name = 'email';
