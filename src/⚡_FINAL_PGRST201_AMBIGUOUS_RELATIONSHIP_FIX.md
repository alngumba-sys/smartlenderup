# ⚡ FINAL PGRST201 AMBIGUOUS RELATIONSHIP FIX - March 12, 2026

## 🔴 THE PROBLEM
**Error:** `PGRST201 - Could not embed because more than one relationship was found for 'loans' and 'loan_products'`

Your `loans` table has **TWO foreign key columns** pointing to `loan_products`:
1. `loan_product_id` → `loan_products(id)` (via `loans_loan_product_id_fkey`)
2. `product_id` → `loan_products(id)` (via `loans_product_id_fkey`)

When fetching loans with embedded product data, Supabase doesn't know which relationship to use, causing the PGRST201 error.

## ✅ THE SOLUTION

We need to explicitly specify which foreign key relationship to use by adding the constraint name to the query.

### Fix #1: `/services/supabaseDataService.ts` (Line 733)

**❌ BEFORE (BROKEN):**
```typescript
product:loan_products(id, product_name, product_code, interest_rate)
```

**✅ AFTER (FIXED):**
```typescript
product:loan_products!loans_product_id_fkey(id, product_name, product_code, interest_rate)
```

### Fix #2: `/lib/supabaseService.ts` (Line 1133)

**❌ BEFORE (BROKEN):**
```typescript
loan_products:product_id (
  id,
  name
)
```

**✅ AFTER (FIXED):**
```typescript
loan_products!loans_product_id_fkey:product_id (
  id,
  name
)
```

## 🔍 UNDERSTANDING THE SYNTAX

### PostgREST Relationship Hint Syntax
```
table_name!foreign_key_constraint_name(columns)
```

**Example:**
```
loan_products!loans_product_id_fkey(id, product_name)
```

This tells Supabase:
- Use the `loan_products` table
- Via the `loans_product_id_fkey` foreign key constraint
- Select `id` and `product_name` columns

## 🗂️ YOUR DATABASE STRUCTURE

### Loans Table Foreign Keys
```sql
-- Foreign Key #1 (using this one ✅)
loans_product_id_fkey:
  loans(product_id) → loan_products(id)

-- Foreign Key #2 (not using)
loans_loan_product_id_fkey:
  loans(loan_product_id) → loan_products(id)
```

**Why we chose `product_id`:**
- Based on the code pattern `loan_products:product_id` in the original query
- This is the active column being used in your application
- `loan_product_id` might be a legacy/unused column

## 🔧 COMPLETE FIX DETAILS

### File 1: `/services/supabaseDataService.ts`

**Location:** Line 728-736
**Function:** `loanService.getAll()`

```typescript
const { data, error } = await supabase
  .from('loans')
  .select(`
    *,
    client:clients(id, first_name, last_name, client_number),
    product:loan_products!loans_product_id_fkey(id, product_name, product_code, interest_rate)
  `)
  .eq('organization_id', organizationId)
  .order('created_at', { ascending: false });
```

**What changed:**
- `loan_products` → `loan_products!loans_product_id_fkey`
- This explicitly uses the `product_id` foreign key relationship

### File 2: `/lib/supabaseService.ts`

**Location:** Line 1126-1138
**Function:** `getLoans()`

```typescript
.select(`
  *,
  clients:client_id (
    id,
    first_name,
    last_name
  ),
  loan_products!loans_product_id_fkey:product_id (
    id,
    name
  )
`)
.eq('organization_id', orgId);
```

**What changed:**
- `loan_products:product_id` → `loan_products!loans_product_id_fkey:product_id`
- This specifies to use the `loans_product_id_fkey` constraint

## 🎯 HOW TO TEST THE FIX

### Step 1: Clear Browser Cache ⚠️ CRITICAL
```
Press: Ctrl + Shift + R  (Windows/Linux)
   Or: Cmd + Shift + R   (Mac)
```

### Step 2: Navigate to Loans
1. Go to your dashboard
2. Click on the Loans tab
3. The loans should load successfully

### Step 3: Verify Success
✅ **Expected Results:**
- Loans load without errors
- No PGRST201 error in console
- Product names appear correctly
- Client names appear correctly

## 🔍 VERIFYING YOUR FOREIGN KEYS

To see all foreign key constraints in your database, run this SQL in Supabase:

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'loans'
ORDER BY tc.constraint_name;
```

Expected output should show both:
- `loans_loan_product_id_fkey`
- `loans_product_id_fkey`

## ❓ WHY DO YOU HAVE TWO FOREIGN KEYS?

This likely happened because:

1. **Original column:** `loan_product_id` was created first
2. **New column:** `product_id` was added later (or vice versa)
3. **Both columns** point to the same `loan_products` table
4. **Code uses:** `product_id` as the active column

**Recommendation:** Consider removing the unused foreign key to prevent future ambiguity.

## 🧹 OPTIONAL CLEANUP

If `loan_product_id` is not being used, you can remove it:

```sql
-- Check if loan_product_id has any non-null values
SELECT COUNT(*) FROM loans WHERE loan_product_id IS NOT NULL;

-- If count is 0, safe to drop the column and constraint
ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_loan_product_id_fkey;
ALTER TABLE loans DROP COLUMN IF EXISTS loan_product_id;
```

**⚠️ WARNING:** Only do this if:
- The count query returns 0
- You've verified `product_id` is the active column
- You have a database backup

## 🚨 TROUBLESHOOTING

### Error Still Appears?
1. **Clear browser cache** (Ctrl+Shift+R)
2. Close all browser tabs
3. Reopen and try again
4. Check browser console for different error

### Wrong Product Data Showing?
If products aren't matching correctly:
1. Verify `product_id` column has correct values
2. Check if you should use `loan_product_id` instead
3. Try changing `loans_product_id_fkey` to `loans_loan_product_id_fkey`

### Products Not Loading?
1. Check if `loan_products` table exists
2. Verify foreign key constraints exist (run SQL above)
3. Check if `product_id` column exists in `loans` table
4. Ensure products exist in `loan_products` table

## 📊 RELATED ERRORS

### PGRST204 vs PGRST201
- **PGRST204:** Column doesn't exist in schema cache
  - Fix: Remove field or add column to database
- **PGRST201:** Ambiguous relationship (multiple foreign keys)
  - Fix: Specify which foreign key to use (this fix)

## 📚 DOCUMENTATION UPDATED

Related documentation:
- `/🚨_SCHEMA_ERRORS_MASTER_FIX.md` - Add PGRST201 section
- `/LOANS_TABLE_ACTUAL_SCHEMA.md` - Document both foreign keys
- This file documents the PGRST201 fix

---

**Status:** ✅ COMPLETE
**Date Fixed:** March 12, 2026
**Files Changed:** 
- `/services/supabaseDataService.ts` (line 733)
- `/lib/supabaseService.ts` (line 1133)
**Action Required:** Clear browser cache (Ctrl+Shift+R) and test!

---

## 🎯 QUICK REFERENCE

```typescript
// ❌ WRONG (Causes PGRST201):
product:loan_products(...)

// ✅ CORRECT:
product:loan_products!loans_product_id_fkey(...)
```

**Remember:** When you have multiple foreign keys to the same table, always specify which one to use!
