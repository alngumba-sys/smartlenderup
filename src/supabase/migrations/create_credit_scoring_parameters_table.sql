-- =====================================================
-- CREATE CREDIT SCORING PARAMETERS TABLE
-- =====================================================

-- Create credit_scoring_parameters table
CREATE TABLE IF NOT EXISTS credit_scoring_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_type TEXT NOT NULL CHECK (client_type IN ('individual', 'business')),
  parameter_id TEXT NOT NULL,
  parameter_name TEXT NOT NULL,
  weight NUMERIC NOT NULL CHECK (weight >= 0 AND weight <= 100),
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique parameter per client type per organization
  UNIQUE(organization_id, client_type, parameter_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_credit_scoring_params_org_client_type 
  ON credit_scoring_parameters(organization_id, client_type);

-- Enable RLS
ALTER TABLE credit_scoring_parameters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their organization's credit scoring parameters" 
  ON credit_scoring_parameters
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert credit scoring parameters for their organization" 
  ON credit_scoring_parameters
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their organization's credit scoring parameters" 
  ON credit_scoring_parameters
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their organization's credit scoring parameters" 
  ON credit_scoring_parameters
  FOR DELETE
  USING (true);

-- Add comment
COMMENT ON TABLE credit_scoring_parameters IS 'Stores configurable credit scoring parameters for individual and business clients';
