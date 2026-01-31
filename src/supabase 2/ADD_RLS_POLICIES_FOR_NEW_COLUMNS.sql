-- ============================================
-- ADD RLS POLICIES FOR NEW COLUMNS
-- Ensure proper Row Level Security for organization_id columns
-- ============================================

-- ============================================
-- 1. ENABLE RLS ON TABLES (if not already enabled)
-- ============================================

ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholder_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP EXISTING POLICIES (to recreate with org filtering)
-- ============================================

-- Drop shareholders policies if they exist
DROP POLICY IF EXISTS "Users can view their organization's shareholders" ON shareholders;
DROP POLICY IF EXISTS "Users can insert their organization's shareholders" ON shareholders;
DROP POLICY IF EXISTS "Users can update their organization's shareholders" ON shareholders;
DROP POLICY IF EXISTS "Users can delete their organization's shareholders" ON shareholders;

-- Drop shareholder_transactions policies if they exist
DROP POLICY IF EXISTS "Users can view their organization's shareholder transactions" ON shareholder_transactions;
DROP POLICY IF EXISTS "Users can insert their organization's shareholder transactions" ON shareholder_transactions;
DROP POLICY IF EXISTS "Users can update their organization's shareholder transactions" ON shareholder_transactions;
DROP POLICY IF EXISTS "Users can delete their organization's shareholder transactions" ON shareholder_transactions;

-- Drop bank_accounts policies if they exist
DROP POLICY IF EXISTS "Users can view their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can insert their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can delete their organization's bank accounts" ON bank_accounts;

-- Drop expenses policies if they exist
DROP POLICY IF EXISTS "Users can view their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their organization's expenses" ON expenses;

-- ============================================
-- 3. CREATE NEW RLS POLICIES
-- ============================================

-- SHAREHOLDERS POLICIES
CREATE POLICY "Users can view their organization's shareholders"
  ON shareholders FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their organization's shareholders"
  ON shareholders FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's shareholders"
  ON shareholders FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their organization's shareholders"
  ON shareholders FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

-- SHAREHOLDER_TRANSACTIONS POLICIES
CREATE POLICY "Users can view their organization's shareholder transactions"
  ON shareholder_transactions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their organization's shareholder transactions"
  ON shareholder_transactions FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's shareholder transactions"
  ON shareholder_transactions FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their organization's shareholder transactions"
  ON shareholder_transactions FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

-- BANK_ACCOUNTS POLICIES
CREATE POLICY "Users can view their organization's bank accounts"
  ON bank_accounts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their organization's bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's bank accounts"
  ON bank_accounts FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their organization's bank accounts"
  ON bank_accounts FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

-- EXPENSES POLICIES
CREATE POLICY "Users can view their organization's expenses"
  ON expenses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their organization's expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's expenses"
  ON expenses FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their organization's expenses"
  ON expenses FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- 4. VERIFICATION
-- ============================================

-- List all policies for these tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('shareholders', 'shareholder_transactions', 'bank_accounts', 'expenses')
ORDER BY tablename, policyname;

-- ============================================
-- COMPLETE! ✅
-- ============================================

/*
Summary:
✅ RLS enabled on all 4 tables
✅ 16 policies created (4 per table: SELECT, INSERT, UPDATE, DELETE)
✅ All policies enforce organization-level data isolation
✅ Users can only access their organization's data

Next steps:
1. Test that users can only see their organization's data
2. Verify that inserts/updates are restricted to user's organization
3. Update application code to always include organization_id
*/
