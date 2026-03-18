# Interest Paid Back Fix

## Problem
Interest Paid Back was not matching the spreadsheet value of **KSh 352,200.00** because payment data was not being loaded correctly from the database.

## Root Cause
The `repayments` table in Supabase has these field names:
- `interest_paid`
- `principal_paid`
- `fees_paid`
- `penalties_paid`
- `amount_paid`

However, the mapping in `/contexts/DataContext.tsx` was incorrectly looking for:
- `r.interest_amount` (doesn't exist)
- `r.principal_amount` (doesn't exist)
- `r.penalty_amount` (doesn't exist)

This meant that when payments were loaded from Supabase, the interest and principal portions were being set to `0` instead of the actual values from the database.

## Fix Applied

### 1. Updated DataContext Mapping (`/contexts/DataContext.tsx`)
Changed the repayments mapping to use the correct field names from the database schema:

```typescript
// ✅ BEFORE (INCORRECT)
principal: r.principal_amount || 0,  // field doesn't exist
interest: r.interest_amount || 0,    // field doesn't exist

// ✅ AFTER (CORRECT)
amount: r.amount_paid || r.amount || 0,
principal: r.principal_paid || 0,
principalPaid: r.principal_paid || 0,
principalPortion: r.principal_paid || 0,
interest: r.interest_paid || 0,
interestPaid: r.interest_paid || 0,
interestPortion: r.interest_paid || 0,
fees: r.fees_paid || 0,
feesPaid: r.fees_paid || 0,
penalty: r.penalties_paid || 0,
penaltiesPaid: r.penalties_paid || 0,
```

This ensures that:
1. The correct database fields are read
2. Multiple aliases are provided for backward compatibility
3. Both camelCase and snake_case versions are available

### 2. Created Diagnostic Tool (`/components/diagnostics/InterestPaidBackDiagnostic.tsx`)
A comprehensive diagnostic tool that shows:

- **Summary Cards:**
  - Expected value (KSh 352,200.00 from spreadsheet)
  - System calculated value (from payment records)
  - Collection rate (% of potential interest collected)
  - Interest outstanding

- **Payment Details Table:**
  - All payment records with their interest portions
  - Receipt numbers, loan numbers, client names
  - Principal paid, interest paid, total amount
  - Which database fields were found for each payment

- **By Loan Breakdown:**
  - Potential interest per loan
  - Interest paid per loan
  - Interest outstanding per loan
  - Payment percentage per loan

### 3. Added Diagnostic Button to Dashboard
The Interest Paid Back card now has a bug icon button (appears on hover) that opens the diagnostic tool.

## Database Schema Reference

The `repayments` table schema (from `/supabase/COMPLETE_DATABASE_SETUP.sql`):

```sql
CREATE TABLE IF NOT EXISTS public.repayments (
  id TEXT PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  loan_id TEXT REFERENCES public.loans(id),
  
  -- Payment Details
  receipt_number TEXT UNIQUE NOT NULL,
  payment_date DATE NOT NULL,
  amount_paid DECIMAL(15,2) NOT NULL,
  payment_method TEXT,
  transaction_reference TEXT,
  
  -- Payment Breakdown
  principal_paid DECIMAL(15,2) DEFAULT 0,
  interest_paid DECIMAL(15,2) DEFAULT 0,
  fees_paid DECIMAL(15,2) DEFAULT 0,
  penalties_paid DECIMAL(15,2) DEFAULT 0,
  
  -- Remaining Balance
  remaining_balance DECIMAL(15,2),
  
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Verification Steps

1. **Refresh the application** to load payments with the corrected mapping
2. **Check Dashboard** - The Interest Paid Back value should now match your spreadsheet
3. **Click the bug icon** on the Interest Paid Back card to view the diagnostic
4. **Verify in diagnostic:**
   - System calculated value matches KSh 352,200.00
   - Payment details show correct interest portions
   - All payments have the correct field indicators (green badges)

## Expected Result

After the fix:
- ✅ Interest Paid Back: **KSh 352,200.00** (matches spreadsheet)
- ✅ All payment records correctly show their interest portions
- ✅ Diagnostic tool confirms data integrity

## Files Modified

1. `/contexts/DataContext.tsx` - Fixed repayments mapping
2. `/components/diagnostics/InterestPaidBackDiagnostic.tsx` - New diagnostic tool
3. `/components/tabs/DashboardTab.tsx` - Added diagnostic button and modal

## Additional Notes

- The fix is backward compatible - it checks multiple field name variations
- The diagnostic tool can be used to verify data integrity at any time
- If values still don't match, the diagnostic will show exactly which fields are missing or incorrect
- The spreadsheet column is labeled "INTREST PAID BACK" (note the typo) but this doesn't affect our calculations
