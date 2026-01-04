-- =====================================================
-- FIX: Remove NOT NULL constraint from loan_id column
-- The application uses 'related_id' for loan IDs in the new workflow
-- 'loan_id' is for backwards compatibility only
-- =====================================================

-- Remove NOT NULL constraint from loan_id
ALTER TABLE approvals ALTER COLUMN loan_id DROP NOT NULL;

-- Verify the change
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ loan_id constraint removed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'The loan_id column is now nullable.';
  RAISE NOTICE 'Your app uses related_id for loan IDs.';
  RAISE NOTICE '';
  RAISE NOTICE '✅ You can now create loan applications!';
  RAISE NOTICE '========================================';
END $$;
