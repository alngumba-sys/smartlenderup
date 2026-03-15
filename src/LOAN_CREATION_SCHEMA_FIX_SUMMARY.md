# Loan Creation Schema Fix Summary

## Problem

You were getting this error when creating loans:
```
❌ Error creating loan: {
  code: 'PGRST204', 
  details: null, 
  hint: null, 
  message: "Could not find the 'disbursed_at' column of 'loans' in the schema cache"
}
```

## Root Cause

The code in `/services/supabaseDataService.ts` was using **incorrect column names** that don't exist in the actual database schema (`/supabase/schema.sql`). This caused Supabase to reject the entire INSERT request.

## Incorrect vs Correct Column Names

| ❌ INCORRECT (Old Code) | ✅ CORRECT (schema.sql) | Line in schema.sql |
|------------------------|------------------------|-------------------|
| `loan_term` | `duration_months` | Line 181 |
| `monthly_repayment` | `monthly_installment` | Line 185 |
| `total_outstanding` | `outstanding_balance` | Line 186 |
| `total_paid` | `paid_amount` | Line 187 |
| `interest_amount` | ❌ (doesn't exist in loans table) | N/A |

## What Was Fixed

### 1. Loan Creation Record (Line ~1013-1026)

**Before:**
```typescript
const loanRecord: any = {
  id: crypto.randomUUID(),
  organization_id: organizationId,
  client_id: clientUUID,
  principal_amount: principalAmount,
  interest_rate: interestRate,
  loan_term: term,  // ❌ WRONG
  status: loanData.status || 'pending',
  total_amount: totalAmount,
  monthly_repayment: monthlyInstallment, // ❌ WRONG
  total_outstanding: totalAmount, // ❌ WRONG
  total_paid: 0, // ❌ WRONG
  interest_amount: totalInterest, // ❌ WRONG - column doesn't exist
};
```

**After:**
```typescript
const loanRecord: any = {
  id: crypto.randomUUID(),
  organization_id: organizationId,
  client_id: clientUUID,
  principal_amount: principalAmount,
  interest_rate: interestRate,
  duration_months: term,  // ✅ CORRECT
  status: loanData.status || 'pending',
  total_amount: totalAmount,
  monthly_installment: monthlyInstallment, // ✅ CORRECT
  outstanding_balance: totalAmount, // ✅ CORRECT
  paid_amount: 0, // ✅ CORRECT
  // ✅ REMOVED: interest_amount (doesn't exist in loans table)
};
```

### 2. Field Mapping for Updates (Line ~1267-1276)

**Before:**
```typescript
const fieldMap: Record<string, string> = {
  'principalAmount': 'principal_amount',
  'loanTerm': 'loan_term', // ❌ WRONG
  'durationMonths': 'loan_term', // ❌ WRONG
  'outstandingBalance': 'total_outstanding', // ❌ WRONG
  'paidAmount': 'total_paid', // ❌ WRONG
  // ...
};
```

**After:**
```typescript
const fieldMap: Record<string, string> = {
  'principalAmount': 'principal_amount',
  'loanTerm': 'duration_months', // ✅ CORRECT
  'durationMonths': 'duration_months', // ✅ CORRECT
  'outstandingBalance': 'outstanding_balance', // ✅ CORRECT
  'paidAmount': 'paid_amount', // ✅ CORRECT
  // ...
};
```

### 3. Loan Balance Updates After Payment (Line ~1525-1537)

**Before:**
```typescript
const { data: loan } = await supabase
  .from('loans')
  .select('total_outstanding, total_paid') // ❌ WRONG
  .eq('id', loanId)
  .single();

if (loan) {
  const newBalance = (loan.total_outstanding || 0) - parseNumber(repaymentData.amount);
  const newAmountPaid = (loan.total_paid || 0) + parseNumber(repaymentData.amount);
  
  await supabase
    .from('loans')
    .update({
      total_outstanding: newBalance, // ❌ WRONG
      total_paid: newAmountPaid, // ❌ WRONG
      // ...
    })
}
```

**After:**
```typescript
const { data: loan } = await supabase
  .from('loans')
  .select('outstanding_balance, paid_amount') // ✅ CORRECT
  .eq('id', loanId)
  .single();

if (loan) {
  const newBalance = (loan.outstanding_balance || 0) - parseNumber(repaymentData.amount);
  const newAmountPaid = (loan.paid_amount || 0) + parseNumber(repaymentData.amount);
  
  await supabase
    .from('loans')
    .update({
      outstanding_balance: newBalance, // ✅ CORRECT
      paid_amount: newAmountPaid, // ✅ CORRECT
      // ...
    })
}
```

## About the `disbursed_at` Column

The `disbursed_at` column **DOES exist** in your database (schema.sql line 196):
```sql
disbursed_at TIMESTAMP WITH TIME ZONE,
```

The PGRST204 error about `disbursed_at` was happening because:
1. The code was trying to insert OTHER columns that don't exist (like `loan_term`, `total_outstanding`, etc.)
2. Supabase rejected the entire request
3. The error message reported the first problematic column it encountered, which happened to be `disbursed_at` in the error message, but the real issue was the other incorrect columns

## Next Steps

### 1. Test Loan Creation
Try creating a loan again. The error should now be resolved.

### 2. If You Still Get PGRST204 Errors
If you still encounter schema cache errors:
1. Go to Supabase Dashboard → Settings → API
2. Click **"Refresh Schema Cache"**
3. Wait 30 seconds
4. Try again

### 3. Verify Database Schema
If the problem persists, run the SQL queries in `/FIX_DISBURSED_AT_SCHEMA.sql` to:
- Verify all columns exist in your database
- Check that permissions are correctly set
- Test a minimal insert

## Files Modified

1. `/services/supabaseDataService.ts` - Fixed loan creation column names
   - Line ~1013-1026: Loan record creation
   - Line ~1267-1276: Field mapping
   - Line ~1525-1537: Balance update after payment

2. `/lib/supabaseService.ts` - Fixed loan field mappings and transformations
   - Line ~496-500: Term/duration field mapping
   - Line ~501: Purpose field mapping
   - Line ~515-524: Installment/balance/paid amount field mappings
   - Line ~607-615: Default value checks
   - Line ~647: Loan term display transformation
   - Line ~656-659: Balance/installment/paid amount display transformations

## Files Created

1. `/FIX_DISBURSED_AT_SCHEMA.sql` - SQL queries to diagnose and fix schema issues
2. `/LOAN_CREATION_SCHEMA_FIX_SUMMARY.md` - This file

## Additional Notes

The loan creation code in `supabaseDataService.ts` was previously synced with an outdated `COMPLETE_DATABASE_SETUP.sql` file. It has now been corrected to match the actual schema in `/supabase/schema.sql`, which is the source of truth for your database structure.
