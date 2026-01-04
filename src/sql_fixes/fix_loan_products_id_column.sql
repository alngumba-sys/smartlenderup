-- =====================================================
-- FIX LOAN PRODUCTS ID COLUMN - ADD UUID DEFAULT
-- =====================================================
-- This fixes the "null value in column 'id'" error

-- Option 1: Add UUID default generator to id column
ALTER TABLE loan_products 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Option 2: If the above doesn't work, try using uuid_generate_v4()
-- First enable the extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Then set the default
ALTER TABLE loan_products 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Verify the change
SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'loan_products' AND column_name = 'id';

-- =====================================================
-- RESULT SHOULD SHOW:
-- column_name | column_default              | is_nullable
-- id          | gen_random_uuid() or uuid...| NO
-- =====================================================
