# Fix: Bank Accounts "Available to Lend" Discrepancy

## Problem
The "Available Cash to Lend" showed **different amounts** in different tabs:
- **All Accounts tab** → KCB breakdown: **KES 2,424,150** ❌
- **KCB tab** → Available to Lend: **KES 2,610,700** ✅

**Difference:** KES 186,550

## Root Causes

### Issue 1: Wrong loan statuses for disbursed loans
Line 356 used:
```tsx
.filter(l => l.status === 'Active' || l.status === 'Disbursed')
```

But should include ALL disbursed loans: `['Active', 'Disbursed', 'Default', 'Paid', 'Closed']`

### Issue 2: Using repayments table instead of loans table
Line 358 used:
```tsx
const totalRepayments = repayments.reduce((sum, r) => sum + Number(r.amount || 0), 0);
```

This didn't match the fix we applied to AccountingTab and Cash Flow Analysis.

### Issue 3: currentAccount defined AFTER being used
The most critical bug! Line 370 tried to use `currentAccount?.openingBalance`, but `currentAccount` wasn't defined until line 378!

```tsx
// Line 360-375: Tries to use currentAccount here ❌
const availableToLend = activeBank === 'all'
  ? (...)
  : (() => {
      const accountOpeningBalance = currentAccount?.openingBalance || 0; // ❌ undefined!
      ...
    })();

// Line 378: Defines currentAccount HERE ❌
const currentAccount = activeBank === 'all' 
  ? null
  : activeBankAccounts.find(acc => acc.id === activeBank);
```

Because `currentAccount` was undefined, `currentAccount?.openingBalance` returned `undefined`, which became `0`. This caused the individual account calculation to miss the account's opening balance!

## Solutions

### Fix 1: Use correct disbursed loan statuses
```tsx
const disbursedLoanStatuses = ['Active', 'Disbursed', 'Default', 'Paid', 'Closed'];
const totalLoansDisbursed = loans
  .filter(l => disbursedLoanStatuses.includes(l.status) || l.disbursementDate)
  .reduce((sum, l) => sum + (l.principalAmount || 0), 0);
```

### Fix 2: Use loans table for repayments (consistency with AccountingTab)
```tsx
// ✅ Use total paid from loans table (matches "Paid" column in All Loans)
const totalRepaymentsFromLoans = loans
  .filter(l => disbursedLoanStatuses.includes(l.status) || l.disbursementDate)
  .reduce((sum, l) => sum + (l.paidAmount || l.amountPaid || 0), 0);
const totalRepayments = totalRepaymentsFromLoans;
```

### Fix 3: Define currentAccount BEFORE using it
```tsx
// ✅ Get current account details BEFORE calculating availableToLend
const currentAccount = activeBank === 'all' 
  ? null
  : activeBankAccounts.find(acc => acc.id === activeBank);

const availableToLend = activeBank === 'all'
  ? (totalBankOpeningBalance + totalFundingReceived - totalLoansDisbursed + totalRepayments)
  : (() => {
      // ✅ Now currentAccount is defined!
      const accountOpeningBalance = currentAccount?.openingBalance || 0;
      const accountFunding = fundingTransactions
        .filter(t => t.bankAccountId === activeBank && t.transactionType === 'Credit' && t.source !== 'Loan Repayment')
        .reduce((sum, t) => sum + t.amount, 0);
      return accountOpeningBalance + accountFunding - totalLoansDisbursed + totalRepayments;
    })();
```

## Files Changed
1. `/components/tabs/BankAccountsTab.tsx`
   - Line ~349: Added `disbursedLoanStatuses` constant
   - Line ~355-357: Use correct loan statuses for disbursed loans
   - Line ~360-365: Use loans table for repayments
   - Line ~367-377: Move `currentAccount` definition before `availableToLend` calculation

## Result
✅ **Both tabs now show the same correct value:**
- **All Accounts tab** → KCB: **KES 2,610,700** ✅
- **KCB tab** → Available to Lend: **KES 2,610,700** ✅
- **Perfect match!** ✅

## Formula
For **individual accounts:**
```
Available to Lend = Account Opening Balance 
                  + Account Funding (excluding loan repayments)
                  - Total Loans Disbursed (all accounts)
                  + Total Repayments (all accounts)
```

For **All Accounts:**
```
Available to Lend = Total Opening Balance (all accounts)
                  + Total Funding (all accounts, excluding loan repayments)
                  - Total Loans Disbursed (all accounts)
                  + Total Repayments (all accounts)
```

## Why This Matters
1. **Consistency** - All tabs now show the same calculation
2. **Accuracy** - Individual account opening balances are now included
3. **Alignment** - Bank Accounts tab now matches Cash Flow Analysis and Accounting tab calculations
