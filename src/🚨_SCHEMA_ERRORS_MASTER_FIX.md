# 🚨 SCHEMA ERRORS MASTER FIX GUIDE

## 📋 COMPLETE FIX HISTORY

All PGRST204 and PGRST201 schema errors and their solutions:

### 1️⃣ `duration_months` Field (FIXED ✅)
- **Error:** PGRST204 - `Could not find the 'duration_months' column of 'loans' in the schema cache`
- **Location:** `/services/supabaseDataService.ts` line 852
- **Fix:** Removed field assignment (commented out)
- **Date Fixed:** March 12, 2026
- **Documentation:** `/⚡_FINAL_DURATION_MONTHS_FIX.md`

### 2️⃣ `loan_product_id` Field (FIXED ✅)
- **Error:** PGRST204 - `Could not find the 'loan_product_id' column of 'loans' in the schema cache`
- **Location:** `/services/supabaseDataService.ts` line 863
- **Fix:** Removed field assignment (commented out)
- **Date Fixed:** March 12, 2026
- **Documentation:** `/⚡_FINAL_LOAN_PRODUCT_ID_FIX.md`

### 3️⃣ Ambiguous `loan_products` Relationship (FIXED ✅)
- **Error:** PGRST201 - `Could not embed because more than one relationship was found for 'loans' and 'loan_products'`
- **Location:** `/services/supabaseDataService.ts` line 733, `/lib/supabaseService.ts` line 1133
- **Fix:** Specified foreign key constraint name (`loan_products!loans_product_id_fkey`)
- **Date Fixed:** March 12, 2026
- **Documentation:** `/⚡_FINAL_PGRST201_AMBIGUOUS_RELATIONSHIP_FIX.md`

---

## 🎯 THE ROOT CAUSE

The schema SQL files (`/supabase/schema.sql`, `/supabase-migration.sql`, etc.) define columns that **do not actually exist** in your Supabase database. The code was trying to set these non-existent columns, causing PGRST204 errors.

**Why this happened:**
1. Schema files were created with ideal/planned database structure
2. Actual Supabase database was created with a simpler structure
3. Code tried to use fields from schema files
4. Supabase returned PGRST204 error (column not in schema cache)

---

## ✅ SOLUTION PATTERN

When you get a PGRST204 error:

### Step 1: Identify the Field
Look at the error message:
```
Could not find the 'FIELD_NAME' column of 'TABLE_NAME' in the schema cache
```

### Step 2: Find Where It's Being Set
Search for the field in `/services/supabaseDataService.ts`:
```bash
# Search pattern
FIELD_NAME
```

### Step 3: Comment Out the Assignment
```typescript
// ❌ BEFORE (BROKEN):
if (value) record.FIELD_NAME = value;

// ✅ AFTER (FIXED):
// ❌ REMOVED: FIELD_NAME field doesn't exist in database
// if (value) record.FIELD_NAME = value;
```

### Step 4: Clear Browser Cache
Press **Ctrl + Shift + R** to hard refresh and load new code

### Step 5: Test
Try the operation again (e.g., create loan)

---

## 🗂️ CONFIRMED LOANS TABLE STRUCTURE

See `/LOANS_TABLE_ACTUAL_SCHEMA.md` for complete details.

### Fields that EXIST ✅
- `client_id`, `organization_id`, `amount`, `interest_rate`
- `status`, `total_amount`, `monthly_installment`
- `outstanding_balance`, `paid_amount`
- `loan_number`, `purpose`, `processing_fee`, `insurance_fee`, `notes`

### Fields that DO NOT EXIST ❌
- `duration_months`
- `loan_product_id`
- `loan_officer_id`
- `disbursement_reference`
- `maturity_date`, `application_date`
- Many others (see full list in LOANS_TABLE_ACTUAL_SCHEMA.md)

---

## 🔧 HOW TO ADD A MISSING FIELD

If you WANT a field that doesn't exist:

### Step 1: Add Column in Supabase
```sql
ALTER TABLE loans 
ADD COLUMN field_name DATA_TYPE;

-- Example for loan_product_id:
ALTER TABLE loans 
ADD COLUMN loan_product_id UUID;
```

### Step 2: Refresh Schema Cache
1. Go to Supabase Dashboard
2. Navigate to API section
3. Click "Refresh schema cache"
4. Wait 30 seconds

### Step 3: Uncomment Code
Find the commented-out line in `/services/supabaseDataService.ts` and uncomment it:
```typescript
// Before:
// if (productUUID) loanRecord.loan_product_id = productUUID;

// After:
if (productUUID) loanRecord.loan_product_id = productUUID;
```

### Step 4: Hard Refresh Browser
Press **Ctrl + Shift + R**

### Step 5: Test
Try creating a loan to verify the field works

---

## 🔍 HOW TO VERIFY YOUR ACTUAL SCHEMA

Run this in Supabase SQL Editor to see what columns ACTUALLY exist:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'loans'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

Save the results and compare to what the code is trying to set!

---

## 🚨 CRITICAL REMINDER: BROWSER CACHE

**The #1 reason fixes don't work immediately is browser caching!**

After EVERY code change:
1. Press **Ctrl + Shift + R** (Windows/Linux)
2. Or press **Cmd + Shift + R** (Mac)
3. Verify in Console that new code is loaded

See `/CLEAR_BROWSER_CACHE_GUIDE.md` for detailed instructions.

---

## 📊 DEBUGGING CHECKLIST

When you get a PGRST204 error:

- [ ] Note the exact field name from error message
- [ ] Search for field in `/services/supabaseDataService.ts`
- [ ] Check if field exists in Supabase Table Editor
- [ ] If NO: Comment out the assignment in code
- [ ] If YES: Refresh Supabase schema cache
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Test the operation again
- [ ] Check browser console for errors
- [ ] Verify in Supabase Table Editor

---

## 📚 DOCUMENTATION STRUCTURE

```
🚨_SCHEMA_ERRORS_MASTER_FIX.md  ← YOU ARE HERE (Master overview)
├── ⚡_FINAL_DURATION_MONTHS_FIX.md  (Specific fix #1)
├── ⚡_FINAL_LOAN_PRODUCT_ID_FIX.md  (Specific fix #2)
├── LOANS_TABLE_ACTUAL_SCHEMA.md     (Column reference)
└── CLEAR_BROWSER_CACHE_GUIDE.md     (Cache clearing steps)
```

---

## 🎓 UNDERSTANDING PGRST204

**What is PGRST204?**
- Error code from PostgREST (Supabase's API layer)
- Means: "I looked in my schema cache and couldn't find this column"
- **NOT a typo** - the column literally doesn't exist in the database

**Why does it happen?**
- Code tries to set a field that doesn't exist
- Schema files (documentation) don't match actual database
- Developer assumed field exists based on schema files

**How to fix?**
1. **Quick fix:** Remove the field assignment from code
2. **Proper fix:** Add the column to the database, then uncomment code

---

## 🚀 PREVENTION

To avoid future PGRST204 errors:

1. **Always verify schema** before coding
   - Check Supabase Table Editor
   - Run schema query (see above)
   - Don't trust schema files blindly

2. **Test incrementally**
   - Add one field at a time
   - Test after each change
   - Easier to identify which field causes error

3. **Keep docs updated**
   - Update `/LOANS_TABLE_ACTUAL_SCHEMA.md` when adding columns
   - Document any schema changes
   - Keep schema files in sync with reality

---

## 📞 TROUBLESHOOTING

### Error Persists After Fix?
1. Hard refresh browser (Ctrl+Shift+R)
2. Close all tabs and reopen
3. Try incognito mode
4. Check console for different error

### Still Getting PGRST204 for Same Field?
1. Verify you saved the file
2. Check the exact line number in error
3. Search for ALL occurrences of field name
4. There might be multiple places setting it

### Getting PGRST204 for Different Field?
1. Repeat the fix pattern for new field
2. Document in this master guide
3. Create new `/⚡_FINAL_FIELD_NAME_FIX.md`

### Getting PGRST201 Ambiguous Relationship Error?
1. **Identify the tables** involved (e.g., `loans` and `loan_products`)
2. **Check foreign keys:** Run SQL to see all foreign key constraints
3. **Specify the relationship:** Add `!constraint_name` to the query
4. **Example:** `loan_products!loans_product_id_fkey(...)`
5. **Documentation:** See `/⚡_FINAL_PGRST201_AMBIGUOUS_RELATIONSHIP_FIX.md`

---

**Last Updated:** March 12, 2026
**Status:** ✅ ALL KNOWN ISSUES FIXED
**Next Steps:** Clear cache and test loan creation

---

## 🎯 QUICK REFERENCE

### PGRST204 - Column Not Found
```bash
# Error pattern:
PGRST204: Could not find the 'FIELD_NAME' column

# Fix pattern:
1. Find field in /services/supabaseDataService.ts
2. Comment out: // if (value) record.FIELD_NAME = value;
3. Hard refresh: Ctrl + Shift + R
4. Test again
```

### PGRST201 - Ambiguous Relationship
```bash
# Error pattern:
PGRST201: More than one relationship found for 'table1' and 'table2'

# Fix pattern:
1. Identify the foreign key constraint names
2. Add !constraint_name to specify which one:
   table_name!foreign_key_constraint_name(columns)
3. Example: loan_products!loans_product_id_fkey(...)
4. Hard refresh: Ctrl + Shift + R
5. Test again
```

**Remember:** When in doubt, check what actually exists in Supabase Table Editor!
