-- Migration: Add missing fields to loan_products table
-- This adds repayment_frequency and insurance_fee_fixed columns

-- Add repayment_frequency column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'repayment_frequency'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN repayment_frequency TEXT DEFAULT 'monthly' 
    CHECK (repayment_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'));
    
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
    ADD COLUMN insurance_fee_fixed DECIMAL(10,2) DEFAULT 0;
    
    RAISE NOTICE 'Added insurance_fee_fixed column';
  ELSE
    RAISE NOTICE 'insurance_fee_fixed column already exists';
  END IF;
END $$;

-- Ensure interest_method column exists (it should already)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'interest_method'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN interest_method TEXT 
    CHECK (interest_method IN ('flat', 'reducing_balance', 'compound'));
    
    RAISE NOTICE 'Added interest_method column';
  ELSE
    RAISE NOTICE 'interest_method column already exists';
  END IF;
END $$;

-- Update existing records to have default repayment_frequency if null
UPDATE loan_products 
SET repayment_frequency = 'monthly' 
WHERE repayment_frequency IS NULL;

-- Update existing records to have default insurance_fee_fixed if null
UPDATE loan_products 
SET insurance_fee_fixed = 0 
WHERE insurance_fee_fixed IS NULL;

-- Add comment to clarify purpose
COMMENT ON COLUMN loan_products.repayment_frequency IS 'Frequency of loan repayments (daily, weekly, biweekly, monthly, quarterly, annually)';
COMMENT ON COLUMN loan_products.insurance_fee_fixed IS 'Fixed insurance fee amount charged at loan disbursement';
