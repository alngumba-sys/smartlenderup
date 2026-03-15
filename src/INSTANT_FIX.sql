-- =========================================
-- INSTANT FIX: Remove Duplicate Products
-- Run this in Supabase SQL Editor NOW
-- =========================================

-- Step 1: Find and show duplicates
SELECT 
  product_code,
  COUNT(*) as duplicate_count,
  STRING_AGG(product_name, ', ') as product_names
FROM loan_products
GROUP BY product_code
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Delete duplicates (keeps newest for each code)
WITH duplicates AS (
  SELECT 
    id,
    product_code,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY product_code 
      ORDER BY created_at DESC
    ) as row_num
  FROM loan_products
)
DELETE FROM loan_products
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);

-- Step 3: Verify cleanup
SELECT 
  product_code,
  COUNT(*) as count
FROM loan_products
GROUP BY product_code
HAVING COUNT(*) > 1;

-- Should return 0 rows if successful!

-- Step 4: Add unique constraint (prevents future duplicates)
ALTER TABLE loan_products
DROP CONSTRAINT IF EXISTS unique_product_code_per_org;

ALTER TABLE loan_products
ADD CONSTRAINT unique_product_code_per_org 
UNIQUE (organization_id, product_code);

-- ✅ DONE! Duplicates removed and future duplicates prevented
