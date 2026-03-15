-- =====================================================
-- CLEANUP DUPLICATE LOAN PRODUCTS
-- Run this in your Supabase SQL Editor if you're still getting duplicate key errors
-- =====================================================

-- Step 1: Check for duplicate product codes
SELECT 
  product_code,
  COUNT(*) as count,
  array_agg(id) as product_ids,
  array_agg(product_name) as product_names
FROM loan_products
GROUP BY product_code
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Step 2: (OPTIONAL) Delete ALL loan products for your organization
-- ⚠️ CAUTION: This will delete all products. Only run if you want a fresh start.
-- Uncomment the line below and replace 'YOUR_ORG_ID_HERE' with your actual organization ID

-- DELETE FROM loan_products WHERE organization_id = 'YOUR_ORG_ID_HERE';

-- Step 3: (SAFER) Keep only the most recent product for each duplicate code
-- This keeps one and deletes the rest
WITH duplicates AS (
  SELECT 
    id,
    product_code,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY product_code ORDER BY created_at DESC) as row_num
  FROM loan_products
)
DELETE FROM loan_products
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);

-- Step 4: Verify cleanup
SELECT 
  product_code,
  product_name,
  organization_id,
  created_at
FROM loan_products
ORDER BY created_at DESC
LIMIT 20;

-- Step 5: Check constraint
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'loan_products'::regclass
AND conname LIKE '%product_code%';
