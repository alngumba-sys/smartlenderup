-- =====================================================
-- FRESH LOAN PRODUCTS TABLE CREATION
-- =====================================================
-- This drops the existing table and creates it correctly
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: DROP EXISTING TABLE (if exists)
-- =====================================================
DROP TABLE IF EXISTS loan_products CASCADE;

-- =====================================================
-- STEP 2: CREATE NEW LOAN PRODUCTS TABLE
-- =====================================================
CREATE TABLE loan_products (
  -- Primary Key with auto-generated UUID
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization reference
  organization_id UUID NOT NULL,
  
  -- Product identification
  product_name VARCHAR(255) NOT NULL,
  name VARCHAR(255),  -- Alternate name field
  product_code VARCHAR(50) UNIQUE,
  description TEXT,
  
  -- Amount limits (support both naming conventions)
  min_amount DECIMAL(15,2) DEFAULT 0,
  max_amount DECIMAL(15,2) DEFAULT 10000000,
  minimum_amount DECIMAL(15,2) DEFAULT 0,
  maximum_amount DECIMAL(15,2) DEFAULT 10000000,
  
  -- Term/Tenor limits (support both naming conventions)
  min_term INTEGER DEFAULT 1,
  max_term INTEGER DEFAULT 60,
  minimum_term INTEGER DEFAULT 1,
  maximum_term INTEGER DEFAULT 60,
  term_unit VARCHAR(20) DEFAULT 'Months',
  
  -- Interest configuration
  interest_rate DECIMAL(5,2) DEFAULT 0,
  interest_method VARCHAR(50) DEFAULT 'flat',  -- flat, reducing_balance, etc.
  interest_type VARCHAR(50) DEFAULT 'Flat',    -- Flat, Reducing Balance, etc.
  
  -- Repayment configuration
  repayment_frequency VARCHAR(50) DEFAULT 'monthly',  -- monthly, weekly, daily, etc.
  
  -- Fees and charges
  processing_fee_percentage DECIMAL(5,2) DEFAULT 0,
  processing_fee_fixed DECIMAL(15,2) DEFAULT 0,
  insurance_fee_fixed DECIMAL(15,2) DEFAULT 0,
  
  -- Requirements (support both naming conventions)
  guarantor_required BOOLEAN DEFAULT false,
  collateral_required BOOLEAN DEFAULT false,
  require_guarantor BOOLEAN DEFAULT false,
  require_collateral BOOLEAN DEFAULT false,
  
  -- Product status
  status VARCHAR(20) DEFAULT 'active',  -- active, inactive, archived
  
  -- Audit timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Optional: user who created/modified
  created_by UUID,
  updated_by UUID
);

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on organization_id (most common query filter)
CREATE INDEX idx_loan_products_organization ON loan_products(organization_id);

-- Index on status for filtering active products
CREATE INDEX idx_loan_products_status ON loan_products(status);

-- Index on product_code for lookups
CREATE INDEX idx_loan_products_code ON loan_products(product_code);

-- Index on created_at for sorting
CREATE INDEX idx_loan_products_created ON loan_products(created_at DESC);

-- =====================================================
-- STEP 4: ADD ROW LEVEL SECURITY (RLS) - OPTIONAL
-- =====================================================

-- Enable RLS (if you want organization-level security)
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see products from their organization
-- Uncomment this if you want RLS enabled:
/*
CREATE POLICY "Users can view their organization's products"
  ON loan_products
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert products for their organization"
  ON loan_products
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's products"
  ON loan_products
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );
*/

-- =====================================================
-- STEP 5: CREATE UPDATE TRIGGER FOR updated_at
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loan_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that calls the function before update
CREATE TRIGGER trigger_loan_products_updated_at
  BEFORE UPDATE ON loan_products
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_products_updated_at();

-- =====================================================
-- STEP 6: INSERT SAMPLE LOAN PRODUCTS (OPTIONAL)
-- =====================================================

-- You can insert sample products for testing
-- Replace 'YOUR_ORG_ID_HERE' with your actual organization UUID

/*
INSERT INTO loan_products (
  organization_id,
  product_name,
  product_code,
  description,
  min_amount,
  max_amount,
  min_term,
  max_term,
  interest_rate,
  interest_method,
  repayment_frequency,
  processing_fee_percentage,
  guarantor_required,
  collateral_required
) VALUES 
(
  'YOUR_ORG_ID_HERE',  -- Replace with your organization ID
  'Emergency Loan',
  'PROD-EMERG',
  'Quick access loan for emergencies',
  5000,
  50000,
  1,
  6,
  15.00,
  'flat',
  'monthly',
  2.00,
  false,
  false
),
(
  'YOUR_ORG_ID_HERE',  -- Replace with your organization ID
  'Business Loan',
  'PROD-BUS',
  'Loan for business expansion',
  50000,
  500000,
  6,
  24,
  12.00,
  'reducing_balance',
  'monthly',
  3.00,
  true,
  true
),
(
  'YOUR_ORG_ID_HERE',  -- Replace with your organization ID
  'Salary Advance',
  'PROD-SAL',
  'Short-term salary advance',
  1000,
  20000,
  1,
  3,
  10.00,
  'flat',
  'monthly',
  1.00,
  false,
  false
);
*/

-- =====================================================
-- STEP 7: VERIFY TABLE STRUCTURE
-- =====================================================

-- Display all columns and their properties
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  column_default,
  is_nullable,
  CASE 
    WHEN column_name = 'id' THEN '✅ PRIMARY KEY'
    WHEN column_name = 'organization_id' THEN '⚠️ REQUIRED'
    WHEN column_name = 'product_name' THEN '⚠️ REQUIRED'
    ELSE ''
  END as notes
FROM information_schema.columns
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;

-- Display indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'loan_products';

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Your loan_products table is now ready!
-- 
-- Key features:
-- ✅ Auto-generated UUIDs for id
-- ✅ NO user_id requirement (that was the problem!)
-- ✅ Support for both naming conventions (min_amount AND minimum_amount)
-- ✅ Proper defaults for all columns
-- ✅ Indexes for fast queries
-- ✅ Auto-updating updated_at timestamp
-- ✅ Optional RLS policies (commented out)
-- 
-- Next step: Try creating a loan product in your app!
-- =====================================================
