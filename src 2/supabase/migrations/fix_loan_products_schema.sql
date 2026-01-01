-- Migration: Update loan_products table to match application needs
-- This adds missing columns and ensures compatibility

-- Add product_code column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'product_code'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN product_code TEXT;
    
    -- Populate existing records with generated codes
    UPDATE loan_products 
    SET product_code = CONCAT(UPPER(SUBSTRING(name, 1, 4)), '-', EXTRACT(EPOCH FROM NOW())::TEXT)
    WHERE product_code IS NULL;
    
    RAISE NOTICE 'Added product_code column';
  ELSE
    RAISE NOTICE 'product_code column already exists';
  END IF;
END $$;

-- Add repayment_frequency column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'repayment_frequency'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN repayment_frequency TEXT DEFAULT 'monthly';
    
    RAISE NOTICE 'Added repayment_frequency column';
  ELSE
    RAISE NOTICE 'repayment_frequency column already exists';
  END IF;
END $$;

-- Add insurance_fee_fixed column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'insurance_fee_fixed'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN insurance_fee_fixed NUMERIC(10,2) DEFAULT 0;
    
    RAISE NOTICE 'Added insurance_fee_fixed column';
  ELSE
    RAISE NOTICE 'insurance_fee_fixed column already exists';
  END IF;
END $$;

-- Add processing_fee_fixed column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'processing_fee_fixed'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN processing_fee_fixed NUMERIC(10,2) DEFAULT 0;
    
    RAISE NOTICE 'Added processing_fee_fixed column';
  ELSE
    RAISE NOTICE 'processing_fee_fixed column already exists';
  END IF;
END $$;

-- Add interest_method column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'interest_method'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN interest_method TEXT DEFAULT 'flat';
    
    RAISE NOTICE 'Added interest_method column';
  ELSE
    RAISE NOTICE 'interest_method column already exists';
  END IF;
END $$;

-- Update existing records to have default values
UPDATE loan_products 
SET repayment_frequency = 'monthly' 
WHERE repayment_frequency IS NULL;

UPDATE loan_products 
SET insurance_fee_fixed = 0 
WHERE insurance_fee_fixed IS NULL;

UPDATE loan_products 
SET processing_fee_fixed = 0 
WHERE processing_fee_fixed IS NULL;

UPDATE loan_products 
SET interest_method = 'flat' 
WHERE interest_method IS NULL;

-- Add comments
COMMENT ON COLUMN loan_products.repayment_frequency IS 'Frequency of loan repayments (daily, weekly, monthly, quarterly, annually)';
COMMENT ON COLUMN loan_products.insurance_fee_fixed IS 'Fixed insurance fee amount charged at loan disbursement';
COMMENT ON COLUMN loan_products.processing_fee_fixed IS 'Fixed processing fee amount charged at loan disbursement';
COMMENT ON COLUMN loan_products.interest_method IS 'Interest calculation method (flat, reducing_balance, compound)';
COMMENT ON COLUMN loan_products.product_code IS 'Unique product code for identification';
