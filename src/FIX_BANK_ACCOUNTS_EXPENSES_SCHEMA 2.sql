-- ========================================================
-- FIX: Add Missing Columns to bank_accounts and expenses
-- ========================================================
-- Run this SQL in your Supabase SQL Editor to fix the schema
-- These columns are needed for the app to work correctly

-- =====================================================
-- 1. BANK_ACCOUNTS - Add missing columns
-- =====================================================

-- Add currency column (if not exists)
ALTER TABLE bank_accounts 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'KES';

-- Note: We already have 'balance' column, so we don't need opening_balance
-- The app will use 'balance' for both opening and current balance

-- =====================================================
-- 2. EXPENSES - Add ALL missing columns
-- =====================================================

-- Already exists in basic schema:
-- - id, organization_id, expense_id, category, description, amount
-- - payee_id, payment_method, payment_date, status, created_at, updated_at

-- Add expense_category (alias for category if needed)
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS expense_category TEXT;

-- Add expense_date (alias for payment_date)
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS expense_date DATE;

-- Add payment_reference
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add payee_name  
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payee_name TEXT;

-- Add bank_account_id
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS bank_account_id TEXT;

-- Add receipt_number
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS receipt_number TEXT;

-- Add created_by
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Add approval fields
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS approved_by TEXT;

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS approved_date DATE;

-- Add payment fields
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS paid_by TEXT;

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS paid_date DATE;

-- Add notes
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- 3. Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_bank_accounts_currency ON bank_accounts(currency);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_bank_account_id ON expenses(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payee_id ON expenses(payee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- =====================================================
-- 4. Copy data to alias columns (if needed)
-- =====================================================

-- Note: Only run these if the source columns exist
-- Commenting out for safety - run manually if needed

-- If category exists, copy to expense_category
-- UPDATE expenses 
-- SET expense_category = category 
-- WHERE expense_category IS NULL AND category IS NOT NULL;

-- If payment_date exists, copy to expense_date  
-- UPDATE expenses 
-- SET expense_date = payment_date::DATE 
-- WHERE expense_date IS NULL AND payment_date IS NOT NULL;

-- =====================================================
-- DONE! 
-- =====================================================
-- After running this:
-- 1. Refresh your app
-- 2. Try creating a bank account
-- 3. Try creating an expense
-- 4. Both should work without errors!