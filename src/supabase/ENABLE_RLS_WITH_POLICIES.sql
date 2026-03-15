-- ✅ ENABLE RLS WITH POLICIES FOR PRODUCTION
--
-- This script enables Row Level Security (RLS) on all tables
-- and creates permissive policies that allow authenticated users
-- to access data from their own organization.
--
-- WHEN TO USE THIS:
-- - When moving to production
-- - When you want proper security
-- - After testing is complete
--
-- HOW TO USE:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and run
-- 4. Set up proper Supabase authentication in your app
--
-- ⚠️ IMPORTANT:
-- After running this, auto-login will NOT work anymore!
-- You'll need to implement proper Supabase authentication.

-- ==========================================
-- STEP 1: Enable RLS on all tables
-- ==========================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaterals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_states ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 2: Create policies for each table
-- ==========================================

-- Organizations: Users can only see their own organization
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
CREATE POLICY "Users can view own organization"
ON organizations FOR SELECT
TO authenticated
USING (id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

DROP POLICY IF EXISTS "Users can update own organization" ON organizations;
CREATE POLICY "Users can update own organization"
ON organizations FOR UPDATE
TO authenticated
USING (id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Clients: Organization-scoped access
DROP POLICY IF EXISTS "Users can view own org clients" ON clients;
CREATE POLICY "Users can view own org clients"
ON clients FOR SELECT
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

DROP POLICY IF EXISTS "Users can create clients in own org" ON clients;
CREATE POLICY "Users can create clients in own org"
ON clients FOR INSERT
TO authenticated
WITH CHECK (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

DROP POLICY IF EXISTS "Users can update clients in own org" ON clients;
CREATE POLICY "Users can update clients in own org"
ON clients FOR UPDATE
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

DROP POLICY IF EXISTS "Users can delete clients in own org" ON clients;
CREATE POLICY "Users can delete clients in own org"
ON clients FOR DELETE
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Loans: Organization-scoped access
DROP POLICY IF EXISTS "Users can view own org loans" ON loans;
CREATE POLICY "Users can view own org loans"
ON loans FOR SELECT
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

DROP POLICY IF EXISTS "Users can create loans in own org" ON loans;
CREATE POLICY "Users can create loans in own org"
ON loans FOR INSERT
TO authenticated
WITH CHECK (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

DROP POLICY IF EXISTS "Users can update loans in own org" ON loans;
CREATE POLICY "Users can update loans in own org"
ON loans FOR UPDATE
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

DROP POLICY IF EXISTS "Users can delete loans in own org" ON loans;
CREATE POLICY "Users can delete loans in own org"
ON loans FOR DELETE
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Loan Products: Organization-scoped access
DROP POLICY IF EXISTS "Users can view own org loan products" ON loan_products;
CREATE POLICY "Users can view own org loan products"
ON loan_products FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Repayments: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org repayments" ON repayments;
CREATE POLICY "Users can manage own org repayments"
ON repayments FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Bank Accounts: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org bank accounts" ON bank_accounts;
CREATE POLICY "Users can manage own org bank accounts"
ON bank_accounts FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Expenses: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org expenses" ON expenses;
CREATE POLICY "Users can manage own org expenses"
ON expenses FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Shareholders: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org shareholders" ON shareholders;
CREATE POLICY "Users can manage own org shareholders"
ON shareholders FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Funding Transactions: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org funding transactions" ON funding_transactions;
CREATE POLICY "Users can manage own org funding transactions"
ON funding_transactions FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Approvals: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org approvals" ON approvals;
CREATE POLICY "Users can manage own org approvals"
ON approvals FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Loan Disbursements: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org disbursements" ON loan_disbursements;
CREATE POLICY "Users can manage own org disbursements"
ON loan_disbursements FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Processing Fees: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org processing fees" ON processing_fees;
CREATE POLICY "Users can manage own org processing fees"
ON processing_fees FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Journal Entries: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org journal entries" ON journal_entries;
CREATE POLICY "Users can manage own org journal entries"
ON journal_entries FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Audit Logs: Organization-scoped access (read-only for security)
DROP POLICY IF EXISTS "Users can view own org audit logs" ON audit_logs;
CREATE POLICY "Users can view own org audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;
CREATE POLICY "System can create audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Staff Members: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org staff" ON staff_members;
CREATE POLICY "Users can manage own org staff"
ON staff_members FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Payees: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org payees" ON payees;
CREATE POLICY "Users can manage own org payees"
ON payees FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Payroll Runs: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org payroll" ON payroll_runs;
CREATE POLICY "Users can manage own org payroll"
ON payroll_runs FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Institutions: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org institutions" ON institutions;
CREATE POLICY "Users can manage own org institutions"
ON institutions FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Groups: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org groups" ON groups;
CREATE POLICY "Users can manage own org groups"
ON groups FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Guarantors: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org guarantors" ON guarantors;
CREATE POLICY "Users can manage own org guarantors"
ON guarantors FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Collaterals: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org collaterals" ON collaterals;
CREATE POLICY "Users can manage own org collaterals"
ON collaterals FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Loan Documents: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org loan documents" ON loan_documents;
CREATE POLICY "Users can manage own org loan documents"
ON loan_documents FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Tickets: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org tickets" ON tickets;
CREATE POLICY "Users can manage own org tickets"
ON tickets FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- KYC Records: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org kyc records" ON kyc_records;
CREATE POLICY "Users can manage own org kyc records"
ON kyc_records FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Savings Accounts: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org savings accounts" ON savings_accounts;
CREATE POLICY "Users can manage own org savings accounts"
ON savings_accounts FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Savings Transactions: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org savings transactions" ON savings_transactions;
CREATE POLICY "Users can manage own org savings transactions"
ON savings_transactions FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Tasks: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org tasks" ON tasks;
CREATE POLICY "Users can manage own org tasks"
ON tasks FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- Project States: Organization-scoped access
DROP POLICY IF EXISTS "Users can manage own org project states" ON project_states;
CREATE POLICY "Users can manage own org project states"
ON project_states FOR ALL
TO authenticated
USING (organization_id = (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid);

-- ==========================================
-- STEP 3: Verify policies are active
-- ==========================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    COUNT(policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.schemaname, t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- You should see "true" in rls_enabled and a count > 0 in policy_count

-- ==========================================
-- DONE!
-- ==========================================
-- RLS is now enabled with organization-scoped policies.
-- Users can only access data from their own organization.
--
-- NEXT STEPS:
-- 1. Set up proper Supabase authentication in your app
-- 2. Ensure JWT tokens include organization_id claim
-- 3. Test with real authentication (not auto-login)
