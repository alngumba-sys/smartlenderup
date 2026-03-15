# ⚡ Quick Fix: approvedDate Column Error

## 🔴 The Error
```
Error: "Could not find the 'approvedDate' column of 'loans' in the schema cache"
Code: PGRST204
```

## ✅ What This Means
The code was trying to send `approvedDate` (camelCase) directly to the database, but your database uses `approved_at` (snake_case). The field mapping was missing.

## 🔧 The Fix (Already Applied)

### Code Updated
I've updated `/services/supabaseDataService.ts` to properly map date and approval/disbursement fields:

**Added to fieldMap:**
```javascript
// ✅ Date fields
'applicationDate': 'application_date',
'approvedDate': 'approved_at',        // ✅ This was the missing mapping!
'disbursementDate': 'disbursed_at',
'disbursedDate': 'disbursed_at',
'firstPaymentDate': 'first_payment_date',
'maturityDate': 'maturity_date',

// ✅ Staff/Officer fields
'loanOfficerId': 'loan_officer_id',
'staffMemberId': 'loan_officer_id',

// ✅ Approval/Disbursement fields  
'approvedBy': 'approved_by',
'disbursedBy': 'disbursed_by',
'disbursementMethod': 'disbursement_method',
'disbursementReference': 'disbursement_reference'
```

**Removed from excludeFields:**
These fields are now properly mapped and sent to the database instead of being excluded.

### SQL Migration Updated
Updated `/FIX_LOAN_CREATION_SCHEMA.sql` to add these columns if missing:
- `approved_at` (TIMESTAMP)
- `approved_by` (TEXT)
- `disbursed_at` (TIMESTAMP)
- `disbursed_by` (TEXT)
- `disbursement_method` (TEXT)
- `disbursement_reference` (TEXT)

## 🚀 What to Do Now

### Option 1: Just Retry (Recommended)
The code is already fixed. Just:

1. **Refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. Try **approving the loan** again
3. Submit

**Expected:** ✅ Loan approved successfully and `approved_at` field updated!

### Option 2: If Database Columns Are Missing
If you still get the error, the database columns might not exist. Run the SQL migration:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run `/FIX_LOAN_CREATION_SCHEMA.sql`
3. **Refresh schema cache** (API → Refresh schema cache)
4. Try approving the loan again

## 📋 What Works Now

The loan approval/disbursement workflow now properly updates:

### When Approving a Loan:
```javascript
{
  status: 'Approved',
  approvedDate: '2026-03-12'  // ✅ Now maps to approved_at
}
```

**Database receives:**
```sql
UPDATE loans SET
  status = 'Approved',
  approved_at = '2026-03-12',  -- ✅ Correctly mapped!
  updated_at = NOW()
WHERE id = '...'
```

### When Disbursing a Loan:
```javascript
{
  status: 'Active',
  disbursementDate: '2026-03-12',
  disbursementMethod: 'mpesa',
  disbursementReference: 'ABC123',
  disbursedBy: 'Admin User'
}
```

**Database receives:**
```sql
UPDATE loans SET
  status = 'Active',
  disbursed_at = '2026-03-12',           -- ✅ Mapped from disbursementDate
  disbursement_method = 'mpesa',         -- ✅ Mapped correctly
  disbursement_reference = 'ABC123',     -- ✅ Mapped correctly
  disbursed_by = 'Admin User',           -- ✅ Mapped correctly
  updated_at = NOW()
WHERE id = '...'
```

## 🔍 How This Happened

The issue was in `/services/supabaseDataService.ts` around line 1125:

**BEFORE (Broken):**
```javascript
// ⚠️ REMOVED mappings for columns that don't exist:
// - loanOfficerId, staffMemberId, applicationDate, approvedDate, approvedBy
// - disbursementDate, disbursedDate, disbursedBy, firstPaymentDate
```

These fields were commented out and excluded, so they weren't being sent to the database.

**AFTER (Fixed):**
```javascript
// ✅ Date fields (re-added - these DO exist in database)
'approvedDate': 'approved_at',
'disbursementDate': 'disbursed_at',
// ... etc
```

Now they're properly mapped and sent to the database!

## ✅ Status
**Fixed!** The code now properly maps approval and disbursement fields to their snake_case database column names.

---

**Created:** March 12, 2026  
**Issue:** PGRST204 - approvedDate column not found  
**Resolution:** Added field mapping for all date/approval/disbursement fields  
**Files Modified:** 
- `/services/supabaseDataService.ts` - Added field mappings, removed from excludeFields
- `/FIX_LOAN_CREATION_SCHEMA.sql` - Added SQL to create missing columns
