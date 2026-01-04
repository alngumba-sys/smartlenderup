-- =====================================================
-- COMPLETE LOAN PRODUCTS TABLE FIX
-- =====================================================
-- Run this ENTIRE file in Supabase SQL Editor to fix all loan product issues
-- This fixes: "null value in column 'id'" AND adds all missing columns

-- =====================================================
-- STEP 1: FIX THE ID COLUMN (Critical - fixes immediate error)
-- =====================================================

-- Add UUID default generator to id column
ALTER TABLE loan_products 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Enable UUID extension if needed (for older PostgreSQL versions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 2: ADD ALL MISSING COLUMNS
-- =====================================================

-- Amount columns
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

-- Term columns
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

-- Name columns
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

-- Description
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'description') THEN
    ALTER TABLE loan_products ADD COLUMN description TEXT;
  END IF;
END $$;

-- Interest columns
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

-- Repayment frequency
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'repayment_frequency') THEN
    ALTER TABLE loan_products ADD COLUMN repayment_frequency VARCHAR(50) DEFAULT 'monthly';
  END IF;
END $$;

-- Fee columns
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

-- Requirement columns
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

-- Product code
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'product_code') THEN
    ALTER TABLE loan_products ADD COLUMN product_code VARCHAR(50);
  END IF;
END $$;

-- Status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'status') THEN
    ALTER TABLE loan_products ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;
END $$;

-- Timestamps
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

-- Organization ID
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loan_products' AND column_name = 'organization_id') THEN
    ALTER TABLE loan_products ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- =====================================================
-- STEP 3: VERIFY THE FIX
-- =====================================================

-- Show all columns in loan_products table
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see the list of columns above, the fix was successful!
-- You should see:
-- - id with gen_random_uuid() default
-- - All the columns listed above
-- 
-- Now try creating a loan product in your app!
-- =====================================================
