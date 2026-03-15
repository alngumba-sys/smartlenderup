-- ============================================
-- ⚡ COPY/PASTE THIS INTO SUPABASE SQL EDITOR
-- ============================================
-- This fixes: "column product_code does not exist"
-- ============================================

-- Step 1: Add the missing product_code column
ALTER TABLE public.loan_products 
ADD COLUMN IF NOT EXISTS product_code TEXT;

-- Step 2: Generate product codes for existing products (if any) using CTE
WITH numbered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM public.loan_products
  WHERE product_code IS NULL
)
UPDATE public.loan_products lp
SET product_code = 'PROD-' || LPAD(numbered_products.row_num::TEXT, 4, '0')
FROM numbered_products
WHERE lp.id = numbered_products.id;

-- Step 3: Make it required (NOT NULL)
ALTER TABLE public.loan_products 
ALTER COLUMN product_code SET NOT NULL;

-- Step 4: Make it unique
ALTER TABLE public.loan_products 
ADD CONSTRAINT loan_products_product_code_unique UNIQUE (product_code);

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_loan_products_code 
ON public.loan_products(product_code);

-- ============================================
-- ✅ DONE! Now:
-- 1. Refresh your browser (Ctrl+Shift+R)
-- 2. Errors will be gone!
-- 3. You can create loan products and loans!
-- ============================================

-- Verify the fix:
SELECT 
  id, 
  product_name, 
  product_code,
  created_at 
FROM public.loan_products 
LIMIT 5;