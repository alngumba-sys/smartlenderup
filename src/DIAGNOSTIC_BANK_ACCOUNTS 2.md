# 🔍 DIAGNOSTIC: Why Bank Accounts Not Showing

## Step-by-Step Diagnostic

### **Step 1: Open Browser Console**

1. Press **F12** (or Ctrl+Shift+I on Windows, Cmd+Option+I on Mac)
2. Click the **"Console"** tab
3. Refresh the page (**Ctrl+R** or **Cmd+R**)

### **Step 2: Look for These Messages**

**You should see:**
```
🔄 Loading entire project state from Supabase...
✅ Setting state from Single-Object Sync
🔄 Loading loan products from individual table...
✅ Loaded X loan products from individual table
🔄 Loading bank accounts from individual table...  ← LOOK FOR THIS!
```

**Then ONE of these:**
```
✅ Loaded X bank accounts from individual table  ← If accounts exist
```
**OR**
```
ℹ️ No bank accounts found in individual table  ← If no accounts
```

### **Step 3: What Do You See?**

#### **Option A: You see "🔄 Loading bank accounts..." followed by "ℹ️ No bank accounts found"**

**This means:** The code is working, but there are NO bank accounts in your Supabase database.

**Solution:** Create a new bank account (see Step 5 below)

---

#### **Option B: You see "❌ Error loading bank accounts from Supabase"**

**This means:** There's a database connection error.

**Check:**
1. Is your internet working?
2. Go to Supabase Dashboard - can you see your tables?
3. Copy the FULL error message from the console

---

#### **Option C: You DON'T see "🔄 Loading bank accounts..." at all**

**This means:** The loading code didn't run.

**Possible causes:**
- Old cached version of the app
- Browser cache issue

**Solution:**
1. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache:** In browser console, right-click the refresh button → "Empty Cache and Hard Reload"
3. Try again

---

#### **Option D: You see "✅ Loaded 1 bank accounts" but UI shows "0"**

**This means:** Data is loading but not displaying.

**Solution:** There's a UI component issue - let me know and I'll fix it.

---

### **Step 4: Check Supabase Database**

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **"Table Editor"** (left sidebar)
4. Click **"bank_accounts"** table
5. **What do you see?**

**Expected:**
- If you see rows → Copy the data and paste here
- If you see "No rows" → The table is empty (proceed to Step 5)

---

### **Step 5: Create a Test Bank Account**

Let's create one together and watch the console:

1. **Keep console open (F12)**
2. Go to **Finance → Accounting → Accounts** tab
3. Click **"+ Add Account"** (green button, top right)
4. Fill in:
   ```
   Account Name: Test Bank Account
   Account Number: 999999
   Bank Name: Test Bank
   Branch: Test Branch
   Account Type: Bank
   Opening Balance: 1000
   ```
5. Click **"Create Account"**

**Watch console - you should see:**
```
🏦 Creating bank account with Supabase-first approach...
📋 Bank account data: {accountName: "Test Bank Account", ...}
💾 Inserting bank account to Supabase: {account_name: "Test Bank Account", ...}
✅ Bank account saved: {id: "...", account_name: "Test Bank Account", ...}
✅ Bank account added to React state
```

**If you see an ERROR instead:**
- Copy the FULL error message
- Paste it here so I can fix it

---

### **Step 6: Verify in Supabase**

After creating the account:

1. Go to Supabase → Table Editor → bank_accounts
2. Refresh the table view
3. **Do you see the new account?**
   - **YES** → Great! Now refresh your app and check if it loads
   - **NO** → There's a database write error - check console error

---

### **Step 7: Refresh App and Check**

1. Press **Ctrl+R** (or **Cmd+R**)
2. **Watch console** - you should see:
   ```
   🔄 Loading bank accounts from individual table...
   ✅ Loaded 1 bank accounts from individual table
   ```
3. Go to **Finance → Accounting → Accounts**
4. **Do you see "1 Bank Account" now?**

---

## 🆘 Quick Diagnostic Command

**Run this in your browser console:**

```javascript
// Check if bank accounts are in React state
console.log('Bank Accounts in State:', window.__dataContext?.bankAccounts);

// Check organization ID
const orgData = localStorage.getItem('current_organization');
const org = JSON.parse(orgData);
console.log('Organization ID:', org.id);

// Try to fetch from Supabase directly
const { supabase } = await import('./lib/supabase');
const { data, error } = await supabase
  .from('bank_accounts')
  .select('*')
  .eq('organization_id', org.id);

console.log('Direct Supabase Query Results:', data);
console.log('Errors:', error);
console.log('Count:', data?.length || 0);
```

**Paste the results here!**

---

## 📋 Information I Need From You

Please provide:

1. **Console output after page refresh** (copy all the "🔄 Loading..." messages)
2. **Screenshot of Supabase bank_accounts table** (Table Editor view)
3. **Any error messages** you see in red
4. **Your organization ID** (from localStorage: `current_organization`)

This will help me pinpoint exactly what's wrong!

---

## 🔧 Common Fixes

### **Fix 1: Hard Refresh**
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### **Fix 2: Clear Browser Cache**
1. F12 → Console
2. Right-click refresh button
3. "Empty Cache and Hard Reload"

### **Fix 3: Check Organization ID**
```javascript
// Run in console
const org = JSON.parse(localStorage.getItem('current_organization'));
console.log('Org ID:', org.id);
```

---

## ✅ Expected Behavior

**After everything is working:**

1. **Console on refresh:**
   ```
   🔄 Loading bank accounts from individual table...
   ✅ Loaded 1 bank accounts from individual table
   ```

2. **UI should show:**
   - Bank Accounts: 1 (not 0)
   - Account name visible in the list

3. **Supabase should show:**
   - 1 row in bank_accounts table
   - account_name: "Test Bank Account"

---

**Please run through these steps and let me know what you find!** 🔍
