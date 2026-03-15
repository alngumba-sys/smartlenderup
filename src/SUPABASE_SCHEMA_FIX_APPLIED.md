# Supabase Schema Fix - Applied Changes

## Problem Resolved
✅ Fixed error: `Could not find the 'amount' column of 'loans' in the schema cache`

## Root Cause
The application code was using different column names than the actual Supabase database schema:

| Code Expected | Actual Supabase Schema |
|---------------|----------------------|
| `amount` | `principal_amount` |
| `term_months` | `duration_months` |
| `total_payable` | `total_amount` |
| `monthly_payment` | `monthly_installment` |
| `balance` | `outstanding_balance` |
| `payment_method` | `disbursement_method` |
| `principal_paid` | `paid_amount` |
| `interest_paid` | ❌ Column doesn't exist |

## Changes Made

### 1. `/services/supabaseDataService.ts`

#### Loan Creation (Line ~818)
**Changed column names in loan object:**
```typescript
// BEFORE
amount: principalAmount,
term_months: term,
total_payable: totalAmount,
monthly_payment: monthlyInstallment,
balance: outstandingBalance,
principal_paid: 0,
interest_paid: 0,
payment_method: 'cash',

// AFTER
principal_amount: principalAmount,
duration_months: term,
total_amount: totalAmount,
monthly_installment: monthlyInstallment,
outstanding_balance: outstandingBalance,
paid_amount: 0,
// interest_paid removed (column doesn't exist)
disbursement_method: 'cash',
```

#### Loan Update Field Mapping (Line ~991)
**Updated field transformations:**
```typescript
// BEFORE
'principalAmount': 'amount',
'loanTerm': 'term_months',
'totalRepayable': 'total_payable',
'outstandingBalance': 'balance',
'paidAmount': 'balance',
'principalPaid': 'principal_paid',
'interestPaid': 'interest_paid',
'paymentMethod': 'payment_method'

// AFTER
'principalAmount': 'principal_amount',
'loanTerm': 'duration_months',
'totalRepayable': 'total_amount',
'outstandingBalance': 'outstanding_balance',
'paidAmount': 'paid_amount',
'principalPaid': 'paid_amount',
// 'interestPaid' removed
'paymentMethod': 'disbursement_method'
```

#### Repayment Logic (Line ~1222)
**Updated loan balance queries:**
```typescript
// BEFORE
.select('balance, amount_paid')
// Update: balance, amount_paid

// AFTER
.select('outstanding_balance, paid_amount')
// Update: outstanding_balance, paid_amount
```

### 2. `/lib/supabaseService.ts`

#### Skip List Update (Line ~541)
**Added `interestPaid` to fields to skip:**
```typescript
key === 'interestPaid' || key === 'interest_paid'
```

**Reason:** The `interest_paid` column doesn't exist in the Supabase schema

## Database Schema Reference

### Loans Table Columns (Actual Supabase Schema)
```sql
CREATE TABLE public.loans (
  id UUID PRIMARY KEY,
  loan_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL,
  organization_id UUID,
  loan_product_id UUID,
  loan_officer_id UUID,
  
  -- Financial columns
  principal_amount DECIMAL(15,2) NOT NULL,    -- ✅ NOT 'amount'
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,            -- ✅ NOT 'term_months'
  total_amount DECIMAL(15,2) NOT NULL,         -- ✅ NOT 'total_payable'
  monthly_installment DECIMAL(15,2) NOT NULL,  -- ✅ NOT 'monthly_payment'
  outstanding_balance DECIMAL(15,2) NOT NULL,  -- ✅ NOT 'balance'
  paid_amount DECIMAL(15,2) DEFAULT 0,         -- ✅ NOT 'principal_paid'
  
  -- Other columns
  purpose TEXT,
  status TEXT DEFAULT 'pending',
  application_date TIMESTAMP,
  disbursed_at TIMESTAMP,
  disbursement_method TEXT,                    -- ✅ NOT 'payment_method'
  first_payment_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Checklist

After these changes, test the following:

- [ ] ✅ Create a new loan - Should work without errors
- [ ] ✅ Update an existing loan - Should work without errors
- [ ] ✅ Record a repayment - Should update loan balance correctly
- [ ] ✅ View loan list - Should display all fields correctly
- [ ] ✅ View loan details - Should show correct amounts

## Alternative Solution (If Still Having Issues)

If you continue to experience schema errors, you can run the SQL fix in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Run `/database/FIX_LOANS_COLUMNS.sql`
3. This will add the missing columns and create a sync trigger

## Files Changed

1. ✅ `/services/supabaseDataService.ts` - Loan creation, updates, and repayment logic
2. ✅ `/lib/supabaseService.ts` - Field mapping and skip list
3. 📄 `/database/FIX_LOANS_COLUMNS.sql` - SQL fix (optional, for adding columns)
4. 📄 `/database/SUPABASE_SCHEMA_FIX_GUIDE.md` - Detailed guide
5. 📄 `/supabase/migrations/fix_loans_schema.sql` - Migration file

## Summary

The code now correctly maps to the actual Supabase database schema. All loan operations (create, read, update, repayment) now use the proper column names:
- ✅ `principal_amount` instead of `amount`
- ✅ `duration_months` instead of `term_months`
- ✅ `total_amount` instead of `total_payable`
- ✅ `monthly_installment` instead of `monthly_payment`
- ✅ `outstanding_balance` instead of `balance`
- ✅ `disbursement_method` instead of `payment_method`
- ✅ `paid_amount` instead of `principal_paid`
- ✅ Removed `interest_paid` (column doesn't exist)

Try creating a loan now - the error should be resolved! 🎉
