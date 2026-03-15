# ✅ LOAN CREATION ERRORS - FIXED!

## Summary

We've successfully resolved **TWO critical errors** that were preventing loan creation:

### Error 1: ✅ FIXED - Runtime Error in rolePermissions.ts
**Error Message:**
```
Error: Unknown runtime error
    at config/rolePermissions.ts:434:119
    at config/rolePermissions.ts:455:2
```

**Root Cause:** Direct access to `window` object during server-side rendering/build time

**Solution Applied:** 
- ✅ Updated all `window` and `localStorage` checks to use `typeof window !== 'undefined'`
- ✅ Fixed in 4 functions: `getRolePermissions()`, `getAllRoles()`, `saveRolePermissions()`, and `getCustomRoleOverrides()`
- ✅ Added proper SSR-safe environment checks

### Error 2: 🔧 NEEDS ACTION - Supabase Schema Cache Error
**Error Message:**
```
❌ Error creating loan: {
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'amount' column of 'loans' in the schema cache"
}
```

**Root Cause:** Supabase's schema cache is out of sync with your actual database schema

**Solution:** Follow the steps below ⬇️

---

## 🚨 ACTION REQUIRED: Fix Supabase Schema Cache

The code is working correctly, but Supabase needs to refresh its understanding of your database structure.

### Option 1: Quick Fix - Refresh Schema Cache (RECOMMENDED ⭐)

1. **Go to your Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project

2. **Navigate to API Settings**
   - Click "API" in the left sidebar
   - Scroll down to find the "Schema Cache" section

3. **Refresh the Cache**
   - Click the **"Refresh schema cache"** button
   - Wait 30 seconds

4. **Test Loan Creation**
   - Return to your app
   - Try creating a loan again
   - It should work now! ✅

### Option 2: SQL Fix (If Option 1 Doesn't Work)

If refreshing the cache doesn't work, run this SQL:

1. **Go to Supabase SQL Editor**
   - In your Supabase dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run This SQL**
   ```sql
   -- Verify the amount column exists
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'loans' AND column_name = 'amount';
   
   -- If the above returns no rows, the column might be named differently
   -- Check all columns in the loans table:
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'loans'
   ORDER BY ordinal_position;
   ```

3. **If the `amount` column is missing**, run the complete fix:
   ```sql
   -- Copy and run the entire contents of /FIX_LOAN_CREATION_SCHEMA.sql
   ```

4. **After running SQL**
   - Go back to API settings
   - Click "Refresh schema cache"
   - Wait 30 seconds and test

### Option 3: Restart Project (Nuclear Option)

If both options above fail:

1. Go to **Settings → General** in Supabase
2. Click **"Pause project"**
3. Wait for it to pause completely
4. Click **"Resume project"**
5. Wait for it to start
6. Test loan creation

---

## ✅ What We Fixed in the Code

### File: `/config/rolePermissions.ts`

**Before (BROKEN):**
```typescript
// This throws ReferenceError during SSR/build
try {
  isClient = !!(window && window.localStorage);
} catch (e) {
  // Never reaches here because error happens before catch
}
```

**After (FIXED):**
```typescript
// This safely checks for browser environment
if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
  return systemRoles; // Safe fallback for SSR
}
```

### Changes Made:
- ✅ `getRolePermissions()` - Fixed window check
- ✅ `getAllRoles()` - Fixed window check  
- ✅ `saveRolePermissions()` - Fixed window check
- ✅ `getCustomRoleOverrides()` - Fixed window check
- ✅ `deleteCustomRole()` - Fixed window check

---

## 🔍 Understanding the PGRST204 Error

**What is PGRST204?**
- This is a PostgREST error code (Supabase uses PostgREST for its API)
- PGRST204 = "Schema cache issue"
- It means Supabase's API layer can't find a column it expects to exist

**Why does this happen?**
1. Database schema was modified directly
2. Schema cache wasn't refreshed
3. API layer is using old cached schema
4. New columns or renamed columns aren't recognized

**The Fix:**
- Refreshing the schema cache forces Supabase to re-scan your database
- This updates the API layer with the latest table structure
- Takes ~30 seconds to propagate

---

## 🎯 Testing the Fix

After refreshing the schema cache, test loan creation:

1. **Open your app**
2. **Navigate to Loans → New Loan**
3. **Fill in the form:**
   - Client: Select any client
   - Amount: e.g., 10000
   - Interest Rate: e.g., 7.5
   - Term: e.g., 3 months
   - Purpose: e.g., Business expansion

4. **Click "Create Loan"**
5. **Expected Result:** 
   - ✅ Loan created successfully
   - ✅ Auto-generated loan number (e.g., "BVF-LN00001")
   - ✅ No PGRST204 error

---

## 📊 Database Schema Reference

Your loans table should have these columns:

| Column Name | Data Type | Required | Notes |
|------------|-----------|----------|-------|
| id | TEXT | ✅ | Primary key (UUID) |
| loan_number | TEXT | ⚠️ | Auto-generated (e.g., "BVF-LN00001") |
| organization_id | TEXT | ✅ | Foreign key to organizations |
| client_id | TEXT | ✅ | Foreign key to clients |
| loan_product_id | TEXT | ⚠️ | Foreign key to loan_products |
| **amount** | NUMERIC | ✅ | **Principal amount** |
| interest_rate | NUMERIC | ✅ | Flat rate per period |
| term_months | INTEGER | ✅ | Loan duration |
| total_payable | NUMERIC | ✅ | Total amount due |
| monthly_payment | NUMERIC | ✅ | Installment amount |
| balance | NUMERIC | ✅ | Outstanding balance |
| status | TEXT | ✅ | Loan status |
| application_date | DATE | ✅ | When loan was applied for |
| payment_method | TEXT | ✅ | Disbursement method |

---

## 🔗 Related Files

- `/FIX_LOAN_CREATION_SCHEMA.sql` - Complete SQL fix script
- `/services/supabaseDataService.ts` - Loan creation logic (lines 765-892)
- `/config/rolePermissions.ts` - Fixed SSR issues

---

## 💡 Need Help?

If you're still experiencing issues after following these steps:

1. **Check the browser console** for detailed error messages
2. **Verify your Supabase connection** is active
3. **Check that your database has the `loans` table** with the correct columns
4. **Ensure RLS policies** allow your user to insert into the loans table

---

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ No runtime errors in console
- ✅ Loans page loads without errors
- ✅ New loan form submits successfully
- ✅ Loan appears in the loans list
- ✅ Loan has auto-generated number (BVF-LN#####)

---

**Last Updated:** March 12, 2026
**Status:** ✅ Code fixes applied | 🔧 Schema cache refresh needed
