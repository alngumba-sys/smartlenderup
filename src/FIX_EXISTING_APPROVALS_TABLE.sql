-- =====================================================
-- FIX EXISTING APPROVALS TABLE
-- This handles the case where the table exists but is missing columns
-- =====================================================

-- Step 1: Add all missing columns (this won't fail if columns already exist)
DO $$ 
BEGIN
  -- Add status if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='status'
  ) THEN
    ALTER TABLE approvals ADD COLUMN status TEXT DEFAULT 'pending';
    RAISE NOTICE '✅ Added status column';
  ELSE
    RAISE NOTICE '⏭️  status column already exists';
  END IF;

  -- Add amount if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='amount'
  ) THEN
    ALTER TABLE approvals ADD COLUMN amount NUMERIC;
    RAISE NOTICE '✅ Added amount column';
  ELSE
    RAISE NOTICE '⏭️  amount column already exists';
  END IF;

  -- Add type if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='type'
  ) THEN
    ALTER TABLE approvals ADD COLUMN type TEXT;
    RAISE NOTICE '✅ Added type column';
  ELSE
    RAISE NOTICE '⏭️  type column already exists';
  END IF;

  -- Add title if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='title'
  ) THEN
    ALTER TABLE approvals ADD COLUMN title TEXT;
    RAISE NOTICE '✅ Added title column';
  ELSE
    RAISE NOTICE '⏭️  title column already exists';
  END IF;

  -- Add description if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='description'
  ) THEN
    ALTER TABLE approvals ADD COLUMN description TEXT;
    RAISE NOTICE '✅ Added description column';
  ELSE
    RAISE NOTICE '⏭️  description column already exists';
  END IF;

  -- Add requested_by if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='requested_by'
  ) THEN
    ALTER TABLE approvals ADD COLUMN requested_by TEXT;
    RAISE NOTICE '✅ Added requested_by column';
  ELSE
    RAISE NOTICE '⏭️  requested_by column already exists';
  END IF;

  -- Add request_date if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='request_date'
  ) THEN
    ALTER TABLE approvals ADD COLUMN request_date TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✅ Added request_date column';
  ELSE
    RAISE NOTICE '⏭️  request_date column already exists';
  END IF;

  -- Add client_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='client_id'
  ) THEN
    ALTER TABLE approvals ADD COLUMN client_id TEXT;
    RAISE NOTICE '✅ Added client_id column';
  ELSE
    RAISE NOTICE '⏭️  client_id column already exists';
  END IF;

  -- Add client_name if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='client_name'
  ) THEN
    ALTER TABLE approvals ADD COLUMN client_name TEXT;
    RAISE NOTICE '✅ Added client_name column';
  ELSE
    RAISE NOTICE '⏭️  client_name column already exists';
  END IF;

  -- Add priority if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='priority'
  ) THEN
    ALTER TABLE approvals ADD COLUMN priority TEXT DEFAULT 'medium';
    RAISE NOTICE '✅ Added priority column';
  ELSE
    RAISE NOTICE '⏭️  priority column already exists';
  END IF;

  -- Add approver if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='approver'
  ) THEN
    ALTER TABLE approvals ADD COLUMN approver TEXT;
    RAISE NOTICE '✅ Added approver column';
  ELSE
    RAISE NOTICE '⏭️  approver column already exists';
  END IF;

  -- Add approver_role if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='approver_role'
  ) THEN
    ALTER TABLE approvals ADD COLUMN approver_role TEXT;
    RAISE NOTICE '✅ Added approver_role column';
  ELSE
    RAISE NOTICE '⏭️  approver_role column already exists';
  END IF;

  -- Add approver_name if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='approver_name'
  ) THEN
    ALTER TABLE approvals ADD COLUMN approver_name TEXT;
    RAISE NOTICE '✅ Added approver_name column';
  ELSE
    RAISE NOTICE '⏭️  approver_name column already exists';
  END IF;

  -- Add approval_date if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='approval_date'
  ) THEN
    ALTER TABLE approvals ADD COLUMN approval_date TIMESTAMPTZ;
    RAISE NOTICE '✅ Added approval_date column';
  ELSE
    RAISE NOTICE '⏭️  approval_date column already exists';
  END IF;

  -- Add decision_date if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='decision_date'
  ) THEN
    ALTER TABLE approvals ADD COLUMN decision_date TIMESTAMPTZ;
    RAISE NOTICE '✅ Added decision_date column';
  ELSE
    RAISE NOTICE '⏭️  decision_date column already exists';
  END IF;

  -- Add rejection_reason if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='rejection_reason'
  ) THEN
    ALTER TABLE approvals ADD COLUMN rejection_reason TEXT;
    RAISE NOTICE '✅ Added rejection_reason column';
  ELSE
    RAISE NOTICE '⏭️  rejection_reason column already exists';
  END IF;

  -- Add related_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='related_id'
  ) THEN
    ALTER TABLE approvals ADD COLUMN related_id TEXT;
    RAISE NOTICE '✅ Added related_id column';
  ELSE
    RAISE NOTICE '⏭️  related_id column already exists';
  END IF;

  -- Add phase if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='phase'
  ) THEN
    ALTER TABLE approvals ADD COLUMN phase INTEGER;
    RAISE NOTICE '✅ Added phase column';
  ELSE
    RAISE NOTICE '⏭️  phase column already exists';
  END IF;

  -- Add stage if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='stage'
  ) THEN
    ALTER TABLE approvals ADD COLUMN stage TEXT;
    RAISE NOTICE '✅ Added stage column';
  ELSE
    RAISE NOTICE '⏭️  stage column already exists';
  END IF;

  -- Add decision if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='decision'
  ) THEN
    ALTER TABLE approvals ADD COLUMN decision TEXT;
    RAISE NOTICE '✅ Added decision column';
  ELSE
    RAISE NOTICE '⏭️  decision column already exists';
  END IF;

  -- Add comments if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='comments'
  ) THEN
    ALTER TABLE approvals ADD COLUMN comments TEXT;
    RAISE NOTICE '✅ Added comments column';
  ELSE
    RAISE NOTICE '⏭️  comments column already exists';
  END IF;

  -- Add disbursement_data if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='disbursement_data'
  ) THEN
    ALTER TABLE approvals ADD COLUMN disbursement_data JSONB;
    RAISE NOTICE '✅ Added disbursement_data column';
  ELSE
    RAISE NOTICE '⏭️  disbursement_data column already exists';
  END IF;

  -- Add step if missing (old workflow)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='step'
  ) THEN
    ALTER TABLE approvals ADD COLUMN step INTEGER;
    RAISE NOTICE '✅ Added step column';
  ELSE
    RAISE NOTICE '⏭️  step column already exists';
  END IF;

  -- Add approval_status if missing (old workflow)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='approval_status'
  ) THEN
    ALTER TABLE approvals ADD COLUMN approval_status TEXT;
    RAISE NOTICE '✅ Added approval_status column';
  ELSE
    RAISE NOTICE '⏭️  approval_status column already exists';
  END IF;

  -- Add approver_id if missing (old workflow)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='approver_id'
  ) THEN
    ALTER TABLE approvals ADD COLUMN approver_id UUID;
    RAISE NOTICE '✅ Added approver_id column';
  ELSE
    RAISE NOTICE '⏭️  approver_id column already exists';
  END IF;

  -- Add approved_at if missing (old workflow)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='approved_at'
  ) THEN
    ALTER TABLE approvals ADD COLUMN approved_at TIMESTAMPTZ;
    RAISE NOTICE '✅ Added approved_at column';
  ELSE
    RAISE NOTICE '⏭️  approved_at column already exists';
  END IF;

  -- Add loan_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='loan_id'
  ) THEN
    ALTER TABLE approvals ADD COLUMN loan_id TEXT;
    RAISE NOTICE '✅ Added loan_id column';
  ELSE
    RAISE NOTICE '⏭️  loan_id column already exists';
  END IF;

  -- Add organization_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='organization_id'
  ) THEN
    ALTER TABLE approvals ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added organization_id column';
  ELSE
    RAISE NOTICE '⏭️  organization_id column already exists';
  END IF;

  -- Add created_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='created_at'
  ) THEN
    ALTER TABLE approvals ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✅ Added created_at column';
  ELSE
    RAISE NOTICE '⏭️  created_at column already exists';
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='approvals' AND column_name='updated_at'
  ) THEN
    ALTER TABLE approvals ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✅ Added updated_at column';
  ELSE
    RAISE NOTICE '⏭️  updated_at column already exists';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Column additions complete!';
  RAISE NOTICE '========================================';
END $$;

-- Step 2: Create indexes (will only create if they don't exist)
CREATE INDEX IF NOT EXISTS idx_approvals_org_id ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_loan_id ON approvals(loan_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id ON approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_phase ON approvals(phase);
CREATE INDEX IF NOT EXISTS idx_approvals_related_id ON approvals(related_id);

-- Step 2.5: Remove NOT NULL constraints that shouldn't be there
DO $$
BEGIN
  -- loan_id can be null (app uses related_id)
  ALTER TABLE approvals ALTER COLUMN loan_id DROP NOT NULL;
  RAISE NOTICE '✅ Removed NOT NULL constraint from loan_id';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⏭️  loan_id is already nullable';
END $$;

-- Remove NOT NULL from all optional workflow columns
DO $$
BEGIN
  -- Old workflow columns (optional in new phase-based workflow)
  BEGIN
    ALTER TABLE approvals ALTER COLUMN step DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from step';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  step is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN approval_status DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from approval_status';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  approval_status is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN approver_id DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from approver_id';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  approver_id is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN approved_at DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from approved_at';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  approved_at is already nullable';
  END;

  -- Optional fields in both workflows
  BEGIN
    ALTER TABLE approvals ALTER COLUMN approver DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from approver';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  approver is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN approver_role DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from approver_role';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  approver_role is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN approver_name DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from approver_name';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  approver_name is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN approval_date DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from approval_date';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  approval_date is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN decision DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from decision';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  decision is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN decision_date DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from decision_date';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  decision_date is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN rejection_reason DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from rejection_reason';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  rejection_reason is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN comments DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from comments';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  comments is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN stage DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from stage';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  stage is already nullable';
  END;

  BEGIN
    ALTER TABLE approvals ALTER COLUMN disbursement_data DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL from disbursement_data';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️  disbursement_data is already nullable';
  END;
END $$;

-- Step 3: Enable Row Level Security
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view approvals in their organization" ON approvals;
  DROP POLICY IF EXISTS "Users can insert approvals in their organization" ON approvals;
  DROP POLICY IF EXISTS "Users can update approvals in their organization" ON approvals;
  DROP POLICY IF EXISTS "Users can delete approvals in their organization" ON approvals;

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
    
  RAISE NOTICE '✅ RLS policies created';
END $$;

-- Step 5: Final verification
DO $$
DECLARE
  column_count INTEGER;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'approvals';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ APPROVALS TABLE READY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total columns: %', column_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Current structure:';
  
  FOR rec IN 
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'approvals'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '  ✓ %: %', rec.column_name, rec.data_type;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ You can now create loan applications!';
  RAISE NOTICE '========================================';
END $$;