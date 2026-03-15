# Fix: "Could not find 'amount' column" Loan Creation Error

## Problem
When creating a loan, you're getting this error:
```
Error creating loan:
{code: 'PGRST204', details: null, hint: null, message: "Could not find the 'amount' column of 'loans' in the schema cache"}
```

## Root Cause
This is a **Supabase schema cache issue**, not a missing column. The `amount` column EXISTS in your database but Supabase's internal cache doesn't know about it yet.

## Solution

### Step 1: Run the SQL Fix
1. Go to your Supabase Dashboard → SQL Editor
2. Open the file `/FIX_LOAN_CREATION_SCHEMA.sql`
3. Copy and paste the entire contents
4. Click "Run" to execute

This will:
- Add the missing `loan_number` column
- Verify that all required columns exist
- Populate existing loans with loan numbers

### Step 2: Refresh Supabase Schema Cache

**CRITICAL:** You MUST do this after running the SQL!

#### Method A: Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click on **"API"** in the left sidebar  
3. Scroll down and click **"Refresh schema cache"** button
4. Wait 10-15 seconds

#### Method B: Restart Project
1. Go to **Settings** → **General**
2. Click **"Pause project"** and wait
3. Click **"Resume project"**
4. Wait for the project to fully start (1-2 minutes)

#### Method C: API Call (Advanced)
If you have your service role key:
```bash
curl -X POST 'https://your-project-ref.supabase.co/rest/v1/rpc/refresh_schema_cache' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### Step 3: Clear Browser Cache
1. In your browser, open DevTools (F12)
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Clear **Local Storage** and **Session Storage**
4. Do a **hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Step 4: Test Loan Creation
1. Go to your Loans tab
2. Click "New Loan"
3. Fill in the required fields:
   - Select a client
   - Select a loan product
   - Enter amount
   - Enter interest rate
   - Enter term
   - Select disbursement method
4. Click "Create Loan"

It should now work!

## What Was Fixed

### Code Changes Made:
1. **`/services/supabaseDataService.ts`**
   - Made `loan_number` generation fault-tolerant (won't fail if column doesn't exist)
   - Added conditional inclusion of `loan_number` in insert statement
   - Added try-catch for loan number generation

### Database Changes (from SQL file):
1. Added `loan_number` column to `loans` table
2. Created index on `loan_number` for performance
3. Populated existing loans with sequential loan numbers

## Verification

After completing all steps, run this query in Supabase SQL Editor to verify:

```sql
-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'loans'
AND column_name IN ('amount', 'loan_number', 'term_months', 'total_payable')
ORDER BY column_name;

-- Test that we can query the columns
SELECT 
  COUNT(*) as total_loans,
  SUM(amount) as total_amount,
  COUNT(loan_number) as loans_with_numbers
FROM loans;
```

Expected output:
- Should show 4 columns: `amount`, `loan_number`, `term_months`, `total_payable`
- Should show statistics about your loans

## Troubleshooting

### Still Getting the Error?
1. **Wait longer** - Schema cache refresh can take 30-60 seconds
2. **Try Method B** (restart project) - This is more aggressive
3. **Check RLS policies** - Make sure your organization has proper Row Level Security access
4. **Check logs** - Look at browser console for more detailed error messages

### Error: "organization_id must be a UUID"
Your organization ID in localStorage might be corrupted:
1. Open browser console
2. Run: `localStorage.removeItem('current_organization')`
3. Log out and log back in

### Error: "client_id not found"
Make sure you're selecting an existing client from the dropdown, not typing a custom ID.

## What Happens Next

Once fixed:
1. ✅ Loans will be created with auto-generated loan numbers (e.g., "BVF-LN00001")
2. ✅ All financial calculations will work correctly
3. ✅ Loan approvals will be created automatically
4. ✅ Guarantors and collateral will be saved properly
5. ✅ The loan will appear in your loans list immediately

## Need Help?

If you're still having issues after following all steps:
1. Check the browser console (F12) for detailed error messages
2. Check the Supabase logs (Dashboard → Logs)
3. Verify your organization ID matches between localStorage and database
4. Make sure you have the required permissions in your role
