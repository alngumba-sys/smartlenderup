-- =====================================================
-- MINIMAL LOAN PRODUCTS TABLE FIX
-- =====================================================
-- Just the essentials - no comments, no optional parts
-- Copy and paste this ENTIRE file into Supabase SQL Editor

DROP TABLE IF EXISTS loan_products CASCADE;

CREATE TABLE loan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  product_code VARCHAR(50) UNIQUE,
  description TEXT,
  min_amount DECIMAL(15,2) DEFAULT 0,
  max_amount DECIMAL(15,2) DEFAULT 10000000,
  minimum_amount DECIMAL(15,2) DEFAULT 0,
  maximum_amount DECIMAL(15,2) DEFAULT 10000000,
  min_term INTEGER DEFAULT 1,
  max_term INTEGER DEFAULT 60,
  minimum_term INTEGER DEFAULT 1,
  maximum_term INTEGER DEFAULT 60,
  term_unit VARCHAR(20) DEFAULT 'Months',
  interest_rate DECIMAL(5,2) DEFAULT 0,
  interest_method VARCHAR(50) DEFAULT 'flat',
  interest_type VARCHAR(50) DEFAULT 'Flat',
  repayment_frequency VARCHAR(50) DEFAULT 'monthly',
  processing_fee_percentage DECIMAL(5,2) DEFAULT 0,
  processing_fee_fixed DECIMAL(15,2) DEFAULT 0,
  insurance_fee_fixed DECIMAL(15,2) DEFAULT 0,
  guarantor_required BOOLEAN DEFAULT false,
  collateral_required BOOLEAN DEFAULT false,
  require_guarantor BOOLEAN DEFAULT false,
  require_collateral BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_loan_products_organization ON loan_products(organization_id);
CREATE INDEX idx_loan_products_status ON loan_products(status);
CREATE INDEX idx_loan_products_code ON loan_products(product_code);
CREATE INDEX idx_loan_products_created ON loan_products(created_at DESC);

CREATE OR REPLACE FUNCTION update_loan_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loan_products_updated_at
  BEFORE UPDATE ON loan_products
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_products_updated_at();

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;
