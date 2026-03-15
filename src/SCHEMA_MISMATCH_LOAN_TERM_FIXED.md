# Fixed: Multiple Loan Column Schema Mismatches

## Errors
```
❌ Error creating loan: {
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'duration_months' column of 'loans' in the schema cache"
}

❌ Error creating loan: {
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'first_payment_date' column of 'loans' in the schema cache"
}
```

## Root Cause

The application code was using column names that don't exist in the actual Supabase database. Looking at the various schema files in the project:

### Issue 1: Loan Term Column
1. `/supabase/schema.sql` (line 181): Uses `duration_months`
2. `/supabase/COMPLETE_DATABASE_SETUP.sql` (line 208): Uses `loan_term`
3. `/supabase-migration.sql` (line 111): Uses `term_months`

The error indicates the actual database uses `loan_term`, not `duration_months`.

### Issue 2: First Payment Date Column
1. `/supabase/schema.sql` (line 199): Has `first_payment_date`
2. `/supabase/COMPLETE_DATABASE_SETUP.sql`: **Does NOT have this column at all**

The error indicates the actual database doesn't have a `first_payment_date` column, meaning it's using the schema from `COMPLETE_DATABASE_SETUP.sql`.

## Fixes Applied

### Fix 1: Loan Term Column Mapping

Changed all loan term column mappings from `duration_months` to `loan_term` to match the actual database schema:

### Fix 2: First Payment Date Column

Removed all references to `first_payment_date` since this column doesn't exist in the actual database schema:

### 1. `/lib/supabaseService.ts`

**transformLoanForSupabase() field mapping:**
```javascript
// BEFORE (WRONG):
'term': 'duration_months',
'term_months': 'duration_months',
'term_period': 'duration_months',
'loanTerm': 'duration_months',

// AFTER (FIXED):
'term': 'loan_term',
'term_months': 'loan_term',
'term_period': 'loan_term',
'loanTerm': 'loan_term',
'duration_months': 'loan_term', // Also map duration_months for backwards compatibility
```

**transformLoanFromSupabase() reading (loan term):**
```javascript
// BEFORE:
term: loan.duration_months || 0,

// AFTER (FIXED - with fallbacks):
term: loan.loan_term || loan.duration_months || loan.term_months || 0,
```

**transformLoanFromSupabase() reading (first payment date):**
```javascript
// BEFORE:
firstRepaymentDate: loan.first_payment_date || '',

// AFTER:
// Commented out - column doesn't exist in actual database
```

**Date fields cleaning:**
```javascript
// BEFORE:
const dateFields = ['application_date', 'approval_date', 'disbursement_date', 'first_payment_date'];

// AFTER:
const dateFields = ['application_date', 'approval_date', 'disbursement_date']; // Removed first_payment_date
```

### 2. `/services/supabaseDataService.ts`

**createLoan() insertion (loan term):**
```javascript
// BEFORE:
duration_months: term,

// AFTER:
loan_term: term,
```

**createLoan() insertion (first payment date):**
```javascript
// BEFORE:
first_payment_date: loanData.firstRepaymentDate ? loanData.firstRepaymentDate.split('T')[0] : null,

// AFTER:
// Removed - column doesn't exist in actual database
```

**transformLoansFromSupabase() field mapping (loan term):**
```javascript
// BEFORE:
'loanTerm': 'duration_months',

// AFTER:
'loanTerm': 'loan_term',
```

**transformLoansFromSupabase() field mapping (first payment date):**
```javascript
// BEFORE:
'firstRepaymentDate': 'first_payment_date',

// AFTER:
// Commented out - column doesn't exist in actual database
```

## Testing

To verify the fix works:

1. **Create a new loan:**
   - Go to Loans tab → New Loan
   - Fill in all required fields
   - Submit the loan

2. **Check browser console:**
   - Should see no "Could not find the 'duration_months' column" error
   - Should see "✅ Loan created successfully in Supabase"

3. **Verify in Supabase:**
   - Open Supabase Dashboard → Table Editor → `loans` table
   - Confirm the new loan appears with the correct `loan_term` value

## Files Modified

- `/lib/supabaseService.ts` - Updated field mappings in transformLoanForSupabase() and transformLoanFromSupabase()
- `/services/supabaseDataService.ts` - Updated loan creation and field mapping

## Status

✅ **FIXED** - All loan column name mismatches have been resolved:
- The application now correctly uses `loan_term` instead of `duration_months`
- The application no longer tries to insert `first_payment_date` which doesn't exist in the database
- All mappings now match the actual Supabase database schema

## Note

If you encounter similar column name errors in the future, check:
1. The actual Supabase database schema (via SQL Editor or Table Editor)
2. The transform functions in `/lib/supabaseService.ts`
3. The direct insert/update operations in `/services/supabaseDataService.ts`

Always use the **actual database column name**, not what you think it should be based on older schema files.
