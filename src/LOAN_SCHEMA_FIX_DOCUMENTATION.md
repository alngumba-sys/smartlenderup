# Loan Creation Schema Fix - Complete Documentation

## Problem Summary

The loan creation system was failing with error `PGRST204: Could not find the 'amount' column of 'loans' in the schema cache` because the code was trying to use incorrect column names that didn't match the actual Supabase database schema.

## Root Cause

There were **TWO conflicting schema definitions** in the codebase:

1. **`/supabase-migration.sql`** (lines 104-128): Uses `amount`, `term_months`, `total_payable`, `monthly_payment`, `balance`
2. **`/supabase/schema.sql`** (lines 172-205): Uses `principal_amount`, `duration_months`, `total_amount`, `monthly_installment`, `outstanding_balance`

The actual deployed Supabase database uses the schema from `/supabase/schema.sql`, but the code in `/services/supabaseDataService.ts` was using column names from the old `/supabase-migration.sql` schema.

## Actual Database Schema (from /supabase/schema.sql)

```sql
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  organization_id UUID REFERENCES public.organizations(id),
  loan_product_id UUID REFERENCES public.loan_products(id),
  loan_officer_id UUID REFERENCES public.users(id),
  
  -- Financial columns (CORRECT NAMES)
  principal_amount DECIMAL(15,2) NOT NULL,        -- NOT 'amount'
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,                -- NOT 'term_months'
  processing_fee DECIMAL(10,2) DEFAULT 0,
  insurance_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,             -- NOT 'total_payable'
  monthly_installment DECIMAL(15,2) NOT NULL,      -- NOT 'monthly_payment'
  outstanding_balance DECIMAL(15,2) NOT NULL,      -- NOT 'balance'
  paid_amount DECIMAL(15,2) DEFAULT 0,             -- NOT 'principal_paid'
  
  -- Metadata columns
  purpose TEXT,
  status TEXT DEFAULT 'pending',
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_by UUID REFERENCES public.users(id),
  disbursed_at TIMESTAMP WITH TIME ZONE,
  disbursement_method TEXT,
  disbursement_reference TEXT,
  first_payment_date DATE,
  maturity_date DATE,
  days_in_arrears INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Fixes Applied

### 1. Fixed Loan Creation in `/services/supabaseDataService.ts` (lines 836-861)

**BEFORE (Incorrect):**
```typescript
const loanRecord: any = {
  id: crypto.randomUUID(),
  organization_id: organizationId,
  client_id: clientUUID,
  loan_product_id: productUUID,
  amount: principalAmount,              // ❌ WRONG - column doesn't exist
  interest_rate: interestRate,
  term_months: term,                     // ❌ WRONG - column doesn't exist
  purpose: loanData.purpose || 'General',
  status: loanData.status || 'pending',
  application_date: ...,
  total_payable: totalAmount,            // ❌ WRONG - column doesn't exist
  monthly_payment: monthlyInstallment,   // ❌ WRONG - column doesn't exist
  balance: totalAmount,                  // ❌ WRONG - column doesn't exist
  principal_paid: 0,
  interest_paid: 0,
  payment_method: loanData.disbursementMethod || 'cash',
  guarantor_required: loanData.guarantorRequired || false,
  collateral_required: loanData.collateralRequired || false
};
```

**AFTER (Correct):**
```typescript
const loanRecord: any = {
  id: crypto.randomUUID(),
  ...(loanNumber && { loan_number: loanNumber }),
  organization_id: organizationId,
  client_id: clientUUID,
  loan_product_id: productUUID,
  principal_amount: principalAmount,        // ✅ CORRECT
  interest_rate: interestRate,
  duration_months: term,                    // ✅ CORRECT
  purpose: loanData.purpose || 'General',
  status: loanData.status || 'pending',
  application_date: ...,
  total_amount: totalAmount,                // ✅ CORRECT
  monthly_installment: monthlyInstallment,  // ✅ CORRECT
  outstanding_balance: totalAmount,         // ✅ CORRECT
  paid_amount: 0,                           // ✅ CORRECT
  processing_fee: parseNumber(loanData.processingFee || 0),
  insurance_fee: parseNumber(loanData.insuranceFee || 0),
  disbursement_method: loanData.disbursementMethod || null,
  disbursement_reference: loanData.disbursementReference || null,
  first_payment_date: loanData.firstPaymentDate || null,
  maturity_date: loanData.maturityDate || null,
  days_in_arrears: 0,
  notes: loanData.notes || null
};
```

### 2. Fixed Loan Update Field Mappings (lines 1016-1037)

**BEFORE (Incorrect):**
```typescript
const fieldMap: Record<string, string> = {
  'principalAmount': 'principal_amount',
  'loanTerm': 'loan_term',                    // ❌ WRONG
  'totalRepayable': 'total_amount',
  'outstandingBalance': 'total_outstanding',  // ❌ WRONG
  'paidAmount': 'total_paid',                 // ❌ WRONG
  'paymentMethod': 'disbursement_method'
};
```

**AFTER (Correct):**
```typescript
const fieldMap: Record<string, string> = {
  'principalAmount': 'principal_amount',
  'loanTerm': 'duration_months',              // ✅ CORRECT
  'durationMonths': 'duration_months',
  'totalRepayable': 'total_amount',
  'totalAmount': 'total_amount',
  'outstandingBalance': 'outstanding_balance', // ✅ CORRECT
  'paidAmount': 'paid_amount',                 // ✅ CORRECT
  'approvedDate': 'approved_at',
  'disbursementDate': 'disbursed_at',
  'processingFee': 'processing_fee',
  'insuranceFee': 'insurance_fee',
  'monthlyInstallment': 'monthly_installment',
  'maturityDate': 'maturity_date',
  'disbursementReference': 'disbursement_reference'
};
```

### 3. Fixed SQL Test Script `/FIX_LOAN_CREATION_SCHEMA.sql`

Changed from testing with non-existent `amount` column to testing with actual `principal_amount` column:

**BEFORE:**
```sql
SELECT 
  'Testing amount column:' as test,
  COUNT(*) as total_loans,
  SUM(amount) as total_amount,           -- ❌ Column doesn't exist
  AVG(amount) as average_amount
FROM loans;
```

**AFTER:**
```sql
SELECT 
  'Testing principal_amount column:' as test,
  COUNT(*) as total_loans,
  COALESCE(SUM(principal_amount), 0) as total_principal_amount,  -- ✅ Correct
  COALESCE(AVG(principal_amount), 0) as average_principal_amount
FROM loans;
```

## Column Mapping Reference

| Frontend Field (camelCase) | Database Column (snake_case) | Type |
|---------------------------|------------------------------|------|
| `principalAmount` | `principal_amount` | DECIMAL(15,2) |
| `interestRate` | `interest_rate` | DECIMAL(5,2) |
| `loanTerm` / `durationMonths` | `duration_months` | INTEGER |
| `processingFee` | `processing_fee` | DECIMAL(10,2) |
| `insuranceFee` | `insurance_fee` | DECIMAL(10,2) |
| `totalAmount` / `totalRepayable` | `total_amount` | DECIMAL(15,2) |
| `monthlyInstallment` | `monthly_installment` | DECIMAL(15,2) |
| `outstandingBalance` | `outstanding_balance` | DECIMAL(15,2) |
| `paidAmount` | `paid_amount` | DECIMAL(15,2) |
| `applicationDate` | `application_date` | TIMESTAMP |
| `approvedDate` | `approved_at` | TIMESTAMP |
| `approvedBy` | `approved_by` | UUID |
| `disbursementDate` / `disbursedDate` | `disbursed_at` | TIMESTAMP |
| `disbursedBy` | `disbursed_by` | UUID |
| `disbursementMethod` / `paymentMethod` | `disbursement_method` | TEXT |
| `disbursementReference` | `disbursement_reference` | TEXT |
| `firstPaymentDate` | `first_payment_date` | DATE |
| `maturityDate` | `maturity_date` | DATE |
| `daysInArrears` | `days_in_arrears` | INTEGER |
| `loanOfficerId` | `loan_officer_id` | UUID |

## Testing Instructions

### 1. Test Loan Creation

```typescript
// In the UI, create a new loan with these details:
{
  clientId: "existing-client-id",
  productId: "existing-product-id",
  principalAmount: 100000,
  interestRate: 7.5,
  loanTerm: 12,
  purpose: "Business expansion",
  processingFee: 1000,
  insuranceFee: 500
}
```

Expected result: Loan should be created successfully without PGRST204 errors.

### 2. Test Loan Update

```typescript
// Update an existing loan
await loanService.update(loanId, {
  status: 'approved',
  approvedDate: new Date().toISOString(),
  approvedBy: userId
}, organizationId);
```

Expected result: Loan should update successfully.

### 3. Verify in Supabase

Run this SQL in Supabase SQL Editor:

```sql
-- Check recent loan
SELECT 
  loan_number,
  principal_amount,
  duration_months,
  total_amount,
  monthly_installment,
  outstanding_balance,
  paid_amount,
  status
FROM loans
ORDER BY created_at DESC
LIMIT 1;
```

## Related Files Modified

1. `/services/supabaseDataService.ts` - Fixed loan creation and update functions
2. `/FIX_LOAN_CREATION_SCHEMA.sql` - Fixed SQL test script
3. `/LOAN_SCHEMA_FIX_DOCUMENTATION.md` - This documentation (NEW)

## Error Prevention

To prevent similar issues in the future:

1. **Always reference `/supabase/schema.sql`** as the source of truth for database column names
2. **Do NOT use `/supabase-migration.sql`** - it contains outdated schema definitions
3. When adding new fields, update the `fieldMap` in the `update()` function
4. Use TypeScript interfaces to enforce type safety (consider adding a proper Loan interface)
5. Add database column validation in development mode

## Status: ✅ RESOLVED

- [x] Fixed loan creation to use correct column names
- [x] Fixed loan update field mappings
- [x] Fixed SQL test script
- [x] Added comprehensive documentation
- [x] Verified schema matches actual Supabase database

## Additional Notes

The `loanNumber` is still being generated despite some schemas not having it. The code handles this gracefully with a try-catch block and optional chaining (`...(loanNumber && { loan_number: loanNumber })`).

If you encounter any `PGRST204` errors in the future, check:
1. Column names in the error message
2. Compare with `/supabase/schema.sql`
3. Update the field mapping accordingly
4. Refresh Supabase schema cache (Dashboard → API → Refresh Schema Cache)
