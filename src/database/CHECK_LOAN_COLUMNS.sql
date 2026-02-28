-- =====================================================
-- CHECK AND FIX LOAN TABLE COLUMN NAMES
-- Diagnostic and migration script for loan table columns
-- =====================================================

-- STEP 1: Check what columns currently exist in loans table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Common column name variations and what they should be:
-- principal_amount OR amount OR principalAmount → should be principal_amount
-- outstanding_balance OR balance OR outstandingBalance → should be outstanding_balance
-- total_repayable OR totalRepayable → should be total_repayable

-- =====================================================
-- OPTION A: If columns use camelCase, rename them to snake_case
-- =====================================================

-- Uncomment if your table has camelCase columns:
/*
ALTER TABLE loans RENAME COLUMN "principalAmount" TO principal_amount;
ALTER TABLE loans RENAME COLUMN "outstandingBalance" TO outstanding_balance;
ALTER TABLE loans RENAME COLUMN "totalRepayable" TO total_repayable;
ALTER TABLE loans RENAME COLUMN "interestRate" TO interest_rate;
ALTER TABLE loans RENAME COLUMN "loanNumber" TO loan_number;
ALTER TABLE loans RENAME COLUMN "loanTerm" TO loan_term_months;
*/

-- =====================================================
-- OPTION B: If table has 'amount' instead of 'principal_amount'
-- =====================================================

-- Uncomment if needed:
/*
ALTER TABLE loans RENAME COLUMN amount TO principal_amount;
ALTER TABLE loans RENAME COLUMN balance TO outstanding_balance;
*/

-- =====================================================
-- OPTION C: Add missing columns (if they don't exist)
-- =====================================================

-- Add principal_amount if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'principal_amount'
  ) THEN
    -- Check if 'amount' column exists and use it, otherwise create new
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'amount'
    ) THEN
      ALTER TABLE loans RENAME COLUMN amount TO principal_amount;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'principalAmount'
    ) THEN
      ALTER TABLE loans RENAME COLUMN "principalAmount" TO principal_amount;
    ELSE
      ALTER TABLE loans ADD COLUMN principal_amount DECIMAL(15,2) DEFAULT 0;
      RAISE NOTICE 'Added principal_amount column';
    END IF;
  ELSE
    RAISE NOTICE 'principal_amount column already exists';
  END IF;
END $$;

-- Add outstanding_balance if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'outstanding_balance'
  ) THEN
    -- Check if 'balance' column exists and use it, otherwise create new
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'balance'
    ) THEN
      ALTER TABLE loans RENAME COLUMN balance TO outstanding_balance;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'outstandingBalance'
    ) THEN
      ALTER TABLE loans RENAME COLUMN "outstandingBalance" TO outstanding_balance;
    ELSE
      ALTER TABLE loans ADD COLUMN outstanding_balance DECIMAL(15,2) DEFAULT 0;
      RAISE NOTICE 'Added outstanding_balance column';
    END IF;
  ELSE
    RAISE NOTICE 'outstanding_balance column already exists';
  END IF;
END $$;

-- Add total_repayable if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'total_repayable'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name = 'totalRepayable'
    ) THEN
      ALTER TABLE loans RENAME COLUMN "totalRepayable" TO total_repayable;
    ELSE
      ALTER TABLE loans ADD COLUMN total_repayable DECIMAL(15,2) DEFAULT 0;
      RAISE NOTICE 'Added total_repayable column';
    END IF;
  ELSE
    RAISE NOTICE 'total_repayable column already exists';
  END IF;
END $$;

-- =====================================================
-- STEP 2: Verify columns after migration
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'principal_amount') 
    THEN '✓ principal_amount exists'
    ELSE '✗ principal_amount MISSING'
  END as principal_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'outstanding_balance') 
    THEN '✓ outstanding_balance exists'
    ELSE '✗ outstanding_balance MISSING'
  END as balance_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'total_repayable') 
    THEN '✓ total_repayable exists'
    ELSE '✗ total_repayable MISSING'
  END as total_check;

-- =====================================================
-- STEP 3: Sample data check
-- =====================================================

-- View first loan record to verify data
SELECT 
  loan_number,
  principal_amount,
  outstanding_balance,
  total_repayable,
  status,
  client_id
FROM loans 
LIMIT 1;

-- =====================================================
-- USAGE INSTRUCTIONS:
-- =====================================================
-- 1. First, run the SELECT at the top to see current column names
-- 2. Based on results, run the appropriate DO blocks above
-- 3. Run the verification SELECT to confirm columns exist
-- 4. Run the sample data check to see actual values
-- =====================================================
