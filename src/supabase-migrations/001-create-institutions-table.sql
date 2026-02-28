-- =====================================================
-- INSTITUTIONS TABLE MIGRATION
-- =====================================================
-- This migration creates the institutions table for managing
-- organizations like SACCOs, Corporates, Cooperatives, etc.
-- 
-- TO RUN THIS MIGRATION:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run"
-- =====================================================

-- Create institutions table
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SACCO', 'Corporate', 'Cooperative', 'NGO', 'Government', 'Association', 'Other')),
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  county TEXT,
  registration_number TEXT,
  tax_id TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_institutions_org ON public.institutions(organization_id);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions(status);
CREATE INDEX IF NOT EXISTS idx_institutions_type ON public.institutions(type);

-- Enable Row Level Security
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view institutions in their organization" ON public.institutions;
DROP POLICY IF EXISTS "Users can insert institutions in their organization" ON public.institutions;
DROP POLICY IF EXISTS "Users can update institutions in their organization" ON public.institutions;
DROP POLICY IF EXISTS "Users can delete institutions in their organization" ON public.institutions;

-- Create RLS policies for institutions
CREATE POLICY "Users can view institutions in their organization"
ON public.institutions
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert institutions in their organization"
ON public.institutions
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update institutions in their organization"
ON public.institutions
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete institutions in their organization"
ON public.institutions
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.users WHERE id = auth.uid()
  )
);

-- =====================================================
-- ADD INSTITUTION_ID TO CLIENTS TABLE (OPTIONAL)
-- =====================================================
-- This allows you to assign clients to institutions
-- Uncomment the lines below if you want this feature:

-- Add institution_id column to clients table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'institution_id'
  ) THEN
    ALTER TABLE public.clients 
    ADD COLUMN institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL;
    
    -- Add index for better query performance
    CREATE INDEX idx_clients_institution ON public.clients(institution_id);
    
    RAISE NOTICE 'Successfully added institution_id column to clients table';
  ELSE
    RAISE NOTICE 'institution_id column already exists in clients table';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the migration was successful:

-- Check if table exists
SELECT 
  'institutions' as table_name,
  COUNT(*) as record_count 
FROM public.institutions;

-- Check if RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'institutions';

-- Check if policies exist
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'institutions';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see this message, the migration completed successfully!
SELECT '✅ Institutions table created successfully! You can now use the Institutions feature.' as status;
