# Supabase Schema Fix Guide

## Problem
The application is trying to insert loans with column names that don't exist in the Supabase database:
- Error: `Could not find the 'amount' column of 'loans' in the schema cache`

## Root Cause
There's a mismatch between:
- **Code expects:** `amount`, `term_months`, `total_payable`, `monthly_payment`, `balance`
- **Database has:** `principal_amount`, `duration_months`, `total_amount`, `monthly_installment`, `outstanding_balance`

## Solution Options

### Option 1: Quick Fix (Recommended - Add Missing Columns)
This adds the missing columns alongside the existing ones and keeps them in sync.

**Steps:**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `/database/FIX_LOANS_COLUMNS.sql`
4. Click "Run" to execute

**What this does:**
- Adds `amount`, `term_months`, `total_payable`, etc. columns
- Copies existing data from the old column names
- Creates a trigger to keep both column sets in sync
- Allows both naming conventions to work

### Option 2: Update Application Code
Modify the application code to use the existing database column names.

**Files to change:**
- `/services/supabaseDataService.ts` (line 826+)
- `/lib/supabaseService.ts`

**Change mapping:**
```typescript
// OLD (Current Code)
amount: principalAmount,
term_months: term,
total_payable: totalAmount,
monthly_payment: monthlyInstallment,
balance: outstandingBalance,

// NEW (Match Database)
principal_amount: principalAmount,
duration_months: term,
total_amount: totalAmount,
monthly_installment: monthlyInstallment,
outstanding_balance: outstandingBalance,
```

### Option 3: Recreate Database Schema
Use the correct migration file from the start.

**Steps:**
1. Backup all data first!
2. Run `/supabase-migration.sql` OR `/supabase-migration-clean.sql`
3. These files create the tables with the correct column names

## Verification

After applying the fix, run this query in Supabase SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY column_name;
```

You should see both sets of columns:
- ✅ `amount` AND `principal_amount`
- ✅ `term_months` AND `duration_months`
- ✅ `total_payable` AND `total_amount`
- ✅ `monthly_payment` AND `monthly_installment`
- ✅ `balance` AND `outstanding_balance`

## Testing

After applying the fix, test loan creation:
1. Go to Loans tab in the application
2. Click "Create New Loan"
3. Fill in the form and submit
4. Check Supabase dashboard to verify the loan was created

## Column Mapping Reference

| Code Uses | Database Has | Description |
|-----------|-------------|-------------|
| `amount` | `principal_amount` | Principal loan amount |
| `term_months` | `duration_months` | Loan duration in months |
| `total_payable` | `total_amount` | Total amount to repay |
| `monthly_payment` | `monthly_installment` | Monthly payment amount |
| `balance` | `outstanding_balance` | Current outstanding balance |
| `purpose` | `purpose` | Loan purpose (might be missing) |
| `payment_method` | `disbursement_method` | Payment/disbursement method |
| `principal_paid` | `paid_amount` | Total principal paid |
| `interest_paid` | - | Total interest paid (missing) |

## Notes

- The trigger created in Option 1 will automatically sync values between both column sets
- This allows gradual migration without breaking existing code
- You can later consolidate to one naming convention once all code is updated
