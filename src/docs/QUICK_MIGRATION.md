# Quick Migration Script - Copy & Paste Into Browser Console

Open your browser console (F12 or Right-click → Inspect → Console) and paste this complete script:

```javascript
// ═══════════════════════════════════════════════════════════════
// 🚀 COMPLETE MIGRATION SCRIPT - Change dates to Oct 1, 2025
// ═══════════════════════════════════════════════════════════════

(async function runMigration() {
  console.log('🚀 Starting complete migration...');
  
  try {
    // Step 1: Get organization ID
    const orgData = localStorage.getItem('current_organization');
    if (!orgData) {
      console.error('❌ Organization not found. Please log in first.');
      return;
    }
    const org = JSON.parse(orgData);
    const orgId = org.id;
    console.log('✅ Organization ID:', orgId);
    
    // Step 2: Get KCB bank account ID
    const bankAccountsKey = `bank_accounts_${orgId}`;
    const bankAccountsData = localStorage.getItem(bankAccountsKey);
    if (!bankAccountsData) {
      console.error('❌ No bank accounts found');
      return;
    }
    const bankAccounts = JSON.parse(bankAccountsData);
    const kcbAccount = bankAccounts.find(acc => 
      acc.bankName?.toUpperCase().includes('KCB') || 
      acc.name?.toUpperCase().includes('KCB')
    );
    
    if (!kcbAccount) {
      console.error('❌ KCB account not found');
      return;
    }
    console.log('✅ Found KCB account:', kcbAccount.accountNumber);
    
    // Step 3: Update KCB transaction dates to October 1, 2025
    console.log('🔄 Updating KCB transaction dates...');
    const result1 = await window.devMigration.updateKCBTransactionDates({
      organizationId: orgId,
      newDate: '2025-10-01T00:00:00'
    });
    console.log('✅ KCB dates updated:', result1);
    
    // Step 4: Link all repayments to KCB bank account
    console.log('🔄 Linking repayments to bank account...');
    const result2 = await window.devMigration.linkRepaymentsToBank({
      organizationId: orgId,
      bankAccountId: kcbAccount.id
    });
    console.log('✅ Repayments linked:', result2);
    
    // Step 5: Done!
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('✅ MIGRATION COMPLETE!');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('Refreshing page in 3 seconds...');
    
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('');
    console.log('Please check:');
    console.log('1. Are you logged in?');
    console.log('2. Do you have a KCB bank account?');
    console.log('3. Are you connected to the internet?');
  }
})();
```

## What this script does:

1. ✅ **Gets your organization ID** automatically
2. ✅ **Finds your KCB bank account** automatically  
3. ✅ **Changes all KCB transaction dates** to October 1, 2025 (keeps original times)
4. ✅ **Links all loan repayments** to the KCB bank account
5. ✅ **Refreshes the page** automatically after 3 seconds

## After the script runs:

You should see:
- All KCB transactions dated October 1, 2025
- Loan disbursements showing in the bank statement (as debits)
- Loan repayments showing in the bank statement (as credits)
- Transactions sorted with newest on top

## If you don't see loan transactions:

Check the browser console for these messages:
```
🔍 Found X loan disbursements for bank statement
🔍 Found X loan repayments for bank statement
```

If these numbers are 0, it means:
- **Loan disbursements**: No loans have been disbursed yet (check Loans tab)
- **Loan repayments**: No payments have been approved yet (check Payments tab)

## Troubleshooting:

**Error: "window.devMigration is not defined"**
- Refresh the page and wait 5 seconds, then try again
- The migration tools need to load first

**Error: "KCB account not found"**
- Make sure you have a bank account with "KCB" in the name
- Check the Bank Accounts tab

**Transactions still showing old dates:**
- Make sure the script completed successfully
- Check for any error messages in the console
- Try refreshing the page manually (F5)
