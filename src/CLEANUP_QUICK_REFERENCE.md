# 🛠️ Database Cleanup - Quick Reference

## Console Commands

### **1. Run Database Cleanup**
```javascript
// Comprehensive cleanup (database + localStorage)
await window.cleanupDatabase()

// Returns detailed results:
// {
//   success: true,
//   databaseCleanup: { ... },
//   localStorageCleanup: { ... }
// }
```

### **2. Check Cleanup Results**
```javascript
// After cleanup, check the console for:
// ✅ Database cleanup complete: X invalid records removed
// ✅ localStorage cleanup complete: Y invalid items removed
```

### **3. Debug Organizations**
```javascript
// View all organization credentials
window.debugOrgs()
```

### **4. Check Current Data**
```javascript
// Check clients
const clients = JSON.parse(localStorage.getItem('clients') || '[]');
console.log('Total clients:', clients.length);
console.log('Sample client ID:', clients[0]?.id);

// Check loans  
const loans = JSON.parse(localStorage.getItem('loans') || '[]');
console.log('Total loans:', loans.length);
console.log('Sample loan ID:', loans[0]?.id);

// Check loan products
const products = JSON.parse(localStorage.getItem('loanProducts') || '[]');
console.log('Total products:', products.length);
console.log('Sample product ID:', products[0]?.id);
```

### **5. Validate Specific UUIDs**
```javascript
// You can't import in console, but the cleanup will log validations
// Just check the console output after operations
```

---

## What Gets Cleaned Up?

### **Database Tables:**
- ✅ clients
- ✅ loans
- ✅ loan_products
- ✅ payments
- ✅ savings_accounts
- ✅ savings_transactions
- ✅ groups
- ✅ guarantors
- ✅ collateral
- ✅ loan_documents

### **localStorage Keys:**
- ✅ clients
- ✅ loans
- ✅ loanProducts
- ✅ repayments
- ✅ savingsAccounts
- ✅ savingsTransactions
- ✅ groups
- ✅ guarantors
- ✅ collaterals
- ✅ loanDocuments

---

## When to Run Cleanup?

### **Automatic (No Action Needed):**
- ✅ Runs 2 seconds after login
- ✅ Happens in background
- ✅ Doesn't block UI

### **Manual (Use Console):**
- 🔧 After importing bulk data
- 🔧 When seeing database errors
- 🔧 After data migration
- 🔧 For troubleshooting

---

## Reading Cleanup Output

### **Success:**
```
🧹 Starting comprehensive database cleanup...
🧹 Cleaning up invalid records in loans...
✅ All 45 records in loans have valid UUIDs
✅ Database cleanup complete: No invalid records found
```

### **Records Found:**
```
🧹 Cleaning up invalid records in loans...
⚠️ Found 5 records with invalid IDs in loans
✅ Cleaned up 5 invalid records from loans
✅ Database cleanup complete: 5 invalid records removed
```

### **With Errors:**
```
🧹 Cleaning up invalid records in loans...
❌ Error deleting invalid records: [error details]
```

---

## Troubleshooting

### **Issue: Cleanup not running automatically**
**Solution:** Run manually: `await window.cleanupDatabase()`

### **Issue: Still seeing UUID errors**
**Solution:** 
1. Run cleanup: `await window.cleanupDatabase()`
2. Refresh the page
3. Check console for remaining issues

### **Issue: Foreign key errors**
**Solution:**
1. Clean up clients and products first
2. Then clean up loans
3. Finally clean up payments

### **Issue: Data disappeared after cleanup**
**Solution:** Invalid records are removed to maintain integrity. Re-create them through the UI (they'll get proper UUIDs).

---

## Best Practices

1. **Before importing data:** Run cleanup first
2. **After bulk operations:** Run cleanup to validate
3. **Monitor console:** Watch for UUID warnings
4. **Regular maintenance:** Run cleanup weekly in development

---

## Quick Diagnosis

```javascript
// Check if you have UUID issues
const loans = JSON.parse(localStorage.getItem('loans') || '[]');
const invalidLoans = loans.filter(l => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return !uuidPattern.test(l.id);
});
console.log('Invalid loan IDs found:', invalidLoans.length);
console.log('Examples:', invalidLoans.slice(0, 3).map(l => l.id));

// Then fix them
await window.cleanupDatabase();
```

---

**Need Help?** Check `/UUID_FIX_COMPLETE.md` for full documentation.
