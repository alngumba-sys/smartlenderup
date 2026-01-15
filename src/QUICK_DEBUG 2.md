# 🔍 QUICK DEBUG - Why Bank Accounts Not Showing

##  Please follow these steps:

### **Step 1: Open Browser Console**
Press **F12** or Right-click → Inspect → Console tab

### **Step 2: Refresh the Page**
Press **Ctrl+R** (Windows) or **Cmd+R** (Mac)

### **Step 3: Look for These Messages**

Copy and paste ALL console messages here, especially:

1. Messages starting with `🔄 Loading...`
2. Messages starting with `🏦 BankAccountsSection rendered`
3. Any messages in RED (errors)

**Example of what to look for:**
```
🔄 Loading bank accounts from individual table...
✅ Loaded X bank accounts from individual table

🏦 BankAccountsSection rendered
  Total accounts: X
  Bank type accounts: X
  Active accounts: X
  Bank + Active: X
```

### **Step 4: Run This Command in Console**

Copy this entire block and paste it into the browser console, then press Enter:

```javascript
// Quick bank accounts diagnostic
console.log('\n🔍 QUICK DIAGNOSTIC\n');
console.log('1. Organization:');
const org = JSON.parse(localStorage.getItem('current_organization') || '{}');
console.log('   ID:', org.id);
console.log('   Name:', org.organization_name || org.name);

console.log('\n2. Debug data:');
if (window.__bankAccountsDebug) {
  console.log('   Total accounts:', window.__bankAccountsDebug.allAccounts.length);
  console.log('   Bank type:', window.__bankAccountsDebug.bankType.length);
  console.log('   Active:', window.__bankAccountsDebug.active.length);
  console.log('   Bank + Active (SHOWN IN UI):', window.__bankAccountsDebug.bankAndActive.length);
  
  if (window.__bankAccountsDebug.allAccounts.length > 0) {
    console.log('\n3. First account details:');
    const first = window.__bankAccountsDebug.allAccounts[0];
    console.log('   accountName:', first.accountName);
    console.log('   accountNumber:', first.accountNumber);
    console.log('   bankName:', first.bankName);
    console.log('   accountType:', first.accountType, '← Should be "Bank"');
    console.log('   status:', first.status, '← Should be "Active"');
  }
} else {
  console.log('   ❌ Debug data not available - component not rendered yet');
}
```

### **Step 5: Check Supabase**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor"
4. Click "bank_accounts" table
5. **Take a screenshot** of what you see
6. Share it with me

### **Step 6: Try Creating a New Account**

1. Go to Finance → Accounting → Accounts
2. Click "+ Add Account"
3. Fill in:
   - Account Name: "Test Debug Account"
   - Account Number: "99999"
   - Bank Name: "Test Bank"
   - Branch: "Test"
   - Account Type: **"Bank"** ← IMPORTANT!
4. Click "Create Account"

**Watch the console** - you should see:
```
🏦 Creating bank account with Supabase-first approach...
💾 Inserting bank account to Supabase: {...}
✅ Bank account saved: {...}

🏦 BankAccountsSection rendered
  Total accounts: 1
  Bank type accounts: 1
  Active accounts: 1
  Bank + Active: 1  ← This should be 1!
```

---

## 📋 What I Need From You

Please copy and paste:

1. **All console output from Step 2** (after refresh)
2. **Output from Step 4** (diagnostic command)
3. **Screenshot from Step 5** (Supabase table)
4. **Console output from Step 6** (after creating account)

This will tell me exactly what's wrong! 🔍
