-- =====================================================
-- FIX LOAN PRODUCTS TABLE - ADD MISSING COLUMNS
-- =====================================================
-- Run this SQL in Supabase SQL Editor to add all missing columns

-- 1. Add missing amount columns (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'min_amount') THEN
    ALTER TABLE loan_products ADD COLUMN min_amount DECIMAL(15,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'max_amount') THEN
    ALTER TABLE loan_products ADD COLUMN max_amount DECIMAL(15,2) DEFAULT 10000000;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'minimum_amount') THEN
    ALTER TABLE loan_products ADD COLUMN minimum_amount DECIMAL(15,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'maximum_amount') THEN
    ALTER TABLE loan_products ADD COLUMN maximum_amount DECIMAL(15,2) DEFAULT 10000000;
  END IF;
END $$;

-- 2. Add missing term columns (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'min_term') THEN
    ALTER TABLE loan_products ADD COLUMN min_term INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'max_term') THEN
    ALTER TABLE loan_products ADD COLUMN max_term INTEGER DEFAULT 60;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'minimum_term') THEN
    ALTER TABLE loan_products ADD COLUMN minimum_term INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'maximum_term') THEN
    ALTER TABLE loan_products ADD COLUMN maximum_term INTEGER DEFAULT 60;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'term_unit') THEN
    ALTER TABLE loan_products ADD COLUMN term_unit VARCHAR(20) DEFAULT 'Months';
  END IF;
END $$;

-- 3. Add missing name columns (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'name') THEN
    ALTER TABLE loan_products ADD COLUMN name VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'product_name') THEN
    ALTER TABLE loan_products ADD COLUMN product_name VARCHAR(255);
  END IF;
END $$;

-- 4. Add description column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'description') THEN
    ALTER TABLE loan_products ADD COLUMN description TEXT;
  END IF;
END $$;

-- 5. Add interest columns (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'interest_rate') THEN
    ALTER TABLE loan_products ADD COLUMN interest_rate DECIMAL(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'interest_method') THEN
    ALTER TABLE loan_products ADD COLUMN interest_method VARCHAR(50) DEFAULT 'flat';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'interest_type') THEN
    ALTER TABLE loan_products ADD COLUMN interest_type VARCHAR(50) DEFAULT 'Flat';
  END IF;
END $$;

-- 6. Add repayment frequency column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'repayment_frequency') THEN
    ALTER TABLE loan_products ADD COLUMN repayment_frequency VARCHAR(50) DEFAULT 'monthly';
  END IF;
END $$;

-- 7. Add fee columns (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'processing_fee_percentage') THEN
    ALTER TABLE loan_products ADD COLUMN processing_fee_percentage DECIMAL(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'processing_fee_fixed') THEN
    ALTER TABLE loan_products ADD COLUMN processing_fee_fixed DECIMAL(15,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'insurance_fee_fixed') THEN
    ALTER TABLE loan_products ADD COLUMN insurance_fee_fixed DECIMAL(15,2) DEFAULT 0;
  END IF;
END $$;

-- 8. Add requirement columns (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'guarantor_required') THEN
    ALTER TABLE loan_products ADD COLUMN guarantor_required BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'collateral_required') THEN
    ALTER TABLE loan_products ADD COLUMN collateral_required BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'require_guarantor') THEN
    ALTER TABLE loan_products ADD COLUMN require_guarantor BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'require_collateral') THEN
    ALTER TABLE loan_products ADD COLUMN require_collateral BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 9. Add product_code column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'product_code') THEN
    ALTER TABLE loan_products ADD COLUMN product_code VARCHAR(50);
  END IF;
END $$;

-- 10. Add status column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'status') THEN
    ALTER TABLE loan_products ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;
END $$;

-- 11. Add timestamp columns (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'created_at') THEN
    ALTER TABLE loan_products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'updated_at') THEN
    ALTER TABLE loan_products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- 12. Add organization_id column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'organization_id') THEN
    ALTER TABLE loan_products ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- =====================================================
-- VERIFY COLUMNS WERE ADDED
-- =====================================================
-- Run this to see all columns in loan_products table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;

-- =====================================================
-- NOTES
-- =====================================================
-- After running this SQL:
-- 1. All missing columns will be added to loan_products table
-- 2. The code will be able to insert loan products without errors
-- 3. You may need to update your RLS policies if organization_id was just added
