# 🚨 URGENT: Loan Products Schema Mismatch Fix

## Problem
The code was trying to use column names that don't exist in your actual Supabase database:
- ❌ Trying to use `product_name` → Database has `name`
- ❌ Trying to use `min_duration_months` → Database has `min_term`
- ❌ Trying to use `max_duration_months` → Database has `max_term`

## Solution Applied
✅ Updated field mappings to match your ACTUAL database schema
✅ Created migration to add missing columns
✅ Fixed status capitalization

## STEP 1: Run This Migration (REQUIRED!)

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste this SQL:**

```sql
-- Add missing columns to loan_products table

-- Add product_code column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'product_code'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN product_code TEXT;
    
    UPDATE loan_products 
    SET product_code = CONCAT(UPPER(SUBSTRING(name, 1, 4)), '-', EXTRACT(EPOCH FROM NOW())::TEXT)
    WHERE product_code IS NULL;
    
    RAISE NOTICE 'Added product_code column';
  END IF;
END $$;

-- Add repayment_frequency column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'repayment_frequency'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN repayment_frequency TEXT DEFAULT 'monthly';
    RAISE NOTICE 'Added repayment_frequency column';
  END IF;
END $$;

-- Add insurance_fee_fixed column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'insurance_fee_fixed'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN insurance_fee_fixed NUMERIC(10,2) DEFAULT 0;
    RAISE NOTICE 'Added insurance_fee_fixed column';
  END IF;
END $$;

-- Add processing_fee_fixed column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'processing_fee_fixed'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN processing_fee_fixed NUMERIC(10,2) DEFAULT 0;
    RAISE NOTICE 'Added processing_fee_fixed column';
  END IF;
END $$;

-- Add interest_method column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'interest_method'
  ) THEN
    ALTER TABLE loan_products 
    ADD COLUMN interest_method TEXT DEFAULT 'flat';
    RAISE NOTICE 'Added interest_method column';
  END IF;
END $$;

-- Update existing records
UPDATE loan_products SET repayment_frequency = 'monthly' WHERE repayment_frequency IS NULL;
UPDATE loan_products SET insurance_fee_fixed = 0 WHERE insurance_fee_fixed IS NULL;
UPDATE loan_products SET processing_fee_fixed = 0 WHERE processing_fee_fixed IS NULL;
UPDATE loan_products SET interest_method = 'flat' WHERE interest_method IS NULL;
```

4. **Click RUN**
5. **Verify you see success messages**

## STEP 2: Verify Your Database Schema

Run this query to see all columns:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'loan_products'
ORDER BY column_name;
```

**Expected columns:**
- ✅ id
- ✅ organization_id
- ✅ name (NOT product_name)
- ✅ description
- ✅ min_amount
- ✅ max_amount
- ✅ min_term (NOT min_duration_months)
- ✅ max_term (NOT max_duration_months)
- ✅ interest_rate
- ✅ interest_method ← NEW
- ✅ repayment_frequency ← NEW
- ✅ processing_fee_percentage
- ✅ processing_fee_fixed ← NEW
- ✅ insurance_fee_fixed ← NEW
- ✅ guarantor_required
- ✅ collateral_required
- ✅ status
- ✅ product_code ← NEW
- ✅ created_at
- ✅ updated_at

## STEP 3: Test Creating a Loan Product

1. Refresh your browser
2. Go to Settings → Loan Products
3. Click "Create New Loan Product"
4. Fill in ALL fields:
   - Product Name: Test Product
   - Interest Rate: 12
   - Interest Type: Declining
   - Repayment Frequency: Monthly
   - Minimum Amount: 10000
   - Maximum Amount: 500000
   - Minimum Tenor: 3
   - Maximum Tenor: 24
   - Processing Fee: 1000
   - Insurance Fee: 500
5. Click Create

**Expected result:**
```
📤 Creating loan product in Supabase:
📦 Full transformed product: {
  "name": "Test Product",           ← Correct column name
  "interest_rate": "12",
  "interest_method": "reducing_balance",
  "min_term": "3",                   ← Correct column name
  "max_term": "24",                  ← Correct column name
  "repayment_frequency": "monthly",
  "insurance_fee_fixed": "500",
  ...
}
✅ Loan product created successfully in Supabase
```

## What Was Fixed in the Code

### Field Mapping Changes
```typescript
// BEFORE (WRONG)
'name': 'product_name'           ❌
'minTenor': 'min_duration_months' ❌
'maxTenor': 'max_duration_months' ❌

// AFTER (CORRECT)
'name': 'name'                   ✅
'minTenor': 'min_term'           ✅
'maxTenor': 'max_term'           ✅
```

### Status Handling
```typescript
// BEFORE (WRONG)
transformed.status = transformed.status.toLowerCase(); // → 'active'

// AFTER (CORRECT)
transformed.status = transformed.status.charAt(0).toUpperCase() + 
                     transformed.status.slice(1).toLowerCase(); // → 'Active'
```

## Files Modified
- ✅ `/lib/supabaseService.ts` - Fixed all field mappings
- ✅ `/supabase/migrations/fix_loan_products_schema.sql` - New migration
- ✅ `/URGENT_FIX_README.md` - This file

## Troubleshooting

### Still getting "Could not find column" error?
→ Make sure you ran the migration SQL above

### Product creates but fields are NULL?
→ Check console logs to see which fields are being sent

### Status shows weird value?
→ Should now show "Active" or "Inactive" (capitalized)

## Success Criteria

✅ Migration runs without errors
✅ Can create loan product
✅ All fields save correctly
✅ Page refresh preserves all values
✅ No console errors

---

**Current Status:** Code Updated ✅  
**Action Required:** Run Migration SQL ⚠️
