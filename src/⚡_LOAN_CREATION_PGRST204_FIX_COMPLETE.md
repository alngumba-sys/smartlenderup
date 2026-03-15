# ⚡ LOAN CREATION PGRST204 ERROR - COMPLETE FIX

## 🔴 The Problem

You're getting this error when trying to create a loan:
```
Error: "Could not find the 'paid_amount' column of 'loans' in the schema cache"
Code: PGRST204
```

This is a **schema cache error** - Supabase can't find columns that should exist in your database.

## ✅ The Solution (3 Steps)

### STEP 1: Run the SQL Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the **ENTIRE CONTENTS** of `/FIX_LOAN_CREATION_SCHEMA.sql`
4. Click **Run** to execute it
5. Wait for all the "Added column" or "already exists" messages

This will add ALL missing columns that the loan creation form needs.

### STEP 2: Refresh Schema Cache

After running the SQL:

**Option A - Dashboard Method (RECOMMENDED):**
1. Go to **Supabase Dashboard** → **API** section
2. Click **"Refresh schema cache"** button
3. Wait 30 seconds

**Option B - Automatic Method:**
Just wait 30 seconds after running the SQL and Supabase will auto-refresh.

### STEP 3: Hard Refresh Your Browser

After the schema cache is refreshed:

**Windows/Linux:**
- Press `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

**Or:**
- Clear your browser cache manually
- Use an incognito/private window

## 📋 What Was Fixed

### Database Schema Updates

The following columns have been added to the `loans` table:

#### Required Fields (from loan creation form):
- `paid_amount` - DECIMAL(15,2) - Tracks total amount paid
- `monthly_installment` - DECIMAL(15,2) - Monthly payment amount
- `duration_months` - INTEGER - Loan term in months
- `loan_product_id` - UUID - References loan product
- `facilitation_fee` - DECIMAL(10,2) - Facilitation fee charged
- `staff_member_id` - UUID - Staff member who brought the deal
- `collateral_type` - TEXT - Type of collateral
- `collateral_value` - DECIMAL(15,2) - Value of collateral
- `loan_term` - INTEGER - Alternative field for duration
- `creation_date` - DATE - When loan was created
- `application_date` - TIMESTAMP - When loan was applied for
- `first_payment_date` - DATE - First payment due date
- `maturity_date` - DATE - Loan maturity date

#### Calculated Fields (for reporting):
- `total_interest` - DECIMAL(15,2) - Total interest amount
- `total_repayable` - DECIMAL(15,2) - Total amount to repay

### Code Updates

Updated `/services/supabaseDataService.ts`:
- ✅ Now sends `duration_months` (loan term)
- ✅ Now sends `monthly_installment` (calculated)
- ✅ Now sends `paid_amount` (initialized to 0)
- ✅ Now sends `total_interest` and `total_repayable`
- ✅ Now sends `loan_product_id` (product selection)
- ✅ Now sends `facilitation_fee` (from form)
- ✅ Now sends `staff_member_id` (who brought this deal)
- ✅ Now sends `collateral_type` and `collateral_value` (from form)
- ✅ Now sends `creation_date`, `application_date`, `first_payment_date`, `maturity_date`
- ✅ Removed incorrect safety filter that was blocking these fields

## 🧪 Testing the Fix

After completing all 3 steps, test loan creation:

1. Go to **Loans** tab
2. Click **"Add Loan"**
3. Fill in the form:
   - Select a client
   - Select a loan product
   - Enter principal amount
   - Enter interest rate
   - Enter loan term (months)
   - Add facilitation fee (optional)
   - Select staff member (optional)
   - Add collateral details (optional)
   - Add guarantor details (optional)
4. Click **"Create Loan Application"**

### Expected Result:
✅ Loan created successfully without any PGRST204 errors!

### If It Still Fails:

Check the browser console for the exact error. If you still see PGRST204:

1. **Verify the column was added:**
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'loans' AND column_name = 'paid_amount';
   ```

2. **Force refresh schema cache again:**
   Go to Supabase Dashboard → API → Click "Refresh schema cache"

3. **Check for RLS policies:**
   The columns might exist but RLS (Row Level Security) might be blocking them.

## 📊 Fields Sent to Database

When you create a loan, these fields are now sent to Supabase:

### Core Required:
- `id` (UUID, auto-generated)
- `organization_id` (UUID, from current user)
- `client_id` (UUID, from form)
- `loan_number` (TEXT, auto-generated with org prefix)
- `principal_amount` (DECIMAL)
- `interest_rate` (DECIMAL)
- `status` ('pending' by default)

### Calculated:
- `total_interest` (calculated: principal × rate × term / 100)
- `total_amount` (principal + total_interest)
- `total_repayable` (same as total_amount)
- `monthly_installment` (total_amount / term)
- `outstanding_balance` (initialized to total_amount)
- `paid_amount` (initialized to 0)

### From Form:
- `duration_months` / `loan_term`
- `loan_product_id`
- `purpose`
- `facilitation_fee`
- `processing_fee`
- `insurance_fee`
- `staff_member_id`
- `collateral_type`
- `collateral_value`
- `creation_date`
- `application_date`
- `first_payment_date`
- `maturity_date`
- `notes`

### Separate Tables:
- **Guarantors** → saved to `loan_guarantors` table
- **Documents** → saved to `loan_documents` table
- **Collateral** → saved to `loan_collaterals` table (if separate entries)

## 🎯 Why This Happened

The issue occurred because:

1. **Schema file vs actual database mismatch:** The `/supabase/schema.sql` file defined columns like `paid_amount`, `monthly_installment`, and `duration_months`, but these weren't actually created in your deployed Supabase database.

2. **Previous "fixes" removed fields:** Earlier attempts to fix PGRST204 errors commented out these fields in the code, thinking they didn't exist. This created a catch-22 situation.

3. **Schema cache wasn't refreshed:** Even when columns were added, Supabase's internal cache didn't know about them.

## ✅ Prevention

To prevent this in the future:

1. **Always apply schema.sql to your database** when setting up a new project
2. **Refresh schema cache** after any database schema changes
3. **Check information_schema.columns** to verify columns exist before coding
4. **Don't guess about column names** - always verify with the actual database

## 📝 Notes

- All calculated fields (`total_interest`, `total_repayable`, `monthly_installment`) are now stored in the database for reporting purposes, but can also be calculated on the frontend
- The loan term is stored in both `duration_months` and `loan_term` for compatibility
- Interest calculation uses FLAT RATE formula: `Interest = Principal × Rate × Term / 100`
- Monthly rate of 7.5% on 100,000 for 1 month = 7,500 interest

## 🆘 Still Having Issues?

If you're still getting errors:

1. Check the browser console for the exact error message
2. Run the diagnostic query in `/FIX_LOAN_CREATION_SCHEMA.sql` (Step 1B)
3. Verify your Supabase project is active and not paused
4. Check RLS policies on the loans table
5. Verify you're using the correct organization ID

---

**Last Updated:** March 12, 2026
**Fixed By:** AI Assistant
**Files Modified:**
- `/services/supabaseDataService.ts`
- `/FIX_LOAN_CREATION_SCHEMA.sql` (new)
