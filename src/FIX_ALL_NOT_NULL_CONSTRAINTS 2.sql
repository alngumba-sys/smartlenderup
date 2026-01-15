-- =====================================================
-- FIX ALL NOT NULL CONSTRAINTS IN APPROVALS TABLE
-- Removes NOT NULL from columns that should be optional
-- =====================================================

-- The new phase-based workflow doesn't use these fields, so they should be nullable:
ALTER TABLE approvals ALTER COLUMN loan_id DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN step DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN approval_status DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN approver_id DROP NOT NULL;

-- These fields are also optional in the workflow:
ALTER TABLE approvals ALTER COLUMN approver DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN approver_role DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN approver_name DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN approval_date DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN decision DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN decision_date DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN rejection_reason DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN comments DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN stage DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN disbursement_data DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN approved_at DROP NOT NULL;

-- Verify the changes
DO $$
DECLARE
  not_null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO not_null_count
  FROM information_schema.columns
  WHERE table_name = 'approvals' 
    AND is_nullable = 'NO'
    AND column_name NOT IN ('id', 'organization_id', 'created_at', 'updated_at');
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ NOT NULL constraints removed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Columns that should still be NOT NULL: 4';
  RAISE NOTICE '  - id (primary key)';
  RAISE NOTICE '  - organization_id (required)';
  RAISE NOTICE '  - created_at (audit field)';
  RAISE NOTICE '  - updated_at (audit field)';
  RAISE NOTICE '';
  RAISE NOTICE 'Other NOT NULL columns remaining: %', not_null_count;
  
  IF not_null_count > 0 THEN
    RAISE NOTICE '⚠️  Warning: Some columns still have NOT NULL';
    RAISE NOTICE 'Run this query to see them:';
    RAISE NOTICE 'SELECT column_name FROM information_schema.columns';
    RAISE NOTICE 'WHERE table_name = ''approvals'' AND is_nullable = ''NO'';';
  ELSE
    RAISE NOTICE '✅ Perfect! Only required columns have NOT NULL';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ You can now create loan applications!';
  RAISE NOTICE '========================================';
END $$;
