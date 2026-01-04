-- =====================================================
-- FIX APPROVALS TABLE - ADD MISSING COLUMNS
-- Run this in Supabase SQL Editor to fix the schema error
-- =====================================================

-- Add all missing columns to approvals table
ALTER TABLE approvals
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS requested_by TEXT,
ADD COLUMN IF NOT EXISTS request_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS amount NUMERIC,
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS approver_name TEXT,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS decision_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS related_id TEXT,
ADD COLUMN IF NOT EXISTS phase INTEGER,
ADD COLUMN IF NOT EXISTS disbursement_data JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id ON approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_request_date ON approvals(request_date);
CREATE INDEX IF NOT EXISTS idx_approvals_phase ON approvals(phase);
CREATE INDEX IF NOT EXISTS idx_approvals_related_id ON approvals(related_id);

-- Verify the columns were added
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'approvals'
    AND column_name IN ('amount', 'client_id', 'client_name', 'type', 'title', 'description', 
                        'requested_by', 'request_date', 'priority', 'approver_name', 
                        'approval_date', 'decision_date', 'rejection_reason', 'related_id', 
                        'phase', 'disbursement_data');
  
  IF column_count = 16 THEN
    RAISE NOTICE '✅ SUCCESS: All 16 required columns exist in approvals table';
  ELSE
    RAISE NOTICE '⚠️  WARNING: Only % of 16 columns found. Some columns may be missing.', column_count;
  END IF;
END $$;

-- Show current table structure
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '📋 Current approvals table structure:';
  FOR rec IN 
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'approvals'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '  - %: %', rec.column_name, rec.data_type;
  END LOOP;
END $$;
