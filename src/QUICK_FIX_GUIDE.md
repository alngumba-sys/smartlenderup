# Quick Fix Guide for Loan Creation Error

## Current Error
```
PGRST204: Could not find the 'disbursement_reference' column of 'loans' in the schema cache
```

## Root Cause
Your Supabase database is missing several columns that the application expects.

## SOLUTION (Choose ONE):

### ✅ OPTION 1: Add Missing Columns (RECOMMENDED)

**Step 1:** Run this SQL in your Supabase SQL Editor:

Go to `/CHECK_AND_ADD_MISSING_COLUMNS.sql` and run it in Supabase.

This will:
- Show you what columns currently exist
- Add any missing columns automatically
- Verify everything is correct

**Step 2:** Refresh Supabase Schema Cache
1. Go to Supabase Dashboard → **API**
2. Click **"Refresh schema cache"**
3. Wait 30 seconds

**Step 3:** Try creating a loan again

---

### ⚙️ OPTION 2: Use Minimal Columns Only (If Option 1 doesn't work)

If you can't add columns, the code has been updated to only use core required fields.

**What changed:**
- Removed optional fields that don't exist in your database
- Only uses: `principal_amount`, `interest_rate`, `duration_months`, `status`, `total_amount`, `monthly_installment`, `outstanding_balance`, `paid_amount`

**To enable more fields later:** Uncomment lines in `/services/supabaseDataService.ts` around line 858-863 after adding those columns to your database.

---

## What Columns Your Database Needs

### ✅ CORE REQUIRED (Must have):
- `id` (UUID PRIMARY KEY)
- `organization_id` (UUID)
- `client_id` (UUID)
- `principal_amount` (DECIMAL)
- `interest_rate` (DECIMAL)
- `duration_months` (INTEGER)
- `status` (TEXT)
- `total_amount` (DECIMAL)
- `monthly_installment` (DECIMAL)
- `outstanding_balance` (DECIMAL)
- `paid_amount` (DECIMAL)

### 🔧 OPTIONAL (Nice to have):
- `loan_number` (TEXT)
- `loan_product_id` (UUID)
- `loan_officer_id` (UUID)
- `purpose` (TEXT)
- `application_date` (DATE/TIMESTAMP)
- `processing_fee` (DECIMAL)
- `insurance_fee` (DECIMAL)
- `notes` (TEXT)
- `disbursement_method` (TEXT)
- `disbursement_reference` (TEXT)
- `first_payment_date` (DATE)
- `maturity_date` (DATE)
- `days_in_arrears` (INTEGER)
- `approved_by` (UUID)
- `approved_at` (TIMESTAMP)
- `disbursed_by` (UUID)
- `disbursed_at` (TIMESTAMP)
- `reviewed_by` (UUID)
- `reviewed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## Testing After Fix

1. **Create a simple loan:**
   - Client: Select any existing client
   - Product: Select any existing product
   - Amount: 50000
   - Interest Rate: 7.5
   - Term: 12 months

2. **Check console for errors:**
   - Should see "✅ Loan created successfully"
   - No PGRST204 errors

3. **Verify in Supabase:**
   ```sql
   SELECT * FROM loans ORDER BY created_at DESC LIMIT 1;
   ```

---

## Still Not Working?

If you still get PGRST204 errors after trying both options:

1. **Copy the EXACT error message** from the console
2. **Run this SQL to check your schema:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'loans' 
   ORDER BY ordinal_position;
   ```
3. **Compare with the column list above**
4. **Add the missing column** or tell me which column is causing the error

---

## Files Modified
- ✅ `/services/supabaseDataService.ts` - Simplified loan creation
- ✅ `/CHECK_AND_ADD_MISSING_COLUMNS.sql` - SQL to add missing columns
- ✅ `/QUICK_FIX_GUIDE.md` - This guide
- ✅ `/LOAN_SCHEMA_FIX_DOCUMENTATION.md` - Complete technical documentation
