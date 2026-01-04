-- =====================================================
-- IMMEDIATE FIX: Remove NOT NULL constraints from optional columns
-- COPY THIS ENTIRE FILE AND PASTE INTO SUPABASE SQL EDITOR
-- =====================================================

-- Remove NOT NULL from all optional columns in approvals table
ALTER TABLE approvals ALTER COLUMN loan_id DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN step DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN approval_status DROP NOT NULL;
ALTER TABLE approvals ALTER COLUMN approver_id DROP NOT NULL;
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