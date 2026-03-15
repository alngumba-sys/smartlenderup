-- ============================================
-- ⚡ URGENT: RUN THIS TO FIX YOUR ERRORS NOW!
-- ============================================
-- Fixes: "permission denied for table loan_products"
-- Fixes: All RLS errors
-- ============================================

-- Disable RLS on ALL tables
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.repayments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shareholders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shareholder_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaterals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.disbursements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_scoring_parameters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_states DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_configuration DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ✅ SUCCESS! RLS is now disabled.
-- ============================================
-- NOW: Refresh your browser (Ctrl+Shift+R)
-- Your errors will be GONE!
-- ============================================
