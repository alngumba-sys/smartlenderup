# Quick Fix Guide - SmartLenderUp Platform

## 🚨 Immediate Action Required

### Issue 1: Payees Not Saving ❌

**Symptom:** Error message "Could not find the 'contact_email' column of 'payees'" OR "Could not find the 'contact_phone' column of 'payees'"

**Fix:** Run this SQL in Supabase SQL Editor (copy and paste all at once):

```sql
-- Add all missing columns to payees table (INCLUDING contact_phone)
ALTER TABLE payees ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';
ALTER TABLE payees ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS physical_address TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS kra_pin TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS mpesa_number TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0;
```

**Important:** Run ALL the ALTER TABLE commands at once. Don't run the constraint section - it's optional.

**Verification:** Try creating a new payee - should work without errors.

---

### Issue 2: Portfolio by Product Chart Empty 📊

**Symptom:** Chart shows "No active loans with outstanding balances for existing products"

**Diagnosis:** Run this SQL to check if loans match products:

```sql
-- Check if product IDs match
SELECT 
    l.loan_number,
    l.product_id AS loan_product_id,
    p.product_name,
    CASE 
        WHEN p.id IS NULL THEN '❌ NO MATCH'
        ELSE '✅ MATCH'
    END AS status
FROM loans l
LEFT JOIN products p ON l.product_id = p.id
WHERE l.organization_id = (SELECT id FROM organizations LIMIT 1);
```

**Fix (if loans don't match products):**

1. Get your product ID:
```sql
SELECT id, product_name FROM products;
```

2. Update loans with the correct product ID:
```sql
-- REPLACE 'your-product-id-here' with actual product ID from step 1
UPDATE loans
SET product_id = 'your-product-id-here'
WHERE product_id NOT IN (SELECT id FROM products);
```

**Verification:** Refresh the dashboard - Portfolio by Product should now show data.

---

### Issue 3: Loan Product Statistics Showing Zeros 📉

**Symptom:** Product cards show "Total Loans: 0, Active: 0, Disbursed: KES 0"

**This is the same issue as #2** - If loans don't have matching product IDs, they won't show in product statistics.

**Fix:** Same as Issue #2 above - update loans to have correct product IDs.

---

## 📝 Complete SQL Scripts

For detailed SQL queries and diagnosis, see:
- `/SQL_QUERIES_PAYEES_FIX.sql` - Complete payees table fixes
- `/SQL_QUERIES_PORTFOLIO_DIAGNOSIS.sql` - Detailed portfolio diagnostics

---

## ✅ Verification Checklist

After running the SQL queries above:

- [ ] Payees can be created without errors
- [ ] Portfolio by Product chart shows loan distribution
- [ ] Loan Product cards show correct Total Loans count
- [ ] Loan Product cards show correct Active loans count
- [ ] Loan Product cards show correct Disbursed amount
- [ ] No console errors about missing columns
- [ ] No console warnings about product ID mismatches

---

## 🔍 How to Check Browser Console

1. Open your app in Chrome/Firefox
2. Press `F12` or right-click → Inspect
3. Click "Console" tab
4. Look for warnings like:
   ```
   ⚠️ PRODUCT ID MISMATCH DETECTED
   ```

If you see this warning, it means loans have product IDs that don't match any existing products. Use the SQL fix above to correct it.

---

## 📞 Still Having Issues?

1. Check that loans have status: `Active`, `Disbursed`, or `In Arrears`
2. Verify organization_id matches in both loans and products tables
3. Ensure at least one loan has `outstanding_balance > 0`
4. Check browser console for specific error messages

---

## 🎯 Summary

**Root Cause of All Issues:**
1. Missing database columns (payees table)
2. Product ID mismatches (loans referencing non-existent products)

**Solution:**
1. Run the payees SQL fix (5 minutes)
2. Run the portfolio diagnosis SQL (5 minutes)
3. Fix any product ID mismatches found
4. Refresh the app

**Total Time:** ~15 minutes

---

Last Updated: 2026-01-03
Platform: SmartLenderUp
Environment: Production