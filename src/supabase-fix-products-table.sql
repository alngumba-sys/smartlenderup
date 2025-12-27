-- =============================================
-- FIX: Rename products table to loan_products
-- =============================================
-- This script renames the 'products' table to 'loan_products' 
-- to match the application's expected table name

-- Step 1: Rename the table
ALTER TABLE IF EXISTS products RENAME TO loan_products;

-- Step 2: Verify the table exists and show structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;

-- Step 3: Verify data migration
SELECT COUNT(*) as total_products FROM loan_products;

-- Note: Run this script in your Supabase SQL Editor
-- Location: Supabase Dashboard > SQL Editor > New Query
