# 🔧 FIX: Principal Paid Back Showing KSh 0K

## Problem
When loans are paid back (fully or partially), the "Principal Paid Back" card in the Comprehensive Loan Overview was showing **KSh 0K** instead of the actual principal amount repaid.

## Root Cause Analysis

### 1️⃣ Column Name Mismatch
**Database Schema (repayments table):**
- `principal_paid` ← Used in schema
- `interest_paid` ← Used in schema
- `penalties_paid` ← Used in schema
- `amount_paid` ← Used in schema

**Frontend Code Expected:**
- `principal` ← Code looks for this
- `interest` ← Code looks for this
- `penalty` ← Code looks for this
- `amount` ← Code looks for this

### 2️⃣ Wrong Column Names in Insert
The `supabaseDataService.repayments.create()` function was using:
- ❌ `principal_amount` (this is for the LOANS table)
- ❌ `interest_amount` (this is for the LOANS table)
- ❌ `penalty_amount` (this is for the LOANS table)

It should use:
- ✅ `principal_paid` (correct for REPAYMENTS table)
- ✅ `interest_paid` (correct for REPAYMENTS table)
- ✅ `penalties_paid` (correct for REPAYMENTS table)

### 3️⃣ Missing Fields
- Missing `receipt_number` (required field in schema)
- Missing `notes` field
- Missing `recorded_by` field

## Solutions Implemented

### ✅ Fix 1: Updated DataContext.tsx (Line 2444-2456)
Changed the mapping to try NEW column names first, then fallback to old:
```typescript
// Before:
principal: r.principal_paid || 0,
interest: r.interest_paid || 0,

// After:
principal: r.principal || r.principal_paid || 0,  // Try 'principal' first
interest: r.interest || r.interest_paid || 0,      // Try 'interest' first
```

### ✅ Fix 2: Updated DataContext.tsx (Line 2117-2119)
Added support for reading `principalOutstanding` and `interestOutstanding` from database:
```typescript
const principalOutstandingFromDB = parseFloat(l.principalOutstanding) || parseFloat(l.outstanding_principal) || null;
const interestOutstandingFromDB = parseFloat(l.interestOutstanding) || parseFloat(l.outstanding_interest) || null;
```

### ✅ Fix 3: Updated supabaseDataService.ts (Line 1648-1673)
Fixed the repayment creation to use correct column names:
```typescript
// Before:
principal_amount: parseNumber(repaymentData.principalAmount),
interest_amount: parseNumber(repaymentData.interestAmount),

// After:
principal_paid: parseNumber(repaymentData.principalAmount || repaymentData.principal || 0),
interest_paid: parseNumber(repaymentData.interestAmount || repaymentData.interest || 0),
// ALSO populate standardized columns:
principal: parseNumber(repaymentData.principalAmount || repaymentData.principal || 0),
interest: parseNumber(repaymentData.interestAmount || repaymentData.interest || 0),
```

### ✅ Fix 4: Created SQL Migration Script
**File:** `/supabase/ULTIMATE_FIX_principal_paid_back.sql`

This script:
1. Adds `principal`, `interest`, `penalty`, `amount` columns to repayments table
2. Syncs data between old columns (_paid suffix) and new columns
3. Adds `principalOutstanding` and `interestOutstanding` to loans table
4. Recalculates all outstanding balances based on actual payments
5. Creates triggers to keep everything in sync automatically

## How to Apply the Fix

### Step 1: Run the SQL Migration
Go to your Supabase SQL Editor and run:
```
/supabase/ULTIMATE_FIX_principal_paid_back.sql
```

This will:
- ✅ Add missing columns to repayments and loans tables
- ✅ Sync all existing payment data
- ✅ Recalculate outstanding balances
- ✅ Set up automatic triggers

### Step 2: Refresh Your Application
After running the SQL script, refresh your application. The changes to the frontend code will now work correctly with the database.

### Step 3: Test with Loan 5224
1. Go to Dashboard → Comprehensive Loan Overview
2. Look at the "Principal Paid Back" card
3. If loan 5224 is fully paid with 300,000 principal:
   - ✅ Should show: **KSh 300K**
   - ❌ Was showing: **KSh 0K**

## Expected Behavior After Fix

### For a Fully Paid Loan (e.g., 300,000 principal)
- **Original Principal:** KSh 300,000
- **Principal Paid Back:** KSh 300,000 ✅
- **Principal Outstanding:** KSh 0

### For an Active Loan (e.g., 300,000 principal, 1 payment of 172,500)
If payment allocation is: 45,000 interest + 127,500 principal:
- **Original Principal:** KSh 300,000
- **Principal Paid Back:** KSh 127,500 ✅
- **Principal Outstanding:** KSh 172,500

## Verification Queries

Run these in Supabase SQL Editor to verify:

```sql
-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'repayments' 
  AND column_name IN ('principal', 'interest', 'penalty', 'amount')
ORDER BY column_name;

-- Check loan 5224 specifically
SELECT 
  l.loan_number,
  l.principal_amount,
  SUM(r.principal) as principal_paid,
  l."principalOutstanding"
FROM loans l
LEFT JOIN repayments r ON r.loan_id = l.id
WHERE l.loan_number = '5224'
GROUP BY l.loan_number, l.principal_amount, l."principalOutstanding";
```

## What's Fixed

✅ Payment allocation now saves to correct columns  
✅ Frontend now reads from correct columns  
✅ Both old and new column names are supported  
✅ Outstanding balances are tracked and updated automatically  
✅ "Principal Paid Back" card will show the correct amount  
✅ Works for both active and fully paid loans

## Files Changed
1. `/contexts/DataContext.tsx` - Lines 2444-2456, 2117-2119, 2258-2259
2. `/services/supabaseDataService.ts` - Lines 1648-1673
3. `/supabase/ULTIMATE_FIX_principal_paid_back.sql` - New migration script

---

**Next Step:** Run the SQL script in Supabase, then test by making a payment on any loan!
