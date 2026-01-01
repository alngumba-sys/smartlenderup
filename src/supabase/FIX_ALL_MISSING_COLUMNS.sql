-- ============================================
-- COMPREHENSIVE SCHEMA FIX - ALL MISSING COLUMNS
-- Generated: 2025-01-02
-- Fixes 280+ missing columns across 16 tables
-- ============================================

-- ============================================
-- TABLE: shareholders
-- ============================================
ALTER TABLE shareholders
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS shareholder_id TEXT,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS id_number TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS share_capital NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ownership_percentage NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_account JSONB,
  ADD COLUMN IF NOT EXISTS join_date TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS total_dividends NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS share_value NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_investment NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: shareholder_transactions
-- ============================================
ALTER TABLE shareholder_transactions
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS shareholder_id TEXT,
  ADD COLUMN IF NOT EXISTS transaction_type TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transaction_date TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS processed_by TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_id TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS reference TEXT,
  ADD COLUMN IF NOT EXISTS performed_by TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: bank_accounts
-- ============================================
ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS account_type TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS balance NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS opening_balance NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS opening_date TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS created_date TEXT,
  ADD COLUMN IF NOT EXISTS last_updated TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: expenses
-- ============================================
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS expense_id TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payee_id TEXT,
  ADD COLUMN IF NOT EXISTS payee_name TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS expense_date TEXT,
  ADD COLUMN IF NOT EXISTS payment_date TEXT,
  ADD COLUMN IF NOT EXISTS receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS attachments JSONB,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS approved_date TEXT,
  ADD COLUMN IF NOT EXISTS paid_by TEXT,
  ADD COLUMN IF NOT EXISTS paid_date TEXT,
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS created_date TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_type TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: payees
-- ============================================
ALTER TABLE payees
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS bank_account JSONB,
  ADD COLUMN IF NOT EXISTS mpesa_number TEXT,
  ADD COLUMN IF NOT EXISTS tax_pin TEXT,
  ADD COLUMN IF NOT EXISTS kra_pin TEXT,
  ADD COLUMN IF NOT EXISTS contact_person TEXT,
  ADD COLUMN IF NOT EXISTS total_paid NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_payment_date TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS created_date TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: groups
-- ============================================
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS group_id TEXT,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS registration_date TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS meeting_day TEXT,
  ADD COLUMN IF NOT EXISTS meeting_time TEXT,
  ADD COLUMN IF NOT EXISTS chairperson TEXT,
  ADD COLUMN IF NOT EXISTS chairperson_phone TEXT,
  ADD COLUMN IF NOT EXISTS secretary TEXT,
  ADD COLUMN IF NOT EXISTS secretary_phone TEXT,
  ADD COLUMN IF NOT EXISTS treasurer TEXT,
  ADD COLUMN IF NOT EXISTS treasurer_phone TEXT,
  ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_members INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS group_status TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS total_loans NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_savings NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_rate NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: tasks
-- ============================================
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS assigned_by TEXT,
  ADD COLUMN IF NOT EXISTS created_date TEXT,
  ADD COLUMN IF NOT EXISTS completed_date TEXT,
  ADD COLUMN IF NOT EXISTS related_entity_type TEXT,
  ADD COLUMN IF NOT EXISTS related_entity_id TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================
-- TABLE: payroll_runs
-- ============================================
ALTER TABLE payroll_runs
  ADD COLUMN IF NOT EXISTS period TEXT,
  ADD COLUMN IF NOT EXISTS pay_date TEXT,
  ADD COLUMN IF NOT EXISTS employees JSONB,
  ADD COLUMN IF NOT EXISTS total_gross_pay NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_net_pay NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS created_date TEXT,
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS approved_date TEXT,
  ADD COLUMN IF NOT EXISTS paid_date TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_id TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================
-- TABLE: funding_transactions
-- ============================================
ALTER TABLE funding_transactions
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_id TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS date TEXT,
  ADD COLUMN IF NOT EXISTS transaction_date TEXT,
  ADD COLUMN IF NOT EXISTS reference TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS shareholder_id TEXT,
  ADD COLUMN IF NOT EXISTS shareholder_name TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS depositor_name TEXT,
  ADD COLUMN IF NOT EXISTS transaction_type TEXT,
  ADD COLUMN IF NOT EXISTS related_loan_id TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: disbursements
-- ============================================
ALTER TABLE disbursements
  ADD COLUMN IF NOT EXISTS client_id TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_date TEXT,
  ADD COLUMN IF NOT EXISTS actual_date TEXT,
  ADD COLUMN IF NOT EXISTS channel TEXT,
  ADD COLUMN IF NOT EXISTS mpesa_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS reference TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS processed_by TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_date TEXT,
  ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- TABLE: approvals
-- ============================================
ALTER TABLE approvals
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS loan_id TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS requested_by TEXT,
  ADD COLUMN IF NOT EXISTS request_date TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS client_id TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT,
  ADD COLUMN IF NOT EXISTS approver TEXT,
  ADD COLUMN IF NOT EXISTS approver_role TEXT,
  ADD COLUMN IF NOT EXISTS approver_name TEXT,
  ADD COLUMN IF NOT EXISTS approval_date TEXT,
  ADD COLUMN IF NOT EXISTS decision_date TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS related_id TEXT,
  ADD COLUMN IF NOT EXISTS phase TEXT,
  ADD COLUMN IF NOT EXISTS stage TEXT,
  ADD COLUMN IF NOT EXISTS decision TEXT,
  ADD COLUMN IF NOT EXISTS comments TEXT,
  ADD COLUMN IF NOT EXISTS disbursement_data JSONB,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: journal_entries
-- ============================================
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS entry_id TEXT,
  ADD COLUMN IF NOT EXISTS entry_number TEXT,
  ADD COLUMN IF NOT EXISTS entry_date TEXT,
  ADD COLUMN IF NOT EXISTS date TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS reference TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS reference_type TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS reference_id TEXT,
  ADD COLUMN IF NOT EXISTS lines JSONB,
  ADD COLUMN IF NOT EXISTS account TEXT,
  ADD COLUMN IF NOT EXISTS total_debit NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS debit NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_credit NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credit NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS created_date TEXT,
  ADD COLUMN IF NOT EXISTS posted_date TEXT,
  ADD COLUMN IF NOT EXISTS reversed_date TEXT,
  ADD COLUMN IF NOT EXISTS reversed_by TEXT,
  ADD COLUMN IF NOT EXISTS reversal_reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: processing_fee_records
-- ============================================
ALTER TABLE processing_fee_records
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS loan_id TEXT,
  ADD COLUMN IF NOT EXISTS client_id TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_amount NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS percentage NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loan_amount NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recorded_date TEXT,
  ADD COLUMN IF NOT EXISTS collected_date TEXT,
  ADD COLUMN IF NOT EXISTS recorded_by TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS waived_by TEXT,
  ADD COLUMN IF NOT EXISTS waived_reason TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- TABLE: tickets
-- ============================================
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS ticket_number TEXT,
  ADD COLUMN IF NOT EXISTS client_id TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS channel TEXT,
  ADD COLUMN IF NOT EXISTS updated_date TEXT,
  ADD COLUMN IF NOT EXISTS resolution TEXT;

-- ============================================
-- TABLE: kyc_records
-- ============================================
ALTER TABLE kyc_records
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS risk_rating TEXT,
  ADD COLUMN IF NOT EXISTS last_review_date TEXT,
  ADD COLUMN IF NOT EXISTS next_review_date TEXT,
  ADD COLUMN IF NOT EXISTS national_id_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS address_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS biometrics_collected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS documents_on_file JSONB,
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- ============================================
-- TABLE: audit_logs
-- ============================================
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS id TEXT,
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS user_id TEXT,
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS performed_by TEXT,
  ADD COLUMN IF NOT EXISTS action TEXT,
  ADD COLUMN IF NOT EXISTS module TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_id TEXT,
  ADD COLUMN IF NOT EXISTS changes JSONB,
  ADD COLUMN IF NOT EXISTS details TEXT,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Shareholders indexes
CREATE INDEX IF NOT EXISTS idx_shareholders_org ON shareholders(organization_id);
CREATE INDEX IF NOT EXISTS idx_shareholders_id ON shareholders(shareholder_id);

-- Shareholder transactions indexes
CREATE INDEX IF NOT EXISTS idx_shareholder_trans_org ON shareholder_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_shareholder_trans_shareholder ON shareholder_transactions(shareholder_id);

-- Bank accounts indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org ON bank_accounts(organization_id);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_org ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_id ON expenses(expense_id);

-- Payees indexes
CREATE INDEX IF NOT EXISTS idx_payees_org ON payees(organization_id);

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_groups_org ON groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_groups_id ON groups(group_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);

-- Payroll runs indexes
CREATE INDEX IF NOT EXISTS idx_payroll_runs_org ON payroll_runs(organization_id);

-- Funding transactions indexes
CREATE INDEX IF NOT EXISTS idx_funding_trans_org ON funding_transactions(organization_id);

-- Disbursements indexes
CREATE INDEX IF NOT EXISTS idx_disbursements_org ON disbursements(organization_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_loan ON disbursements(loan_id);

-- Approvals indexes
CREATE INDEX IF NOT EXISTS idx_approvals_org ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_loan ON approvals(loan_id);

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_org ON journal_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_id ON journal_entries(entry_id);

-- Processing fee records indexes
CREATE INDEX IF NOT EXISTS idx_processing_fees_org ON processing_fee_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_processing_fees_loan ON processing_fee_records(loan_id);

-- Tickets indexes
CREATE INDEX IF NOT EXISTS idx_tickets_org ON tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_client ON tickets(client_id);

-- KYC records indexes
CREATE INDEX IF NOT EXISTS idx_kyc_org ON kyc_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_kyc_client ON kyc_records(client_id);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- To verify the migration, run:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'shareholders';
-- (Replace 'shareholders' with any table name to check)
