# Fix Summary: Loan 4869 Outstanding Balance Issue

## Problem
Loan #4869 (George Munyau Kawaya) showed:
- ❌ Outstanding Balance: **KSh 34,400** (incorrect)
- ❌ Total Amt Payable: **KSh 95,000** (incorrect)

But the database had:
- ✅ `total_amount`: 60,600 (correct - after 34,400 discount)
- ✅ `amount_paid`: 60,600 (correct)
- ✅ `balance`: 0 (correct)

## Root Causes

### Issue 1: DataContext recalculating total_amount
The frontend was **ignoring** the database `total_amount` field and **recalculating** it from the formula:
```
totalRepayable = principalAmount + (principalAmount × interestRate × termPeriod)
totalRepayable = 50,000 + (50,000 × 30% × 3)
totalRepayable = 50,000 + 45,000 = 95,000 ❌
```

This ignored the **34,400 discount** that was applied in the database.

### Issue 2: Modal recalculating outstanding balance
The `ComprehensiveLoanDetailsModal` was **recalculating** outstanding balance:
```tsx
const outstandingBalance = totalRepayable - totalPaid;
// 95,000 - 60,600 = 34,400 ❌
```

Instead of using the `loan.outstandingBalance` value that was already correctly read from the database.

## Solutions

### Fix 1: DataContext.tsx - Read total_amount from database
Changed the code to **read `total_amount` from the database first**, then fall back to calculation if missing:

**Before (Line 1829 & 2542):**
```tsx
const calculatedInterest = principalAmount * (interestRate / 100) * termPeriod;
const totalRepayable = principalAmount + calculatedInterest; // ❌ Always calculates
```

**After:**
```tsx
const totalAmountFromDB = parseFloat(l.total_amount) || 0;
const calculatedInterest = principalAmount * (interestRate / 100) * termPeriod;

// ✅ Use DB value first (handles discounts), calculate only if missing
const totalRepayable = totalAmountFromDB > 0 
  ? totalAmountFromDB 
  : (principalAmount + calculatedInterest);
```

### Fix 2: DataContext.tsx - Derive totalInterest from totalRepayable
**Before (Line 1944 & 2638):**
```tsx
totalInterest: calculatedInterest, // ❌ From formula, ignores discounts
```

**After:**
```tsx
totalInterest: totalRepayable - principalAmount, // ✅ Derived from actual total_amount
```

### Fix 3: ComprehensiveLoanDetailsModal.tsx - Use loan.outstandingBalance
**Before (Line 184):**
```tsx
const outstandingBalance = totalRepayable - totalPaid; // ❌ Recalculates
```

**After:**
```tsx
// ✅ Use outstanding balance from loan data (already has DB balance)
const outstandingBalance = loan.outstandingBalance !== undefined 
  ? loan.outstandingBalance 
  : Math.max(0, totalRepayable - totalPaid);
```

## Files Changed
1. `/contexts/DataContext.tsx` 
   - Lines ~1816-1830: Read `total_amount` from DB
   - Line ~1944: Derive `totalInterest` from `totalRepayable`
   - Lines ~2532-2544: Read `total_amount` from DB (refresh function)
   - Line ~2638: Derive `totalInterest` from `totalRepayable` (refresh function)

2. `/components/modals/ComprehensiveLoanDetailsModal.tsx`
   - Lines ~182-184: Use `loan.outstandingBalance` instead of recalculating

## Result
After **refreshing the page**, loan #4869 will correctly show:
- ✅ Outstanding Balance: **KSh 0**
- ✅ Total Amt Payable: **KSh 60,600**
- ✅ Total Interest: **KSh 10,600** (60,600 - 50,000)
- ✅ Paid: **KSh 60,600**

## Why This Matters
This fix ensures that **all discounted loans** display correctly:
- Early settlement discounts
- Promotional discounts  
- Manual adjustments to `total_amount` in the database

The frontend now **trusts the database** as the source of truth instead of recalculating and overriding stored values.

## Testing
To verify the fix works:
1. **Refresh the page** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. Open loan #4869 details
3. Verify all amounts match the database values shown in the SQL query result
