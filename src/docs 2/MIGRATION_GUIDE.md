# Data Migration Guide

This guide explains how to update transaction dates and link repayments to bank accounts using the developer migration tools.

## Prerequisites

1. Open your browser's Developer Console (F12 or Right-click → Inspect → Console)
2. Get your Organization ID from localStorage by running:
   ```javascript
   JSON.parse(localStorage.getItem('current_organization')).id
   ```

## Step-by-Step Instructions

### Part A: Update KCB Transaction Dates to October 1, 2025

This will update:
- Opening balance transaction date
- All funding transaction dates
- Keep the original times unchanged

**Run in Console:**
```javascript
await window.devMigration.updateKCBTransactionDates({
  organizationId: 'YOUR_ORG_ID_HERE',  // Replace with actual org ID
  newDate: '2025-10-01T00:00:00'
});
```

**Expected Output:**
```
🔄 Starting KCB transaction date update to 2025-10-01...
✅ Found KCB account: 1234567
✅ Updated bank account created_at and opening_date
✅ Found 2 funding transactions
✅ Updated transaction xxx to 2025-10-01T21:16:00
✅ Updated transaction yyy to 2025-10-01T21:17:00
✅ Successfully updated all KCB transaction dates!
```

### Part B: Link Loan Repayments to Bank Account

First, get your bank account ID:
```javascript
// Find your KCB account ID
const orgData = JSON.parse(localStorage.getItem('current_organization'));
const kcbAccount = JSON.parse(localStorage.getItem(`bank_accounts_${orgData.id}`)).find(acc => acc.bankName?.includes('KCB'));
console.log('KCB Account ID:', kcbAccount.id);
```

Then link all repayments:
```javascript
await window.devMigration.linkRepaymentsToBank({
  organizationId: 'YOUR_ORG_ID_HERE',  // Replace with actual org ID
  bankAccountId: 'YOUR_KCB_ACCOUNT_ID_HERE'  // Replace with KCB account ID from above
});
```

**Expected Output:**
```
🔄 Linking loan repayments to bank account...
✅ Found 5 repayments to update
✅ Updated repayment REC-001 to use bank account
✅ Updated repayment REC-002 to use bank account
...
✅ Successfully linked all repayments to bank account!
```

### Part C: Update Loan Disbursement Dates (Optional)

If you want to update loan disbursement dates to a specific date:

```javascript
// Get loan IDs
const orgData = JSON.parse(localStorage.getItem('current_organization'));
const loans = JSON.parse(localStorage.getItem(`loans_${orgData.id}`));
console.log('Loans:', loans.map(l => ({ id: l.id, loanId: l.loanId, borrowerName: l.borrowerName })));

// Update specific loans or all loans
await window.devMigration.updateLoanDisbursementDates({
  organizationId: 'YOUR_ORG_ID_HERE',
  targetDate: '2025-10-15',  // Optional: set all to this date
  loanIds: ['loan-id-1', 'loan-id-2']  // Optional: only update these loans
});
```

## Part D: Verify Changes

After running the migrations:

1. **Refresh the page** to reload data from Supabase
2. **Go to Bank Accounts tab** → Select KCB account
3. **Check the statement** - you should see:
   - Opening balance dated October 1, 2025
   - Funding transactions dated October 1, 2025
   - Loan disbursements (if any)
   - Loan repayments (credits) showing up in the statement

## Part E: Chart of Accounts & Trial Balance

The Chart of Accounts and Trial Balance automatically update based on journal entries. After linking repayments to the bank account:

1. Navigate to **Accounting** → **Chart of Accounts**
2. Check the **Bank Account** balance
3. Navigate to **Accounting** → **Trial Balance**
4. Verify the **Debit** and **Credit** balances match

Journal entries are automatically created when:
- Bank accounts are opened (Opening Balance)
- Funding transactions occur (Credit to Bank)
- Loans are disbursed (Debit from Bank)
- Loan repayments are received (Credit to Bank)

## Troubleshooting

### Error: "KCB account not found"
- Make sure you have a bank account with "KCB" in the bank name
- Check the bank account status is "Active"

### Error: "Organization not found"
- Verify you're logged in
- Check your organization ID is correct

### Transactions not showing
- **Refresh the page** (F5) after running migrations
- Check Supabase connection status in the top right
- Verify you're online

### Repayments still not in statement
- Make sure repayments have `status: 'Approved'`
- Verify the `bankAccountId` field is set correctly
- Check the payment method is "Bank Transfer"

## Complete Example

Here's a complete example to run all migrations:

```javascript
// Step 1: Get your organization ID
const orgId = JSON.parse(localStorage.getItem('current_organization')).id;
console.log('Organization ID:', orgId);

// Step 2: Update KCB transaction dates
const result1 = await window.devMigration.updateKCBTransactionDates({
  organizationId: orgId,
  newDate: '2025-10-01T00:00:00'
});
console.log('KCB dates updated:', result1);

// Step 3: Get KCB account ID
const bankAccounts = JSON.parse(localStorage.getItem(`bank_accounts_${orgId}`));
const kcbAccount = bankAccounts.find(acc => acc.bankName?.includes('KCB'));
console.log('KCB Account ID:', kcbAccount.id);

// Step 4: Link repayments to bank
const result2 = await window.devMigration.linkRepaymentsToBank({
  organizationId: orgId,
  bankAccountId: kcbAccount.id
});
console.log('Repayments linked:', result2);

// Step 5: Refresh the page
console.log('✅ All migrations complete! Refreshing page...');
setTimeout(() => window.location.reload(), 2000);
```

## Safety Notes

⚠️ **IMPORTANT:**
- These migrations directly update Supabase database
- Make sure you have a backup before running
- Test on a development/staging environment first
- Double-check organization IDs and account IDs before running

✅ **After Migration:**
- Refresh the page to see changes
- Verify all transactions appear correctly
- Check the bank statement balances
- Review the Chart of Accounts

---

**Need Help?**
If you encounter any issues, check the browser console for detailed error messages.
