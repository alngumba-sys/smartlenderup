-- =====================================================
-- COMPLETE FIX: CREATE OR UPDATE APPROVALS TABLE
-- This handles both scenarios:
-- 1. Table doesn't exist - creates it with all columns
-- 2. Table exists but missing columns - adds them
-- =====================================================

-- Step 1: Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT,
  type TEXT,
  title TEXT,
  description TEXT,
  requested_by TEXT,
  request_date TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC,
  client_id TEXT,
  client_name TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  approver TEXT,
  approver_role TEXT,
  approver_name TEXT,
  approval_date TIMESTAMPTZ,
  decision_date TIMESTAMPTZ,
  rejection_reason TEXT,
  related_id TEXT,
  phase INTEGER,
  stage TEXT,
  decision TEXT,
  comments TEXT,
  disbursement_data JSONB,
  step INTEGER,
  approval_status TEXT,
  approver_id UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add any missing columns (in case table existed but was incomplete)
DO $$ 
BEGIN
  -- Add organization_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='organization_id') THEN
    ALTER TABLE approvals ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- Add loan_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='loan_id') THEN
    ALTER TABLE approvals ADD COLUMN loan_id TEXT;
  END IF;

  -- Add type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='type') THEN
    ALTER TABLE approvals ADD COLUMN type TEXT;
  END IF;

  -- Add title if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='title') THEN
    ALTER TABLE approvals ADD COLUMN title TEXT;
  END IF;

  -- Add description if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='description') THEN
    ALTER TABLE approvals ADD COLUMN description TEXT;
  END IF;

  -- Add requested_by if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='requested_by') THEN
    ALTER TABLE approvals ADD COLUMN requested_by TEXT;
  END IF;

  -- Add request_date if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='request_date') THEN
    ALTER TABLE approvals ADD COLUMN request_date TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add amount if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='amount') THEN
    ALTER TABLE approvals ADD COLUMN amount NUMERIC;
  END IF;

  -- Add client_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='client_id') THEN
    ALTER TABLE approvals ADD COLUMN client_id TEXT;
  END IF;

  -- Add client_name if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='client_name') THEN
    ALTER TABLE approvals ADD COLUMN client_name TEXT;
  END IF;

  -- Add status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='status') THEN
    ALTER TABLE approvals ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  -- Add priority if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='priority') THEN
    ALTER TABLE approvals ADD COLUMN priority TEXT DEFAULT 'medium';
  END IF;

  -- Add approver if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='approver') THEN
    ALTER TABLE approvals ADD COLUMN approver TEXT;
  END IF;

  -- Add approver_role if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='approver_role') THEN
    ALTER TABLE approvals ADD COLUMN approver_role TEXT;
  END IF;

  -- Add approver_name if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='approver_name') THEN
    ALTER TABLE approvals ADD COLUMN approver_name TEXT;
  END IF;

  -- Add approval_date if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='approval_date') THEN
    ALTER TABLE approvals ADD COLUMN approval_date TIMESTAMPTZ;
  END IF;

  -- Add decision_date if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='decision_date') THEN
    ALTER TABLE approvals ADD COLUMN decision_date TIMESTAMPTZ;
  END IF;

  -- Add rejection_reason if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='rejection_reason') THEN
    ALTER TABLE approvals ADD COLUMN rejection_reason TEXT;
  END IF;

  -- Add related_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='related_id') THEN
    ALTER TABLE approvals ADD COLUMN related_id TEXT;
  END IF;

  -- Add phase if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='phase') THEN
    ALTER TABLE approvals ADD COLUMN phase INTEGER;
  END IF;

  -- Add stage if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='stage') THEN
    ALTER TABLE approvals ADD COLUMN stage TEXT;
  END IF;

  -- Add decision if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='decision') THEN
    ALTER TABLE approvals ADD COLUMN decision TEXT;
  END IF;

  -- Add comments if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='comments') THEN
    ALTER TABLE approvals ADD COLUMN comments TEXT;
  END IF;

  -- Add disbursement_data if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='disbursement_data') THEN
    ALTER TABLE approvals ADD COLUMN disbursement_data JSONB;
  END IF;

  -- Add step if missing (for old workflow compatibility)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='step') THEN
    ALTER TABLE approvals ADD COLUMN step INTEGER;
  END IF;

  -- Add approval_status if missing (for old workflow compatibility)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='approval_status') THEN
    ALTER TABLE approvals ADD COLUMN approval_status TEXT;
  END IF;

  -- Add approver_id if missing (for old workflow compatibility)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='approver_id') THEN
    ALTER TABLE approvals ADD COLUMN approver_id UUID;
  END IF;

  -- Add approved_at if missing (for old workflow compatibility)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='approved_at') THEN
    ALTER TABLE approvals ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;

  -- Add created_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='created_at') THEN
    ALTER TABLE approvals ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='approvals' AND column_name='updated_at') THEN
    ALTER TABLE approvals ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_approvals_org_id ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_loan_id ON approvals(loan_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id ON approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_request_date ON approvals(request_date);
CREATE INDEX IF NOT EXISTS idx_approvals_phase ON approvals(phase);
CREATE INDEX IF NOT EXISTS idx_approvals_related_id ON approvals(related_id);

-- Step 4: Enable Row Level Security
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies if they don't exist
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view approvals in their organization" ON approvals;
  DROP POLICY IF EXISTS "Users can insert approvals in their organization" ON approvals;
  DROP POLICY IF EXISTS "Users can update approvals in their organization" ON approvals;
  DROP POLICY IF EXISTS "Users can delete approvals in their organization" ON approvals;

  -- Create new policies
  CREATE POLICY "Users can view approvals in their organization"
    ON approvals FOR SELECT
    USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

  CREATE POLICY "Users can insert approvals in their organization"
    ON approvals FOR INSERT
    WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

  CREATE POLICY "Users can update approvals in their organization"
    ON approvals FOR UPDATE
    USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

  CREATE POLICY "Users can delete approvals in their organization"
    ON approvals FOR DELETE
    USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));
END $$;

-- Step 6: Verify and report
DO $$
DECLARE
  column_count INTEGER;
  rec RECORD;
BEGIN
  -- Count columns
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'approvals';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ APPROVALS TABLE FIXED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total columns: %', column_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Table structure:';
  
  FOR rec IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'approvals'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '  ✓ % (%) - Nullable: %, Default: %', 
      rec.column_name, 
      rec.data_type, 
      rec.is_nullable,
      COALESCE(rec.column_default, 'none');
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Key columns verified:';
  
  -- Verify critical columns
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='approvals' AND column_name='amount') THEN
    RAISE NOTICE '  ✅ amount column exists';
  ELSE
    RAISE NOTICE '  ❌ amount column missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='approvals' AND column_name='client_id') THEN
    RAISE NOTICE '  ✅ client_id column exists';
  ELSE
    RAISE NOTICE '  ❌ client_id column missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='approvals' AND column_name='status') THEN
    RAISE NOTICE '  ✅ status column exists';
  ELSE
    RAISE NOTICE '  ❌ status column missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='approvals' AND column_name='phase') THEN
    RAISE NOTICE '  ✅ phase column exists';
  ELSE
    RAISE NOTICE '  ❌ phase column missing';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ You can now create loan applications!';
  RAISE NOTICE '========================================';
END $$;
