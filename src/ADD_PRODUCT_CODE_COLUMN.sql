-- ============================================
-- ✅ ADD PRODUCT_CODE COLUMN TO LOAN_PRODUCTS
-- ============================================
-- This fixes the error:
-- "column loan_products.product_code does not exist"
-- ============================================

-- Add the product_code column if it doesn't exist
DO $$ 
BEGIN
  -- Check if product_code column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'loan_products' 
      AND column_name = 'product_code'
  ) THEN
    -- Add the column
    ALTER TABLE public.loan_products 
    ADD COLUMN product_code TEXT;
    
    -- Generate product codes for existing products using CTE
    -- Format: ORG-PROD-001, ORG-PROD-002, etc.
    WITH numbered_products AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
      FROM public.loan_products
      WHERE product_code IS NULL
    )
    UPDATE public.loan_products lp
    SET product_code = 'PROD-' || LPAD(numbered_products.row_num::TEXT, 4, '0')
    FROM numbered_products
    WHERE lp.id = numbered_products.id;
    
    -- Make it NOT NULL after populating
    ALTER TABLE public.loan_products 
    ALTER COLUMN product_code SET NOT NULL;
    
    -- Make it UNIQUE
    ALTER TABLE public.loan_products 
    ADD CONSTRAINT loan_products_product_code_unique UNIQUE (product_code);
    
    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS idx_loan_products_code 
    ON public.loan_products(product_code);
    
    RAISE NOTICE '✅ product_code column added successfully!';
  ELSE
    RAISE NOTICE '✅ product_code column already exists!';
  END IF;
END $$;

-- ============================================
-- ✅ VERIFY THE FIX
-- ============================================
SELECT 
  id, 
  product_name, 
  product_code,
  organization_id 
FROM public.loan_products 
LIMIT 5;

-- ============================================
-- ✅ DONE!
-- ============================================
-- The product_code column is now added
-- Your app should work now! 🎉
-- ============================================