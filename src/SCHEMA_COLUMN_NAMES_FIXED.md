# Schema Column Names Fixed - Duration Months & Other Fields

## Problem
The application was trying to insert columns with incorrect names into the `loans` table, causing PGRST204 errors.

## Error Messages
```
❌ Error creating loan: {
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'duration_months' column of 'loans' in the schema cache"
}
```

## Root Cause
The code in `/services/supabaseDataService.ts` was using incorrect column names that don't match the actual database schema in `/supabase/COMPLETE_DATABASE_SETUP.sql`.

### Incorrect vs Correct Column Names

| Incorrect Name (Old) | Correct Name (Database) | Purpose |
|---------------------|------------------------|---------|
| `duration_months` | `loan_term` | Loan duration in months |
| `term_period` | `loan_term` | Loan duration (duplicate) |
| `monthly_installment` | `monthly_repayment` | Monthly payment amount |
| `outstanding_balance` | `total_outstanding` | Total amount outstanding |
| `paid_amount` | `total_paid` | Total amount paid |
| `total_interest` | `interest_amount` | Total interest amount |
| `total_repayable` | `total_amount` | Total amount to repay |
| `creation_date` | ❌ REMOVED | Redundant (use `application_date`) |

## Actual Database Schema (from COMPLETE_DATABASE_SETUP.sql)

```sql
CREATE TABLE IF NOT EXISTS public.loans (
  id TEXT PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  client_id UUID REFERENCES public.clients(id),
  loan_product_id TEXT REFERENCES public.loan_products(id),
  
  -- Loan Details
  loan_number TEXT UNIQUE NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  interest_method TEXT DEFAULT 'flat',
  loan_term INTEGER NOT NULL,  -- ✅ NOT 'duration_months'
  disbursement_date DATE,
  maturity_date DATE,
  
  -- Calculated Amounts
  interest_amount DECIMAL(15,2) NOT NULL,  -- ✅ NOT 'total_interest'
  total_amount DECIMAL(15,2) NOT NULL,     -- ✅ NOT 'total_repayable'
  monthly_repayment DECIMAL(15,2) NOT NULL, -- ✅ NOT 'monthly_installment'
  
  -- Fees
  application_fee DECIMAL(15,2) DEFAULT 0,
  processing_fee DECIMAL(15,2) DEFAULT 0,
  insurance_fee DECIMAL(15,2) DEFAULT 0,
  total_fees DECIMAL(15,2) DEFAULT 0,
  
  -- Purpose
  loan_purpose TEXT,
  
  -- Status & Approval
  status TEXT DEFAULT 'pending',
  approval_status TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Outstanding Balance
  outstanding_principal DECIMAL(15,2),
  outstanding_interest DECIMAL(15,2),
  outstanding_fees DECIMAL(15,2),
  outstanding_penalties DECIMAL(15,2),
  total_outstanding DECIMAL(15,2),  -- ✅ NOT 'outstanding_balance'
  
  -- Payment Tracking
  total_paid DECIMAL(15,2) DEFAULT 0,  -- ✅ NOT 'paid_amount'
  principal_paid DECIMAL(15,2) DEFAULT 0,
  interest_paid DECIMAL(15,2) DEFAULT 0,
  fees_paid DECIMAL(15,2) DEFAULT 0,
  penalties_paid DECIMAL(15,2) DEFAULT 0,
  
  -- Days in Arrears
  days_in_arrears INTEGER DEFAULT 0,
  arrears_amount DECIMAL(15,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);
```

## Solutions Applied

### 1. Fixed Loan Creation Record (Lines 1015-1027)

**BEFORE:**
```typescript
const loanRecord: any = {
  organization_id: organizationId,
  client_id: clientUUID,
  principal_amount: principalAmount,
  interest_rate: interestRate,
  term_period: term,  // ❌ WRONG - doesn't exist
  duration_months: term,  // ❌ WRONG - doesn't exist
  status: loanData.status || 'pending',
  total_amount: totalAmount,
  monthly_installment: monthlyInstallment, // ❌ WRONG
  outstanding_balance: totalAmount, // ❌ WRONG
  paid_amount: 0, // ❌ WRONG
  total_interest: totalInterest, // ❌ WRONG
  total_repayable: totalAmount, // ❌ WRONG
};
```

**AFTER:**
```typescript
const loanRecord: any = {
  organization_id: organizationId,
  client_id: clientUUID,
  principal_amount: principalAmount,
  interest_rate: interestRate,
  loan_term: term,  // ✅ CORRECT
  status: loanData.status || 'pending',
  total_amount: totalAmount,
  monthly_repayment: monthlyInstallment, // ✅ CORRECT
  total_outstanding: totalAmount, // ✅ CORRECT
  total_paid: 0, // ✅ CORRECT
  interest_amount: totalInterest, // ✅ CORRECT
};
```

### 2. Removed Duplicate loan_term Assignment (Line 1058-1059)

**BEFORE:**
```typescript
// Add loan term (alternative field name for duration_months)
loanRecord.loan_term = term;
```

**AFTER:**
```typescript
// ✅ REMOVED - loan_term already set in main object
```

### 3. Fixed Field Mapping (Lines 1266-1273)

**BEFORE:**
```typescript
const fieldMap: Record<string, string> = {
  'principalAmount': 'principal_amount',
  'loanTerm': 'duration_months',  // ❌ WRONG
  'durationMonths': 'duration_months',  // ❌ WRONG
  'totalRepayable': 'total_amount',
  'totalAmount': 'total_amount',
  'outstandingBalance': 'outstanding_balance',  // ❌ WRONG
  'paidAmount': 'paid_amount',  // ❌ WRONG
  'principalPaid': 'paid_amount',  // ❌ WRONG
  // ...
};
```

**AFTER:**
```typescript
const fieldMap: Record<string, string> = {
  'principalAmount': 'principal_amount',
  'loanTerm': 'loan_term',  // ✅ CORRECT
  'durationMonths': 'loan_term',  // ✅ CORRECT
  'totalRepayable': 'total_amount',
  'totalAmount': 'total_amount',
  'outstandingBalance': 'total_outstanding',  // ✅ CORRECT
  'paidAmount': 'total_paid',  // ✅ CORRECT
  'principalPaid': 'principal_paid',  // ✅ CORRECT
  // ...
};
```

### 4. Fixed Repayment Balance Update (Lines 1521-1540)

**BEFORE:**
```typescript
const { data: loan } = await supabase
  .from('loans')
  .select('outstanding_balance, paid_amount')  // ❌ WRONG columns
  .eq('id', loanId)
  .single();

if (loan) {
  const newBalance = (loan.outstanding_balance || 0) - parseNumber(repaymentData.amount);
  const newAmountPaid = (loan.paid_amount || 0) + parseNumber(repaymentData.amount);
  
  await supabase
    .from('loans')
    .update({
      outstanding_balance: newBalance,  // ❌ WRONG
      paid_amount: newAmountPaid,  // ❌ WRONG
      status: newBalance <= 0 ? 'fully_paid' : 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', loanId)
    .eq('organization_id', organizationId);
}
```

**AFTER:**
```typescript
const { data: loan } = await supabase
  .from('loans')
  .select('total_outstanding, total_paid')  // ✅ CORRECT columns
  .eq('id', loanId)
  .single();

if (loan) {
  const newBalance = (loan.total_outstanding || 0) - parseNumber(repaymentData.amount);
  const newAmountPaid = (loan.total_paid || 0) + parseNumber(repaymentData.amount);
  
  await supabase
    .from('loans')
    .update({
      total_outstanding: newBalance,  // ✅ CORRECT
      total_paid: newAmountPaid,  // ✅ CORRECT
      status: newBalance <= 0 ? 'fully_paid' : 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', loanId)
    .eq('organization_id', organizationId);
}
```

## Result
✅ All column names now match the actual database schema
✅ Loan creation should work without PGRST204 errors
✅ Repayment updates will use correct column names
✅ Field mapping correctly translates frontend names to database columns

## Testing Checklist
1. ✅ Create a new loan - should work without `duration_months` error
2. ✅ Create a new loan - should work without `creation_date` error
3. ✅ View loan list - should display correctly
4. ✅ Add a repayment - should update `total_outstanding` and `total_paid`
5. ✅ Update loan details - should map fields correctly

## Files Modified
1. `/services/supabaseDataService.ts` - Fixed all column name references
2. `/SCHEMA_COLUMN_NAMES_FIXED.md` - This documentation

## Note
If you still see PGRST204 errors:
1. Go to Supabase Dashboard → API
2. Click "Refresh schema cache"
3. Wait 30 seconds
4. Try again

The schema cache can sometimes be stale after database changes.
