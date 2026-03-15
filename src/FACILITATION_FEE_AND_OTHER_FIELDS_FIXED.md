# Facilitation Fee and Other Non-Existent Fields Fixed

## Problem
The application was trying to insert columns that don't exist in the `loans` table, causing PGRST204 errors.

## Error Message
```
❌ Error creating loan: {
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'facilitation_fee' column of 'loans' in the schema cache"
}
```

## Root Cause
Several fields were being assigned to loan records that don't exist in the actual database schema.

## Fields Fixed

### 1. Facilitation Fee → Application Fee
**BEFORE:**
```typescript
const facilitationFee = parseNumber(loanData.facilitationFee || loanData.facilitation_fee || 0);
if (facilitationFee > 0) loanRecord.facilitation_fee = facilitationFee; // ❌ Column doesn't exist
```

**AFTER:**
```typescript
const facilitationFee = parseNumber(loanData.facilitationFee || loanData.facilitation_fee || 0);
if (facilitationFee > 0) loanRecord.application_fee = facilitationFee; // ✅ Correct column
```

### 2. Total Fees Calculation Added
**NEW:**
```typescript
// Calculate and set total_fees
const totalFees = (facilitationFee || 0) + (processingFee || 0) + (insuranceFee || 0);
if (totalFees > 0) loanRecord.total_fees = totalFees;
```

### 3. Staff Member ID Removed
**BEFORE:**
```typescript
if (loanData.staffMemberId || loanData.staff_member_id) {
  loanRecord.staff_member_id = loanData.staffMemberId || loanData.staff_member_id; // ❌ Doesn't exist
}
```

**AFTER:**
```typescript
// ❌ REMOVED: staff_member_id - doesn't exist in loans table
```

### 4. Collateral Fields Removed
**BEFORE:**
```typescript
if (loanData.collateralType || loanData.collateral_type) {
  loanRecord.collateral_type = loanData.collateralType || loanData.collateral_type; // ❌ Wrong table
}
if (loanData.collateralValue || loanData.collateral_value) {
  loanRecord.collateral_value = parseNumber(loanData.collateralValue || loanData.collateral_value); // ❌ Wrong table
}
```

**AFTER:**
```typescript
// ❌ REMOVED: collateral_type and collateral_value - stored in separate 'collaterals' table
```

### 5. Loan Purpose Fixed
**BEFORE:**
```typescript
if (loanData.purpose || loanData.loanPurpose) {
  loanRecord.purpose = loanData.purpose || loanData.loanPurpose || 'General'; // ❌ Wrong column name
}
```

**AFTER:**
```typescript
if (loanData.purpose || loanData.loanPurpose) {
  loanRecord.loan_purpose = loanData.purpose || loanData.loanPurpose || 'General'; // ✅ Correct
}
```

### 6. Application Date Removed
**BEFORE:**
```typescript
loanRecord.application_date = loanData.applicationDate || loanData.application_date || new Date().toISOString(); // ❌ Doesn't exist
```

**AFTER:**
```typescript
// ❌ REMOVED: application_date - doesn't exist in loans table (use created_at instead)
```

### 7. First Payment Date Removed
**BEFORE:**
```typescript
if (loanData.firstPaymentDate || loanData.first_payment_date || loanData.firstRepaymentDate) {
  loanRecord.first_payment_date = loanData.firstPaymentDate || loanData.first_payment_date || loanData.firstRepaymentDate; // ❌ Doesn't exist
}
```

**AFTER:**
```typescript
// ❌ REMOVED: first_payment_date - doesn't exist in loans table
```

### 8. Notes Removed
**BEFORE:**
```typescript
if (loanData.notes) loanRecord.notes = loanData.notes; // ❌ Doesn't exist in loans table
```

**AFTER:**
```typescript
// ❌ REMOVED: notes - doesn't exist in loans table
```

### 9. Disbursement Date Added
**NEW:**
```typescript
if (loanData.disbursementDate || loanData.disbursement_date) {
  loanRecord.disbursement_date = loanData.disbursementDate || loanData.disbursement_date;
}
```

### 10. Field Mapping Updated
**ADDED:**
```typescript
const fieldMap: Record<string, string> = {
  // ... existing mappings
  'facilitationFee': 'application_fee',  // ✅ Facilitation fee is stored as application_fee
  // ...
};
```

## Complete List of Fees in Loans Table

According to `/supabase/COMPLETE_DATABASE_SETUP.sql`:

```sql
-- Fees
application_fee DECIMAL(15,2) DEFAULT 0,     -- ✅ Used for facilitation fee
processing_fee DECIMAL(15,2) DEFAULT 0,      -- ✅ Exists
insurance_fee DECIMAL(15,2) DEFAULT 0,       -- ✅ Exists
total_fees DECIMAL(15,2) DEFAULT 0,          -- ✅ Calculated sum of all fees
```

## Complete List of Date Fields in Loans Table

```sql
disbursement_date DATE,           -- ✅ Exists
maturity_date DATE,               -- ✅ Exists
approved_at TIMESTAMP,            -- ✅ Exists
created_at TIMESTAMP,             -- ✅ Exists (auto-generated)
updated_at TIMESTAMP,             -- ✅ Exists (auto-generated)
```

**NOT IN LOANS TABLE:**
- ❌ `application_date` - use `created_at` instead
- ❌ `first_payment_date` - should be calculated or stored elsewhere

## Where Removed Fields Should Be Stored

### Collateral Information
Stored in separate `collaterals` table:
```sql
CREATE TABLE IF NOT EXISTS public.collaterals (
  id UUID PRIMARY KEY,
  organization_id UUID,
  loan_id TEXT REFERENCES public.loans(id),
  collateral_type TEXT,
  description TEXT NOT NULL,
  estimated_value DECIMAL(15,2) NOT NULL,
  -- ...
);
```

### Staff/Officer Information
Could be stored in:
- `created_by` field in loans table (UUID of user who created the loan)
- Or a separate loan_officers/staff table if needed

### Notes
Could be stored in:
- A separate `loan_notes` or `comments` table
- Or added to the loans table in a future schema update

## Files Modified

1. `/services/supabaseDataService.ts`:
   - Changed `facilitation_fee` → `application_fee`
   - Removed `staff_member_id` assignment
   - Removed `collateral_type` and `collateral_value` assignments
   - Fixed `purpose` → `loan_purpose`
   - Removed `application_date` assignment
   - Removed `first_payment_date` assignment
   - Removed `notes` assignment
   - Added `disbursement_date` assignment
   - Added `total_fees` calculation
   - Added `facilitationFee` → `application_fee` field mapping

## Testing Checklist

1. ✅ Create a new loan with facilitation fee - should store in `application_fee`
2. ✅ Create a new loan - should NOT error on `facilitation_fee`
3. ✅ Create a new loan - should calculate and store `total_fees`
4. ✅ Create a new loan with disbursement date - should store correctly
5. ✅ Create a new loan with maturity date - should store correctly
6. ✅ View loan list - should display all data correctly

## Result

✅ All non-existent columns removed from loan creation
✅ Facilitation fee correctly mapped to application_fee
✅ Total fees automatically calculated
✅ Loan creation should work without any PGRST204 errors
