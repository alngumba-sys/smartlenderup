-- =============================================
-- ADD BUSINESS FIELDS TO CLIENTS TABLE
-- =============================================
-- This migration adds business-related fields to capture
-- business information for clients

-- Add business fields to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_location TEXT,
ADD COLUMN IF NOT EXISTS years_in_business INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN clients.business_type IS 'Type of business (e.g., Retail, Agriculture, Services, etc.)';
COMMENT ON COLUMN clients.business_name IS 'Registered or trading name of the business';
COMMENT ON COLUMN clients.business_location IS 'Physical location or address of the business';
COMMENT ON COLUMN clients.years_in_business IS 'Number of years the business has been operating';

-- Create index for business_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_clients_business_type ON clients(business_type);
