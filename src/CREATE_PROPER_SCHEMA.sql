-- =========================================
-- CREATE PROPER SCHEMA FOR SMARTLENDERUP
-- =========================================
--
-- Run this in Supabase SQL Editor to add all required columns
-- This will NOT delete existing data, it just adds missing columns
--
-- =========================================

-- 1. ALTER CLIENTS TABLE - Add all missing columns
-- =========================================

ALTER TABLE public.clients 
  -- Organization link
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  
  -- Client identification
  ADD COLUMN IF NOT EXISTS client_number TEXT UNIQUE,
  
  -- Personal information
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  
  -- ID information
  ADD COLUMN IF NOT EXISTS id_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS id_type TEXT,
  
  -- Contact information
  ADD COLUMN IF NOT EXISTS phone_primary TEXT,
  ADD COLUMN IF NOT EXISTS phone_secondary TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  
  -- Address information
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS sub_county TEXT,
  ADD COLUMN IF NOT EXISTS ward TEXT,
  ADD COLUMN IF NOT EXISTS physical_address TEXT,
  
  -- Employment information
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS employer_name TEXT,
  ADD COLUMN IF NOT EXISTS employer_phone TEXT,
  ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(15,2),
  
  -- Next of Kin
  ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT,
  ADD COLUMN IF NOT EXISTS next_of_kin_phone TEXT,
  ADD COLUMN IF NOT EXISTS next_of_kin_relationship TEXT,
  
  -- Profile
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  
  -- Business fields (for Business/Group clients)
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS business_location TEXT,
  ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
  
  -- Status and KYC
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_verified_by UUID,
  
  -- Risk assessment
  ADD COLUMN IF NOT EXISTS credit_score INTEGER,
  ADD COLUMN IF NOT EXISTS risk_rating TEXT,
  
  -- Audit fields
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. SET DEFAULT UUID GENERATOR FOR ID (if not already set)
-- =========================================

-- First, enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set default for id column to auto-generate UUIDs
ALTER TABLE public.clients 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 3. ADD CONSTRAINTS
-- =========================================

-- Gender constraint
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_gender_check;
  
ALTER TABLE public.clients 
  ADD CONSTRAINT clients_gender_check 
  CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'));

-- Marital status constraint
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_marital_status_check;
  
ALTER TABLE public.clients 
  ADD CONSTRAINT clients_marital_status_check 
  CHECK (marital_status IS NULL OR marital_status IN ('single', 'married', 'divorced', 'widowed'));

-- ID type constraint
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_id_type_check;
  
ALTER TABLE public.clients 
  ADD CONSTRAINT clients_id_type_check 
  CHECK (id_type IS NULL OR id_type IN ('national_id', 'passport', 'military_id', 'alien_id'));

-- Status constraint
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_status_check;
  
ALTER TABLE public.clients 
  ADD CONSTRAINT clients_status_check 
  CHECK (status IS NULL OR status IN ('active', 'inactive', 'blacklisted'));

-- KYC status constraint
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_kyc_status_check;
  
ALTER TABLE public.clients 
  ADD CONSTRAINT clients_kyc_status_check 
  CHECK (kyc_status IS NULL OR kyc_status IN ('pending', 'verified', 'rejected'));

-- Risk rating constraint
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_risk_rating_check;
  
ALTER TABLE public.clients 
  ADD CONSTRAINT clients_risk_rating_check 
  CHECK (risk_rating IS NULL OR risk_rating IN ('low', 'medium', 'high', 'very_high'));

-- Credit score constraint
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_credit_score_check;
  
ALTER TABLE public.clients 
  ADD CONSTRAINT clients_credit_score_check 
  CHECK (credit_score IS NULL OR (credit_score >= 0 AND credit_score <= 1000));

-- 4. CREATE INDEXES FOR PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_clients_organization_id ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_client_number ON public.clients(client_number);
CREATE INDEX IF NOT EXISTS idx_clients_id_number ON public.clients(id_number);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at);

-- 5. ADD ROW LEVEL SECURITY (RLS)
-- =========================================

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.clients;

-- Create policies (adjust based on your auth setup)
CREATE POLICY "Enable read access for all users" ON public.clients
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.clients
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.clients
  FOR DELETE USING (true);

-- 6. ADD COMMENTS FOR DOCUMENTATION
-- =========================================

COMMENT ON TABLE public.clients IS 'Client/Borrower information for microfinance platform';
COMMENT ON COLUMN public.clients.client_number IS 'Unique client identifier in format CL001, CL002, etc.';
COMMENT ON COLUMN public.clients.business_type IS 'Type of business (e.g., Retail, Agriculture, Services, Manufacturing)';
COMMENT ON COLUMN public.clients.business_name IS 'Registered or trading name of the business';
COMMENT ON COLUMN public.clients.kyc_status IS 'KYC verification status: pending, verified, or rejected';
COMMENT ON COLUMN public.clients.credit_score IS 'Credit score from 0 to 1000';
COMMENT ON COLUMN public.clients.risk_rating IS 'Risk assessment: low, medium, high, or very_high';

-- =========================================
-- VERIFICATION QUERY
-- =========================================

-- Run this to verify all columns were added:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;

-- =========================================
-- SUCCESS MESSAGE
-- =========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Schema update complete!';
  RAISE NOTICE '✅ All columns added to clients table';
  RAISE NOTICE '✅ Constraints added';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '1. Go back to your app';
  RAISE NOTICE '2. Try creating a client';
  RAISE NOTICE '3. All fields should now save properly!';
END $$;
