# 🔄 How to Refresh Supabase Schema Cache

## The Problem
You've added columns to your database (by running `ADD_MISSING_COLUMNS.sql`), but Supabase's PostgREST API hasn't recognized them yet. This causes the `PGRST204` error: "Could not find the 'column_name' in the schema cache".

## The Solution: Refresh the Schema Cache

### Option 1: Using Supabase Dashboard (Recommended) ✅

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard

2. **Open API Settings**
   - Click on **Settings** (gear icon in left sidebar)
   - Click on **API** in the settings menu

3. **Reload Schema Cache**
   - Scroll down to find the **"Schema Cache"** section
   - Click the **"Reload schema cache"** button
   - You should see a success message

4. **Wait 60 seconds**
   - Give it a full minute for the cache to propagate
   - Don't try to create a loan immediately

5. **Test Loan Creation**
   - After waiting, try creating a loan in your app
   - It should work now!

### Option 2: Using SQL Command

If the dashboard button doesn't work, run this in your Supabase SQL Editor:

```sql
NOTIFY pgrst, 'reload schema';
```

Then wait 60 seconds before testing.

---

## After Schema Cache is Refreshed

Once the schema cache is successfully refreshed, you can re-enable the date fields:

1. **Open** `/services/supabaseDataService.ts`
2. **Find** lines ~1057-1077 (search for "TEMPORARILY DISABLED")
3. **Uncomment** the date fields:
   - `disbursed_at`
   - `first_payment_date`
   - `maturity_date`
   - `disbursement_method`
   - `disbursement_reference`

---

## Verify It Worked

Run this SQL to confirm all columns are recognized:

```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'loans'
ORDER BY column_name;
```

You should see all the columns including:
- ✅ duration_months
- ✅ monthly_installment
- ✅ outstanding_balance
- ✅ paid_amount
- ✅ principal_amount
- ✅ total_amount
- ✅ disbursed_at
- ✅ first_payment_date
- ✅ maturity_date
- ✅ disbursement_method
- ✅ disbursement_reference

---

## Current Status

✅ **Loan creation should work NOW** with basic fields  
⏳ **Date fields are temporarily disabled** until cache refresh  
🎯 **After cache refresh**, uncomment date fields to enable full functionality
