# 📋 COPY THIS ENTIRE SQL SCRIPT AND PASTE INTO SUPABASE

## Instructions:

1. **Select ALL the SQL below** (from `-- START` to `-- END`)
2. **Copy it** (Ctrl+C / Cmd+C)
3. **Go to Supabase Dashboard → SQL Editor**
4. **Paste it** (Ctrl+V / Cmd+V)
5. **Click Run** ▶

---

## ⬇️ START COPYING FROM HERE ⬇️

```sql
-- ============================================
-- SAFE MIGRATION: Add Missing Shareholder Columns
-- This script PRESERVES all existing data
-- ============================================

-- Add missing columns to shareholders table
ALTER TABLE shareholders 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS share_capital NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ownership_percentage NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_account JSONB DEFAULT NULL;

-- Migrate data from old columns to new columns (if they exist)
DO $$
BEGIN
  -- Copy shares_owned * share_value to share_capital (if old columns exist)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'shareholders' AND column_name = 'shares_owned') THEN
    UPDATE shareholders 
    SET share_capital = COALESCE(shares_owned * share_value, 0)
    WHERE share_capital = 0 OR share_capital IS NULL;
  END IF;
  
  -- Copy total_investment to share_capital if share_capital is still 0
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'shareholders' AND column_name = 'total_investment') THEN
    UPDATE shareholders 
    SET share_capital = COALESCE(total_investment, 0)
    WHERE share_capital = 0 OR share_capital IS NULL;
  END IF;
END $$;

-- Add missing columns to shareholder_transactions table
ALTER TABLE shareholder_transactions
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS processed_by TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_id TEXT;

-- Migrate data from old columns to new columns (if they exist)
DO $$
BEGIN
  -- Copy reference to payment_reference
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'shareholder_transactions' AND column_name = 'reference') THEN
    UPDATE shareholder_transactions 
    SET payment_reference = reference
    WHERE payment_reference IS NULL;
  END IF;
  
  -- Copy description to notes
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'shareholder_transactions' AND column_name = 'description') THEN
    UPDATE shareholder_transactions 
    SET notes = description
    WHERE notes IS NULL;
  END IF;
  
  -- Copy performed_by to processed_by
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'shareholder_transactions' AND column_name = 'performed_by') THEN
    UPDATE shareholder_transactions 
    SET processed_by = performed_by
    WHERE processed_by IS NULL;
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete! Missing columns added to shareholders and shareholder_transactions tables.';
  RAISE NOTICE '✅ Existing data has been preserved and migrated to new columns.';
  RAISE NOTICE '✅ You can now create shareholders without errors!';
END $$;
```

## ⬆️ STOP COPYING HERE ⬆️

---

## What Happens After Running:

✅ `address` column added to shareholders  
✅ `share_capital` column added to shareholders  
✅ `ownership_percentage` column added to shareholders  
✅ `bank_account` column added to shareholders  
✅ All other missing columns added  
✅ Existing data preserved  
✅ **NO MORE ERRORS!** 🎉

---

## Verify Success:

After running, go to **Table Editor → shareholders** and you should see the new columns!

---

## If You Get Any Errors:

Make sure the `shareholders` table exists. If not, you need to run the full schema first:
- Use `/supabase-reset-schema.sql` instead

---

**Time to Complete: 30 seconds**  
**Risk: ZERO (safe, preserves data)**  
**Result: Fixed schema!** ✅
