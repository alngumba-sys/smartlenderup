# Complete Supabase Schema Column Mapping Fix

## All Errors Fixed

```
❌ Error 1: Could not find the 'duration_months' column of 'loans' in the schema cache
❌ Error 2: Could not find the 'first_payment_date' column of 'loans' in the schema cache
```

## Root Cause

The application code was using column names from the old `/supabase/schema.sql` file, but the actual Supabase database is using the schema from `/supabase/COMPLETE_DATABASE_SETUP.sql`, which has different column names.

## Complete Column Mapping Table

| Application Field | OLD Column Name (Wrong) | NEW Column Name (Correct) | Status |
|------------------|------------------------|---------------------------|--------|
| Loan Term | `duration_months` | `loan_term` | ✅ FIXED |
| First Payment Date | `first_payment_date` | *Does not exist* | ✅ REMOVED |
| Purpose | `purpose` | `loan_purpose` | ✅ FIXED |
| Monthly Payment | `monthly_installment` | `monthly_repayment` | ✅ FIXED |
| Outstanding Balance | `outstanding_balance` | `total_outstanding` | ✅ FIXED |
| Paid Amount | `paid_amount` | `total_paid` | ✅ FIXED |
| Interest Amount | *Missing* | `interest_amount` | ✅ ADDED |

## Detailed Changes

### 1. `/lib/supabaseService.ts` - Transform Functions

**Loan Term:**
```javascript
// BEFORE:
'term': 'duration_months',
'term_months': 'duration_months',

// AFTER:
'term': 'loan_term',
'term_months': 'loan_term',
'duration_months': 'loan_term', // Backwards compatibility
```

**First Payment Date:**
```javascript
// BEFORE:
'firstRepaymentDate': 'first_payment_date',
'first_payment_date': 'first_payment_date',

// AFTER:
// Commented out - column doesn't exist in actual database
```

**Purpose:**
```javascript
// BEFORE:
'purpose': 'purpose',

// AFTER:
'purpose': 'loan_purpose',
```

**Monthly Payment:**
```javascript
// BEFORE:
'installmentAmount': 'monthly_installment',
'monthly_payment': 'monthly_installment',

// AFTER:
'installmentAmount': 'monthly_repayment',
'monthly_payment': 'monthly_repayment',
'monthly_installment': 'monthly_repayment', // Backwards compatibility
```

**Outstanding Balance:**
```javascript
// BEFORE:
'outstandingBalance': 'outstanding_balance',
'balance': 'outstanding_balance',

// AFTER:
'outstandingBalance': 'total_outstanding',
'balance': 'total_outstanding',
'outstanding_balance': 'total_outstanding', // Backwards compatibility
```

**Paid Amount:**
```javascript
// BEFORE:
'paidAmount': 'paid_amount',
'principal_paid': 'paid_amount',

// AFTER:
'paidAmount': 'total_paid',
'principal_paid': 'total_paid',
'paid_amount': 'total_paid', // Backwards compatibility
```

**Reading from Database:**
```javascript
// BEFORE:
term: loan.duration_months || 0,
installmentAmount: loan.monthly_installment || 0,
outstandingBalance: loan.outstanding_balance || 0,
paidAmount: loan.paid_amount || 0,

// AFTER (with fallbacks):
term: loan.loan_term || loan.duration_months || loan.term_months || 0,
installmentAmount: loan.monthly_repayment || loan.monthly_installment || 0,
outstandingBalance: loan.total_outstanding || loan.outstanding_balance || 0,
paidAmount: loan.total_paid || loan.paid_amount || 0,
```

### 2. `/services/supabaseDataService.ts` - Loan Creation

**BEFORE:**
```javascript
{
  principal_amount: principalAmount,
  interest_rate: interestRate,
  duration_months: term,
  purpose: loanData.purpose || '',
  total_amount: totalAmount,
  monthly_installment: monthlyInstallment,
  outstanding_balance: totalAmount,
  paid_amount: 0,
  first_payment_date: loanData.firstRepaymentDate ? loanData.firstRepaymentDate.split('T')[0] : null,
}
```

**AFTER:**
```javascript
{
  principal_amount: principalAmount,
  interest_rate: interestRate,
  loan_term: term, // ✅ FIXED
  loan_purpose: loanData.purpose || '', // ✅ FIXED
  interest_amount: interestAmount, // ✅ ADDED (required field)
  total_amount: totalAmount,
  monthly_repayment: monthlyInstallment, // ✅ FIXED
  total_outstanding: totalAmount, // ✅ FIXED
  total_paid: 0, // ✅ FIXED
  // first_payment_date removed - doesn't exist in schema ✅ FIXED
}
```

**Field Mappings for Reading:**
```javascript
// BEFORE:
'loanTerm': 'duration_months',
'outstandingBalance': 'outstanding_balance',
'paidAmount': 'paid_amount',
'firstRepaymentDate': 'first_payment_date',

// AFTER:
'loanTerm': 'loan_term', // ✅ FIXED
'outstandingBalance': 'total_outstanding', // ✅ FIXED
'paidAmount': 'total_paid', // ✅ FIXED
// 'firstRepaymentDate' removed ✅ FIXED
```

## Actual Database Schema (from COMPLETE_DATABASE_SETUP.sql)

```sql
CREATE TABLE loans (
  id TEXT PRIMARY KEY,
  organization_id UUID,
  client_id UUID,
  loan_product_id TEXT,
  
  -- Loan Details
  loan_number TEXT UNIQUE NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  interest_method TEXT DEFAULT 'flat',
  loan_term INTEGER NOT NULL,              -- ✅ NOT duration_months
  disbursement_date DATE,
  maturity_date DATE,
  
  -- Calculated Amounts
  interest_amount DECIMAL(15,2) NOT NULL,  -- ✅ Required field
  total_amount DECIMAL(15,2) NOT NULL,
  monthly_repayment DECIMAL(15,2) NOT NULL, -- ✅ NOT monthly_installment
  
  -- Purpose
  loan_purpose TEXT,                       -- ✅ NOT purpose
  
  -- Status & Approval
  status TEXT DEFAULT 'pending',
  
  -- Outstanding Balance
  total_outstanding DECIMAL(15,2),         -- ✅ NOT outstanding_balance
  
  -- Payment Tracking
  total_paid DECIMAL(15,2) DEFAULT 0,      -- ✅ NOT paid_amount
  
  -- NOTE: No first_payment_date column!
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Files Modified

1. `/lib/supabaseService.ts`
   - Updated `transformLoanForSupabase()` field mappings
   - Updated `transformLoanFromSupabase()` reading logic with fallbacks
   - Removed `first_payment_date` from date fields cleaning

2. `/services/supabaseDataService.ts`
   - Updated loan creation object to use correct column names
   - Added `interest_amount` field (required)
   - Updated field mappings for reading loans from database
   - Removed `first_payment_date` field

## Testing Checklist

✅ **Test Loan Creation:**
1. Go to Loans tab → New Loan
2. Fill in all required fields:
   - Client
   - Loan Product
   - Principal Amount
   - Loan Term (months)
   - Purpose
3. Submit the loan
4. **Expected:** No schema errors in console
5. **Expected:** See "✅ Loan created successfully in Supabase"

✅ **Verify in Supabase:**
1. Open Supabase Dashboard → Table Editor → `loans`
2. Find the newly created loan
3. Verify all fields are populated:
   - `loan_term` (not duration_months)
   - `loan_purpose` (not purpose)
   - `monthly_repayment` (not monthly_installment)
   - `total_outstanding` (not outstanding_balance)
   - `total_paid` (not paid_amount)
   - `interest_amount` is calculated and present
   - No `first_payment_date` column exists

✅ **Test Loan Reading:**
1. Refresh the Loans tab
2. **Expected:** All loans display correctly
3. **Expected:** No console errors about missing columns

## Status

✅ **ALL FIXED** - Complete schema mapping alignment between application code and Supabase database

## Prevention

To prevent similar issues in the future:

1. **Always check the actual Supabase database schema** in the Table Editor before coding
2. **Don't assume** column names based on old migration files
3. **Use the actual column names** from the live database, not from outdated schema files
4. **Add fallbacks** when reading from database to handle legacy column names
5. **Test thoroughly** after any schema changes

## Summary

The application is now fully aligned with the actual Supabase database schema (`COMPLETE_DATABASE_SETUP.sql`). All loan operations (create, read, update) will work correctly without column mismatch errors.
