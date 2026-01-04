# Schema Mismatch Fix: approvedDate Column Error

## Issue
❌ Error: `Could not find the 'approvedDate' column of 'loans' in the schema cache`

The frontend was sending `approvedDate` (camelCase) but the database expects `approval_date` (snake_case).

## Root Cause
The `supabaseDataService.loans.update()` function in `/services/supabaseDataService.ts` was passing updates directly to Supabase without transforming field names from camelCase to snake_case.

## Database Schema (COMPLETE_DATABASE_RESET.sql)
```sql
CREATE TABLE loans (
  ...
  approval_date TIMESTAMP WITH TIME ZONE,  -- ✅ Correct column name
  approved_by UUID REFERENCES users(id),
  ...
);
```

## Frontend Code
The frontend uses camelCase field names:
```typescript
updateLoan(loanId, {
  status: 'Approved',
  approvedDate: new Date().toISOString().split('T')[0]  // ❌ Wrong: needs to be approval_date
});
```

## Fix Applied

### ✅ Updated `/services/supabaseDataService.ts` Line 854-900
Added field name transformation in the `loanService.update()` function:

```typescript
async update(loanId: string, updates: any, organizationId: string) {
  // ✅ Transform field names from camelCase to snake_case
  const fieldMap: Record<string, string> = {
    'approvedDate': 'approval_date',      // ✅ Main fix
    'approvedBy': 'approved_by',
    'disbursementDate': 'disbursement_date',
    'disbursedDate': 'disbursement_date',
    'disbursedBy': 'disbursed_by',
    'applicationDate': 'application_date',
    'firstRepaymentDate': 'expected_repayment_date',
    'principalAmount': 'amount',
    'loanTerm': 'term_period',
    'totalRepayable': 'total_amount',
    'outstandingBalance': 'balance',
    'paidAmount': 'amount_paid',
    'interestRate': 'interest_rate',
    'productId': 'product_id',
    'clientId': 'client_id'
  };
  
  // Transform updates to match database schema
  const transformedUpdates: any = {};
  Object.keys(updates).forEach(key => {
    const mappedKey = fieldMap[key] || key;
    transformedUpdates[mappedKey] = updates[key];
  });
  
  // Rest of the update logic...
}
```

## Other Services Status

### ✅ `/lib/supabaseService.ts` - Already Correct
The `updateLoan()` function already uses `transformLoanForSupabase()` which has the proper field mappings:
```typescript
const fieldMap: Record<string, string> = {
  'approvedDate': 'approval_date',  // ✅ Already mapped correctly
  'approval_date': 'approval_date',
  ...
};
```

### ✅ No Issues in Other Tables
- **Repayments**: No `update()` function exists
- **Expenses**: No `update()` function exists  
- **Loan Products**: No `approvedDate` field used
- **Clients**: No `approvedDate` field used

## Complete Field Mapping for Loans

| Frontend (camelCase) | Database (snake_case) | Type |
|---------------------|----------------------|------|
| `approvedDate` | `approval_date` | TIMESTAMP |
| `approvedBy` | `approved_by` | UUID |
| `disbursementDate` | `disbursement_date` | TIMESTAMP |
| `applicationDate` | `application_date` | TIMESTAMP |
| `firstRepaymentDate` | `expected_repayment_date` | DATE |
| `principalAmount` | `amount` | DECIMAL |
| `loanTerm` | `term_period` | INTEGER |
| `totalRepayable` | `total_amount` | DECIMAL |
| `outstandingBalance` | `balance` | DECIMAL |
| `paidAmount` | `amount_paid` | DECIMAL |
| `interestRate` | `interest_rate` | DECIMAL |
| `productId` | `product_id` | UUID |
| `clientId` | `client_id` | UUID |

## Testing
After this fix, the loan approval workflow should work correctly:
```typescript
// This should now work without errors
updateLoan(loanId, {
  status: 'Approved',
  approvedDate: new Date().toISOString().split('T')[0]
});
```

## Related Fixes
- [SCHEMA_ERRORS_FIXED.md](./SCHEMA_ERRORS_FIXED.md) - Previous schema mismatch fixes
- [SUPABASE_SYNC_VERIFICATION.md](./SUPABASE_SYNC_VERIFICATION.md) - Complete field mapping reference
