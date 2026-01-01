-- =====================================================
-- ADD ALL 119 MISSING COLUMNS ACROSS 16 TABLES
-- =====================================================
-- This migration adds all missing columns identified in the schema validation
-- Run this after ensuring all tables exist

-- =====================================================
-- 1. SHAREHOLDERS (3 missing columns)
-- =====================================================
ALTER TABLE shareholders
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS shareholder_id TEXT,
ADD COLUMN IF NOT EXISTS shares NUMERIC DEFAULT 0;

-- =====================================================
-- 2. SHAREHOLDER_TRANSACTIONS (1 missing column)
-- =====================================================
ALTER TABLE shareholder_transactions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- =====================================================
-- 3. BANK_ACCOUNTS (2 missing columns)
-- =====================================================
ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS account_name TEXT;

-- =====================================================
-- 4. EXPENSES (7 missing columns)
-- =====================================================
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS expense_id TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS payment_type TEXT;

-- =====================================================
-- 5. PAYEES (8 missing columns)
-- =====================================================
ALTER TABLE payees
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS mpesa_number TEXT,
ADD COLUMN IF NOT EXISTS tax_pin TEXT,
ADD COLUMN IF NOT EXISTS kra_pin TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- =====================================================
-- 6. GROUPS (12 missing columns)
-- =====================================================
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS group_id TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS meeting_time TEXT,
ADD COLUMN IF NOT EXISTS chairperson TEXT,
ADD COLUMN IF NOT EXISTS chairperson_phone TEXT,
ADD COLUMN IF NOT EXISTS secretary TEXT,
ADD COLUMN IF NOT EXISTS treasurer TEXT,
ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_members INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS group_status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS default_rate NUMERIC;

-- =====================================================
-- 7. TASKS (6 missing columns)
-- =====================================================
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assigned_by TEXT,
ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS completed_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS related_entity_type TEXT,
ADD COLUMN IF NOT EXISTS related_entity_id TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- 8. PAYROLL_RUNS (12 missing columns)
-- =====================================================
ALTER TABLE payroll_runs
ADD COLUMN IF NOT EXISTS period TEXT,
ADD COLUMN IF NOT EXISTS pay_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS employees JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_gross_pay NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_net_pay NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS approved_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bank_account_id TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- 9. FUNDING_TRANSACTIONS (3 missing columns)
-- =====================================================
ALTER TABLE funding_transactions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- 10. DISBURSEMENTS (14 missing columns)
-- =====================================================
ALTER TABLE disbursements
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS channel TEXT,
ADD COLUMN IF NOT EXISTS mpesa_number TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS reference TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS processed_by TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- =====================================================
-- 11. APPROVALS (18 missing columns)
-- =====================================================
ALTER TABLE approvals
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
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
ADD COLUMN IF NOT EXISTS decision TEXT,
ADD COLUMN IF NOT EXISTS disbursement_data JSONB;

-- =====================================================
-- 12. JOURNAL_ENTRIES (9 missing columns)
-- =====================================================
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS entry_id TEXT,
ADD COLUMN IF NOT EXISTS entry_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS reference_type TEXT,
ADD COLUMN IF NOT EXISTS reference_id TEXT,
ADD COLUMN IF NOT EXISTS lines JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS account TEXT,
ADD COLUMN IF NOT EXISTS debit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit NUMERIC DEFAULT 0;

-- =====================================================
-- 13. PROCESSING_FEE_RECORDS (4 missing columns)
-- =====================================================
ALTER TABLE processing_fee_records
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS waived_by TEXT,
ADD COLUMN IF NOT EXISTS waived_reason TEXT;

-- =====================================================
-- 14. TICKETS (7 missing columns)
-- =====================================================
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS ticket_number TEXT,
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'Portal',
ADD COLUMN IF NOT EXISTS updated_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS resolution TEXT;

-- =====================================================
-- 15. KYC_RECORDS (10 missing columns)
-- =====================================================
ALTER TABLE kyc_records
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS risk_rating TEXT,
ADD COLUMN IF NOT EXISTS last_review_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_review_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS national_id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS address_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometrics_collected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS documents_on_file JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- =====================================================
-- 16. AUDIT_LOGS (3 missing columns)
-- =====================================================
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS performed_by TEXT,
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Organization ID indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_shareholders_org_id ON shareholders(organization_id);
CREATE INDEX IF NOT EXISTS idx_shareholder_transactions_org_id ON shareholder_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org_id ON bank_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_org_id ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_payees_org_id ON payees(organization_id);
CREATE INDEX IF NOT EXISTS idx_groups_org_id ON groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_org_id ON funding_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_org_id ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_org_id ON journal_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_processing_fee_records_org_id ON processing_fee_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);

-- ID field indexes for lookups
CREATE INDEX IF NOT EXISTS idx_shareholders_shareholder_id ON shareholders(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_id ON expenses(expense_id);
CREATE INDEX IF NOT EXISTS idx_groups_group_id ON groups(group_id);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_transaction_id ON funding_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_id ON journal_entries(entry_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);

-- Client ID indexes
CREATE INDEX IF NOT EXISTS idx_disbursements_client_id ON disbursements(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id ON approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id);

-- Status indexes for filtering
CREATE INDEX IF NOT EXISTS idx_disbursements_status ON disbursements(status);
CREATE INDEX IF NOT EXISTS idx_groups_group_status ON groups(group_status);

-- Date indexes for time-based queries
CREATE INDEX IF NOT EXISTS idx_expenses_payment_date ON expenses(payment_date);
CREATE INDEX IF NOT EXISTS idx_payees_last_payment_date ON payees(last_payment_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_date ON tasks(created_date);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_pay_date ON payroll_runs(pay_date);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_transaction_date ON funding_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_disbursements_scheduled_date ON disbursements(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_approvals_request_date ON approvals(request_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);

-- =====================================================
-- UPDATE RLS POLICIES
-- =====================================================

-- Enable RLS on all tables if not already enabled
ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholder_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their organization's shareholders" ON shareholders;
DROP POLICY IF EXISTS "Users can insert their organization's shareholders" ON shareholders;
DROP POLICY IF EXISTS "Users can update their organization's shareholders" ON shareholders;
DROP POLICY IF EXISTS "Users can delete their organization's shareholders" ON shareholders;

DROP POLICY IF EXISTS "Users can view their organization's shareholder transactions" ON shareholder_transactions;
DROP POLICY IF EXISTS "Users can insert their organization's shareholder transactions" ON shareholder_transactions;
DROP POLICY IF EXISTS "Users can update their organization's shareholder transactions" ON shareholder_transactions;
DROP POLICY IF EXISTS "Users can delete their organization's shareholder transactions" ON shareholder_transactions;

DROP POLICY IF EXISTS "Users can view their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can insert their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can delete their organization's bank accounts" ON bank_accounts;

DROP POLICY IF EXISTS "Users can view their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their organization's expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view their organization's payees" ON payees;
DROP POLICY IF EXISTS "Users can insert their organization's payees" ON payees;
DROP POLICY IF EXISTS "Users can update their organization's payees" ON payees;
DROP POLICY IF EXISTS "Users can delete their organization's payees" ON payees;

DROP POLICY IF EXISTS "Users can view their organization's groups" ON groups;
DROP POLICY IF EXISTS "Users can insert their organization's groups" ON groups;
DROP POLICY IF EXISTS "Users can update their organization's groups" ON groups;
DROP POLICY IF EXISTS "Users can delete their organization's groups" ON groups;

DROP POLICY IF EXISTS "Users can view their organization's funding transactions" ON funding_transactions;
DROP POLICY IF EXISTS "Users can insert their organization's funding transactions" ON funding_transactions;
DROP POLICY IF EXISTS "Users can update their organization's funding transactions" ON funding_transactions;
DROP POLICY IF EXISTS "Users can delete their organization's funding transactions" ON funding_transactions;

DROP POLICY IF EXISTS "Users can view their organization's approvals" ON approvals;
DROP POLICY IF EXISTS "Users can insert their organization's approvals" ON approvals;
DROP POLICY IF EXISTS "Users can update their organization's approvals" ON approvals;
DROP POLICY IF EXISTS "Users can delete their organization's approvals" ON approvals;

DROP POLICY IF EXISTS "Users can view their organization's journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their organization's journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their organization's journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their organization's journal entries" ON journal_entries;

DROP POLICY IF EXISTS "Users can view their organization's processing fee records" ON processing_fee_records;
DROP POLICY IF EXISTS "Users can insert their organization's processing fee records" ON processing_fee_records;
DROP POLICY IF EXISTS "Users can update their organization's processing fee records" ON processing_fee_records;
DROP POLICY IF EXISTS "Users can delete their organization's processing fee records" ON processing_fee_records;

DROP POLICY IF EXISTS "Users can view their organization's audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert their organization's audit logs" ON audit_logs;

-- Create new RLS policies for tables with organization_id

-- Shareholders
CREATE POLICY "Users can view their organization's shareholders"
  ON shareholders FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's shareholders"
  ON shareholders FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's shareholders"
  ON shareholders FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's shareholders"
  ON shareholders FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Shareholder Transactions
CREATE POLICY "Users can view their organization's shareholder transactions"
  ON shareholder_transactions FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's shareholder transactions"
  ON shareholder_transactions FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's shareholder transactions"
  ON shareholder_transactions FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's shareholder transactions"
  ON shareholder_transactions FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Bank Accounts
CREATE POLICY "Users can view their organization's bank accounts"
  ON bank_accounts FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's bank accounts"
  ON bank_accounts FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's bank accounts"
  ON bank_accounts FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Expenses
CREATE POLICY "Users can view their organization's expenses"
  ON expenses FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's expenses"
  ON expenses FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's expenses"
  ON expenses FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's expenses"
  ON expenses FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Payees
CREATE POLICY "Users can view their organization's payees"
  ON payees FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's payees"
  ON payees FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's payees"
  ON payees FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's payees"
  ON payees FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Groups
CREATE POLICY "Users can view their organization's groups"
  ON groups FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's groups"
  ON groups FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's groups"
  ON groups FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's groups"
  ON groups FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Funding Transactions
CREATE POLICY "Users can view their organization's funding transactions"
  ON funding_transactions FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's funding transactions"
  ON funding_transactions FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's funding transactions"
  ON funding_transactions FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's funding transactions"
  ON funding_transactions FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Approvals
CREATE POLICY "Users can view their organization's approvals"
  ON approvals FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's approvals"
  ON approvals FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's approvals"
  ON approvals FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's approvals"
  ON approvals FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Journal Entries
CREATE POLICY "Users can view their organization's journal entries"
  ON journal_entries FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's journal entries"
  ON journal_entries FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's journal entries"
  ON journal_entries FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Processing Fee Records
CREATE POLICY "Users can view their organization's processing fee records"
  ON processing_fee_records FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's processing fee records"
  ON processing_fee_records FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can update their organization's processing fee records"
  ON processing_fee_records FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can delete their organization's processing fee records"
  ON processing_fee_records FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- Audit Logs (read-only for users, insert allowed)
CREATE POLICY "Users can view their organization's audit logs"
  ON audit_logs FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

CREATE POLICY "Users can insert their organization's audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE email = current_user_email()));

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary: Added 119 missing columns across 16 tables
-- Created indexes for performance optimization
-- Updated RLS policies for data security
-- =====================================================
