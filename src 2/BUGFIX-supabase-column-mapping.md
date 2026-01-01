# Fixed Supabase Column Mapping and Foreign Key Errors

## Issues Resolved

### 1. Processing Fee Records Error
**Error:** `Could not find the 'amount' column of 'processing_fee_records' in the schema cache`

**Root Cause:** 
- Application interface uses `amount` field
- Supabase table uses `fee_amount` column
- No transform function existed to map between them

**Fix:**
Created `transformProcessingFeeRecordForSupabase()` function that maps:
- `amount` → `fee_amount`
- `recordedDate` → `collected_date`
- `paymentMethod` → `payment_method`
- Filters out fields not in Supabase schema: `clientId`, `clientName`, `percentage`, `loanAmount`, `recordedBy`, `status`, `waivedBy`, `waivedReason`

### 2. Approvals Error (Null loan_id)
**Error:** `null value in column "loan_id" of relation "approvals" violates not-null constraint`

**Root Cause:**
- Application interface uses `relatedId` field to store the loan ID
- Transform function was filtering out `relatedId` completely
- Resulted in `loan_id` being null in Supabase

**Fix:**
Updated `transformApprovalForSupabase()` function:
- Maps `relatedId` → `loan_id` (stores the loan ID reference)
- Maps `requestDate` → `created_at` (stores request date as creation timestamp)
- Added missing mappings: `approver` → `approver_name`, `approverRole` → `approver_role`
- Added default values: `approver_role` defaults to 'Loan Officer' if not provided
- Filters out additional fields: `type`, `title`, `requestedBy`, `rejectionReason`

### 3. Foreign Key Constraint Error
**Error:** `insert or update on table "processing_fee_records" violates foreign key constraint "processing_fee_records_loan_id_fkey"`

**Root Cause:**
- Sync operations were happening in wrong order
- Processing fee and approval were synced BEFORE the loan
- When Supabase tried to insert them, the referenced loan didn't exist yet

**Fix:**
Reordered sync operations in `addLoan()` function in DataContext:
1. **First:** Sync loan to Supabase (creates the parent record)
2. **Second:** Sync processing fee record (now loan exists for foreign key)
3. **Third:** Sync approval record (now loan exists for foreign key)

## Field Mapping Summary

### Processing Fee Records
```
Application (DataContext) → Supabase (Database)
----------------------------------------
id                        → id
loanId                    → loan_id
amount                    → fee_amount ✓ (FIXED)
recordedDate              → collected_date
paymentMethod             → payment_method
createdAt                 → created_at
updatedAt                 → updated_at

[Filtered Out - Not in DB]
clientId, clientName, percentage, loanAmount, 
recordedBy, status, waivedBy, waivedReason
```

### Approvals
```
Application (DataContext) → Supabase (Database)
----------------------------------------
id                        → id
relatedId                 → loan_id ✓ (FIXED - was being filtered out)
loanId                    → loan_id
stage                     → stage
approver                  → approver_name
approverRole              → approver_role
decision                  → decision
comments                  → comments
approvalDate              → decision_date
requestDate               → created_at ✓ (FIXED)
createdAt                 → created_at
updatedAt                 → updated_at
status                    → status

[Filtered Out - Not in DB]
amount, clientName, productName, submittedBy,
submittedDate, clientId, description, phase,
priority, type, title, requestedBy, rejectionReason
```

## Sync Order (CRITICAL)

**Before (WRONG):**
1. Processing fee record → ❌ Loan doesn't exist yet
2. Loan
3. Approval → ❌ Loan doesn't exist yet

**After (CORRECT):**
1. Loan → ✓ Creates parent record
2. Processing fee record → ✓ Foreign key satisfied
3. Approval → ✓ Foreign key satisfied

## Testing

To verify the fixes work:

1. **Test Processing Fee Records:**
   - Create a new loan with processing fees
   - Check browser console - should see no errors
   - Verify record appears in Supabase `processing_fee_records` table with correct `loan_id`

2. **Test Approvals:**
   - Create a new loan application (goes through approval workflow)
   - Check browser console - should see no errors
   - Verify approval appears in Supabase `approvals` table with correct `loan_id`

3. **Verify Foreign Keys:**
   - In Supabase, check that `processing_fee_records.loan_id` matches `loans.id`
   - Check that `approvals.loan_id` matches `loans.id`

## Files Modified

- `/lib/supabaseService.ts`
  - Added `transformProcessingFeeRecordForSupabase()` function
  - Updated `transformApprovalForSupabase()` function (added relatedId mapping)
  - Updated `createProcessingFeeRecord()` to use transform function

- `/contexts/DataContext.tsx`
  - **CRITICAL:** Made `addLoan()` function async
  - **CRITICAL:** Added `await` to all sync operations to ensure sequential execution
  - Reordered sync operations: loan → processing fee → approval
  - Ensured loan is synced and COMPLETES before processing fee and approval start

- `/components/tabs/LoansTab.tsx`
  - Made `handleNewLoan()` async
  - Added `await` when calling `addLoan()`

- `/components/client-tabs/ClientApplyTab.tsx`
  - Made `handleSubmit()` async
  - Added `await` when calling `addLoan()`

## Key Fix: Async/Await Pattern

The most critical fix was making the sync operations **sequential** instead of parallel:

**Before (WRONG - all fire simultaneously):**
```javascript
syncToSupabase('create', 'loan', newLoan);           // Starts
syncToSupabase('create', 'processing_fee_record', ...); // Starts immediately
syncToSupabase('create', 'approval', ...);          // Starts immediately
// ❌ All three operations run in parallel - foreign keys fail!
```

**After (CORRECT - sequential with await):**
```javascript
await syncToSupabase('create', 'loan', newLoan);           // Completes
await syncToSupabase('create', 'processing_fee_record', ...); // Then starts & completes
await syncToSupabase('create', 'approval', ...);          // Then starts & completes
// ✅ Each operation waits for the previous to complete - foreign keys satisfied!
```

## Status

✅ **All Fixed** - All three errors should now be completely resolved:
- Column mapping errors fixed with proper transform functions
- Foreign key errors fixed with **async/await pattern** ensuring sequential execution
- Sync order ensures parent record (loan) exists before child records (fee, approval)
- Data integrity maintained with proper field mappings
