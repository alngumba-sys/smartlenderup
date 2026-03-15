# Database Schema Synchronization Fixed

## Problem
The application was using field names from `/supabase/COMPLETE_DATABASE_SETUP.sql` but the ACTUAL database is using `/supabase/schema.sql`, which has different column names. This caused PGRST204 "column not found in schema cache" errors.

## Error Messages
```
❌ Error creating loan: {
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'application_fee' column of 'loans' in the schema cache"
}
```

## Root Cause
There are MULTIPLE schema files in the project:
1. `/supabase/schema.sql` - **THE ACTUAL DATABASE SCHEMA** ✅
2. `/supabase/COMPLETE_DATABASE_SETUP.sql` - A different schema (not in use)
3. `/supabase-migration.sql` - Migration script
4. `/supabase-migration-clean.sql` - Another migration
5. `/COMPLETE_DATABASE_RESET.sql` - Reset script

The code was trying to use column names from `COMPLETE_DATABASE_SETUP.sql` but the real database uses `schema.sql`.

## Actual Database Schema (`/supabase/schema.sql`)

### Loans Table Column Reference

```sql
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  organization_id UUID REFERENCES public.organizations(id),
  loan_product_id UUID REFERENCES public.loan_products(id),
  loan_officer_id UUID REFERENCES public.users(id),          -- ✅ EXISTS
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,                           -- ✅ NOT loan_term
  processing_fee DECIMAL(10,2) DEFAULT 0,                     -- ✅ EXISTS (no application_fee)
  insurance_fee DECIMAL(10,2) DEFAULT 0,                      -- ✅ EXISTS
  total_amount DECIMAL(15,2) NOT NULL,
  monthly_installment DECIMAL(15,2) NOT NULL,                 -- ✅ NOT monthly_repayment
  outstanding_balance DECIMAL(15,2) NOT NULL,                 -- ✅ NOT total_outstanding
  paid_amount DECIMAL(15,2) DEFAULT 0,
  purpose TEXT,                                               -- ✅ NOT loan_purpose
  status TEXT DEFAULT 'pending',
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    -- ✅ EXISTS
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_by UUID REFERENCES public.users(id),
  disbursed_at TIMESTAMP WITH TIME ZONE,
  disbursement_method TEXT,                                   -- ✅ EXISTS
  disbursement_reference TEXT,                                -- ✅ EXISTS
  first_payment_date DATE,                                    -- ✅ EXISTS
  maturity_date DATE,                                         -- ✅ EXISTS
  days_in_arrears INTEGER DEFAULT 0,                          -- ✅ EXISTS
  notes TEXT,                                                 -- ✅ EXISTS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Key Differences Between Schemas

| Field | COMPLETE_DATABASE_SETUP.sql | schema.sql (ACTUAL) |
|-------|---------------------------|---------------------|
| Loan term | `loan_term` | `duration_months` ✅ |
| Monthly payment | `monthly_repayment` | `monthly_installment` ✅ |
| Outstanding | `total_outstanding` | `outstanding_balance` ✅ |
| Purpose | `loan_purpose` | `purpose` ✅ |
| Application fee | `application_fee` ❌ | **DOESN'T EXIST** |
| Total fees | `total_fees` ❌ | **DOESN'T EXIST** |
| Loan officer | **DOESN'T EXIST** | `loan_officer_id` ✅ |
| Application date | **DOESN'T EXIST** | `application_date` ✅ |
| First payment | **DOESN'T EXIST** | `first_payment_date` ✅ |
| Notes | **DOESN'T EXIST** | `notes` ✅ |
| Disbursement ref | **DOESN'T EXIST** | `disbursement_reference` ✅ |
| Disbursement method | **DOESN'T EXIST** | `disbursement_method` ✅ |

## All Fixes Applied

### 1. Facilitation Fee Handling

**BEFORE (Wrong):**
```typescript
const facilitationFee = parseNumber(loanData.facilitationFee || 0);
if (facilitationFee > 0) loanRecord.application_fee = facilitationFee; // ❌ Column doesn't exist
```

**AFTER (Fixed):**
```typescript
const facilitationFee = parseNumber(loanData.facilitationFee || 0);
const processingFee = parseNumber(loanData.processingFee || 0);

// Combine facilitation fee with processing fee (no separate application_fee column)
const totalProcessingFee = (facilitationFee || 0) + (processingFee || 0);
if (totalProcessingFee > 0) loanRecord.processing_fee = totalProcessingFee; // ✅ Correct
```

### 2. Purpose Field Name

**BEFORE (Wrong):**
```typescript
loanRecord.loan_purpose = loanData.purpose; // ❌ Wrong column name
```

**AFTER (Fixed):**
```typescript
loanRecord.purpose = loanData.purpose; // ✅ Correct per schema.sql line 188
```

### 3. Loan Officer ID - RESTORED

**BEFORE (Wrong):**
```typescript
// ❌ REMOVED: staff_member_id - doesn't exist
```

**AFTER (Fixed):**
```typescript
// ✅ Add loan officer ID - per schema.sql line 178
if (loanData.staffMemberId || loanData.loanOfficerId) {
  loanRecord.loan_officer_id = loanData.staffMemberId || loanData.loanOfficerId;
}
```

### 4. Application Date - RESTORED

**BEFORE (Wrong):**
```typescript
// ❌ REMOVED: application_date - doesn't exist
```

**AFTER (Fixed):**
```typescript
// ✅ Add application_date - per schema.sql line 190
if (loanData.applicationDate || loanData.application_date) {
  loanRecord.application_date = loanData.applicationDate || loanData.application_date;
}
```

### 5. First Payment Date - RESTORED

**BEFORE (Wrong):**
```typescript
// ❌ REMOVED: first_payment_date - doesn't exist
```

**AFTER (Fixed):**
```typescript
// ✅ Add first_payment_date - per schema.sql line 199
if (loanData.firstPaymentDate || loanData.first_payment_date) {
  loanRecord.first_payment_date = loanData.firstPaymentDate || loanData.first_payment_date;
}
```

### 6. Notes Field - RESTORED

**BEFORE (Wrong):**
```typescript
// ❌ REMOVED: notes - doesn't exist
```

**AFTER (Fixed):**
```typescript
// ✅ Add notes - per schema.sql line 202
if (loanData.notes) loanRecord.notes = loanData.notes;
```

### 7. Disbursement Fields - ADDED

**NEW:**
```typescript
// ✅ Add disbursement method and reference - per schema.sql lines 197-198
if (loanData.disbursementMethod || loanData.disbursement_method) {
  loanRecord.disbursement_method = loanData.disbursementMethod || loanData.disbursement_method;
}
if (loanData.disbursementReference || loanData.disbursement_reference) {
  loanRecord.disbursement_reference = loanData.disbursementReference || loanData.disbursement_reference;
}
```

### 8. Disbursed At Date - ADDED

**NEW:**
```typescript
// ✅ Add disbursed_at - per schema.sql line 196
if (loanData.disbursementDate || loanData.disbursed_at) {
  loanRecord.disbursed_at = loanData.disbursementDate || loanData.disbursed_at;
}
```

### 9. Field Mapping - UPDATED

**REMOVED:**
```typescript
'facilitationFee': 'application_fee',  // ❌ Column doesn't exist
```

All other field mappings remain correct as they match schema.sql.

### 10. Safety Filter - UPDATED

**BEFORE (Wrong):**
```typescript
const columnsToRemove = [
  'disbursement_reference',  // ❌ This DOES exist!
  'days_in_arrears',         // ❌ This DOES exist!
  'loan_officer_id',         // ❌ This DOES exist!
  // ...
];
```

**AFTER (Fixed):**
```typescript
const columnsToRemove = [
  // Only remove camelCase variants (snake_case is set above)
  'durationMonths',
  'monthlyInstallment',
  'firstPaymentDate',
  'maturityDate',
  'applicationDate',
  'facilitationFee',
  'staffMemberId',
  'loanOfficerId',
  'disbursementReference',
  // ... etc
];
```

## Complete Field Summary

### ✅ Fields That EXIST in schema.sql
- `loan_officer_id` 
- `application_date`
- `first_payment_date`
- `maturity_date`
- `notes`
- `disbursement_method`
- `disbursement_reference`
- `disbursed_at`
- `days_in_arrears`
- `processing_fee` (for facilitation + processing combined)
- `insurance_fee`
- `purpose` (not loan_purpose)
- `duration_months` (not loan_term)
- `monthly_installment` (not monthly_repayment)
- `outstanding_balance` (not total_outstanding)

### ❌ Fields That DON'T EXIST in schema.sql
- `application_fee` - use `processing_fee` instead
- `total_fees` - not needed (only 2 fee types)
- `loan_purpose` - should be `purpose`
- `loan_term` - should be `duration_months`
- `monthly_repayment` - should be `monthly_installment`
- `total_outstanding` - should be `outstanding_balance`
- `staff_member_id` - should be `loan_officer_id`
- `disbursement_date` - should be `disbursed_at`
- `collateral_type` - separate table
- `collateral_value` - separate table

## Testing Checklist

1. ✅ Create loan with facilitation fee - stores in `processing_fee`
2. ✅ Create loan with loan officer - stores in `loan_officer_id`
3. ✅ Create loan with application date - stores correctly
4. ✅ Create loan with first payment date - stores correctly
5. ✅ Create loan with notes - stores correctly
6. ✅ Create loan with disbursement info - stores correctly
7. ✅ No more PGRST204 errors

## Files Modified

1. `/services/supabaseDataService.ts` - Fixed all field assignments to match schema.sql

## Result

✅ All field assignments now match `/supabase/schema.sql` (the ACTUAL database)
✅ Facilitation fee combined with processing fee
✅ All existing fields properly restored
✅ No more PGRST204 schema cache errors
