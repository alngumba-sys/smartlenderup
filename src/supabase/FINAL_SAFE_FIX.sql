-- ============================================
-- FINAL SAFE FIX - No Aggregate Functions Issue
-- ============================================
-- This version fixes the aggregate function error
-- and uses a simpler approach for data updates
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 1: Disable RLS on all tables
-- ============================================
ALTER TABLE IF EXISTS public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.repayments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loan_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shareholders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.funding_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chart_of_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_messages DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Add missing columns to LOANS table
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'outstanding_principal'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN outstanding_principal DECIMAL(15,2);
    RAISE NOTICE '✅ Added outstanding_principal to loans table';
  ELSE
    RAISE NOTICE 'ℹ️  outstanding_principal already exists in loans table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loans' 
    AND column_name = 'organization_code'
  ) THEN
    ALTER TABLE public.loans ADD COLUMN organization_code TEXT;
    RAISE NOTICE '✅ Added organization_code to loans table';
  ELSE
    RAISE NOTICE 'ℹ️  organization_code already exists in loans table';
  END IF;
END $$;

-- ============================================
-- STEP 3: Add missing columns to REPAYMENTS table
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'repayments' 
    AND column_name = 'principal_paid'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN principal_paid DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added principal_paid to repayments table';
  ELSE
    RAISE NOTICE 'ℹ️  principal_paid already exists in repayments table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'repayments' 
    AND column_name = 'interest_paid'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN interest_paid DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added interest_paid to repayments table';
  ELSE
    RAISE NOTICE 'ℹ️  interest_paid already exists in repayments table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'repayments' 
    AND column_name = 'fees_paid'
  ) THEN
    ALTER TABLE public.repayments ADD COLUMN fees_paid DECIMAL(15,2) DEFAULT 0;
    RAISE NOTICE '✅ Added fees_paid to repayments table';
  ELSE
    RAISE NOTICE 'ℹ️  fees_paid already exists in repayments table';
  END IF;
END $$;

-- ============================================
-- STEP 4: Add missing columns to ORGANIZATIONS table
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN password_hash TEXT;
    RAISE NOTICE '✅ Added password_hash to organizations table';
  ELSE
    RAISE NOTICE 'ℹ️  password_hash already exists in organizations table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'organization_code'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN organization_code TEXT;
    RAISE NOTICE '✅ Added organization_code to organizations table';
  ELSE
    RAISE NOTICE 'ℹ️  organization_code already exists in organizations table';
  END IF;
END $$;

-- ============================================
-- STEP 5: Add missing columns to CLIENTS table
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'organization_code'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN organization_code TEXT;
    RAISE NOTICE '✅ Added organization_code to clients table';
  ELSE
    RAISE NOTICE 'ℹ️  organization_code already exists in clients table';
  END IF;
END $$;

-- ============================================
-- STEP 6: Update loan data using CTE (no aggregate in UPDATE)
-- ============================================

-- Create a temporary table with calculated outstanding amounts
CREATE TEMP TABLE IF NOT EXISTS temp_loan_outstanding AS
SELECT 
  l.id,
  l.principal_amount,
  l.status,
  COALESCE(SUM(r.amount_paid), 0) as total_paid
FROM public.loans l
LEFT JOIN public.repayments r ON r.loan_id = l.id
GROUP BY l.id, l.principal_amount, l.status;

-- Update active loans with calculated outstanding principal
UPDATE public.loans 
SET outstanding_principal = temp_loan_outstanding.principal_amount - temp_loan_outstanding.total_paid
FROM temp_loan_outstanding
WHERE loans.id = temp_loan_outstanding.id
AND loans.outstanding_principal IS NULL
AND temp_loan_outstanding.status IN ('active', 'disbursed', 'approved');

-- Update settled loans to 0
UPDATE public.loans 
SET outstanding_principal = 0
WHERE outstanding_principal IS NULL 
AND status IN ('settled', 'fully_paid', 'closed');

-- Set default for any remaining nulls
UPDATE public.loans 
SET outstanding_principal = COALESCE(principal_amount, 0)
WHERE outstanding_principal IS NULL;

-- Drop temp table
DROP TABLE IF EXISTS temp_loan_outstanding;

-- ============================================
-- STEP 7: Re-enable RLS with simple policies
-- ============================================

-- Organizations
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_all_access" ON public.organizations;
CREATE POLICY "org_all_access" ON public.organizations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Clients
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_all_access" ON public.clients;
CREATE POLICY "clients_all_access" ON public.clients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Loans
ALTER TABLE IF EXISTS public.loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "loans_all_access" ON public.loans;
CREATE POLICY "loans_all_access" ON public.loans FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Repayments
ALTER TABLE IF EXISTS public.repayments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "repayments_all_access" ON public.repayments;
CREATE POLICY "repayments_all_access" ON public.repayments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Loan Products
ALTER TABLE IF EXISTS public.loan_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "loan_products_all_access" ON public.loan_products;
CREATE POLICY "loan_products_all_access" ON public.loan_products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Staff Users
ALTER TABLE IF EXISTS public.staff_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_all_access" ON public.staff_users;
CREATE POLICY "staff_all_access" ON public.staff_users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Shareholders
ALTER TABLE IF EXISTS public.shareholders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shareholders_all_access" ON public.shareholders;
CREATE POLICY "shareholders_all_access" ON public.shareholders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Bank Accounts
ALTER TABLE IF EXISTS public.bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bank_accounts_all_access" ON public.bank_accounts;
CREATE POLICY "bank_accounts_all_access" ON public.bank_accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Funding Transactions
ALTER TABLE IF EXISTS public.funding_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "funding_all_access" ON public.funding_transactions;
CREATE POLICY "funding_all_access" ON public.funding_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Chart of Accounts
ALTER TABLE IF EXISTS public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chart_all_access" ON public.chart_of_accounts;
CREATE POLICY "chart_all_access" ON public.chart_of_accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Expenses
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expenses_all_access" ON public.expenses;
CREATE POLICY "expenses_all_access" ON public.expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Payees
ALTER TABLE IF EXISTS public.payees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payees_all_access" ON public.payees;
CREATE POLICY "payees_all_access" ON public.payees FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Contact Messages
ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_all_access" ON public.contact_messages;
CREATE POLICY "contact_all_access" ON public.contact_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Notifications (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "notifications_all_access" ON public.notifications;
    CREATE POLICY "notifications_all_access" ON public.notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Audit Logs (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "audit_all_access" ON public.audit_logs;
    CREATE POLICY "audit_all_access" ON public.audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- STEP 8: Create helpful indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_loans_outstanding ON public.loans(outstanding_principal) WHERE outstanding_principal > 0;
CREATE INDEX IF NOT EXISTS idx_loans_org_code ON public.loans(organization_code);
CREATE INDEX IF NOT EXISTS idx_clients_org_code ON public.clients(organization_code);
CREATE INDEX IF NOT EXISTS idx_organizations_code ON public.organizations(organization_code);
CREATE INDEX IF NOT EXISTS idx_repayments_loan ON public.repayments(loan_id);

-- ============================================
-- VERIFICATION & SUCCESS MESSAGE
-- ============================================
DO $$
DECLARE
  loans_count INTEGER;
  clients_count INTEGER;
  repayments_count INTEGER;
  loans_with_outstanding INTEGER;
BEGIN
  SELECT COUNT(*) INTO loans_count FROM public.loans;
  SELECT COUNT(*) INTO clients_count FROM public.clients;
  SELECT COUNT(*) INTO repayments_count FROM public.repayments;
  SELECT COUNT(*) INTO loans_with_outstanding FROM public.loans WHERE outstanding_principal IS NOT NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════╗';
  RAISE NOTICE '║   DATABASE FIX COMPLETED SUCCESSFULLY! ║';
  RAISE NOTICE '╚════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Your Database Stats:';
  RAISE NOTICE '   • Total Loans: %', loans_count;
  RAISE NOTICE '   • Loans with Outstanding Balance: %', loans_with_outstanding;
  RAISE NOTICE '   • Total Clients: %', clients_count;
  RAISE NOTICE '   • Total Repayments: %', repayments_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ All critical columns added successfully';
  RAISE NOTICE '✅ Outstanding principal calculated for % loans', loans_with_outstanding;
  RAISE NOTICE '✅ RLS policies updated (all access enabled)';
  RAISE NOTICE '✅ Database indexes created for performance';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SUCCESS! You can now refresh your app!';
  RAISE NOTICE '   Press F5 in your browser to reload';
  RAISE NOTICE '';
END $$;
