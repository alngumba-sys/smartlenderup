# 🚨 SUPABASE CONNECTION ERROR - Troubleshooting Guide

## Error You're Seeing

```
ERR_CONNECTION_CLOSED
TypeError: Failed to fetch
netERR_BLOCKED_BY_CLIENT
```

**Error Message in UI:**
```
Database not reachable.
Check your internet connection
Cannot add bank account without database connection
```

---

## 🔍 Root Cause Analysis

The error `ERR_CONNECTION_CLOSED` when trying to connect to:
```
https://yrsnylrcgejnrxphjvtf.supabase.co/rest/v1/organizations
```

This means **one of the following**:

### 1. ✅ **Most Likely: Supabase Project is PAUSED** (90% chance)
Supabase automatically pauses projects after **1 week of inactivity** on the free tier.

### 2. Supabase Project Was Deleted
If you deleted the project, the URL no longer works.

### 3. Network/Firewall Issue
Something is blocking the request (browser extension, corporate firewall, etc.)

### 4. Invalid Credentials
The API keys in `/lib/supabase.ts` are incorrect.

---

## 🔧 Solution: Step-by-Step Fix

### **Step 1: Check if Project is Paused**

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Sign in** with your account

3. **Look for your project:** `yrsnylrcgejnrxphjvtf`

4. **Check the status:**
   - ✅ **Active** → Green dot, project is running
   - ⏸️ **Paused** → Yellow/gray, shows "Restore project" button
   - ❌ **Deleted** → Project doesn't appear in list

---

### **Step 2: Restore Paused Project**

If the project shows as **PAUSED**:

1. **Click the project** (even if paused)
2. **Click the "Restore Project" button**
3. **Wait 30-60 seconds** for Supabase to wake up
4. **Refresh your SmartLenderUp app**
5. **Try adding a bank account again**

✅ **This should fix the issue!**

---

### **Step 3: If Project Was Deleted**

If the project `yrsnylrcgejnrxphjvtf` doesn't exist:

#### Option A: Create New Supabase Project

1. **Go to:** https://supabase.com/dashboard
2. **Click:** "New Project"
3. **Fill in:**
   - Name: `SmartLenderUp`
   - Database Password: (save this!)
   - Region: Choose closest to Kenya (e.g., Singapore or Frankfurt)
4. **Wait 2-3 minutes** for project creation

5. **Get your new credentials:**
   - Go to Settings → API
   - Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy **anon/public key**
   - Copy **service_role key**

6. **Update `/lib/supabase.ts`:**
   ```typescript
   const supabaseUrl = 'YOUR_NEW_PROJECT_URL';
   const supabaseAnonKey = 'YOUR_NEW_ANON_KEY';
   const supabaseServiceKey = 'YOUR_NEW_SERVICE_ROLE_KEY';
   ```

7. **Run the database setup:**
   - Open the SQL Editor in Supabase dashboard
   - Run the schema creation script (ask for the SQL file)

#### Option B: Use Existing Project

If you have another Supabase project you want to use:

1. Get the credentials from that project
2. Update `/lib/supabase.ts` with new URL and keys
3. Ensure the database schema exists (tables: organizations, clients, loans, etc.)

---

### **Step 4: Network Troubleshooting**

If the project is **Active** but still getting connection errors:

1. **Disable browser extensions** (especially ad blockers)
   - uBlock Origin
   - Privacy Badger
   - Any VPN extensions

2. **Try incognito/private mode**

3. **Check browser console** for CORS errors

4. **Test Supabase directly:**
   - Open browser console
   - Run this test:
   ```javascript
   fetch('https://yrsnylrcgejnrxphjvtf.supabase.co/rest/v1/', {
     headers: {
       'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255bHJjZ2VqbnJ4cGhqdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTAxNDIsImV4cCI6MjA4MjU4NjE0Mn0.RCcfK0ObcSCnwqW_bD7c4M7DSN_SCTPT6QK7LXi4R9o'
     }
   })
   .then(r => console.log('✅ Connected!', r))
   .catch(e => console.error('❌ Failed:', e))
   ```

5. **Check internet connection:**
   - Test other websites
   - Check if you can access https://supabase.com

---

## 🎯 Quick Fix Checklist

- [ ] Go to https://supabase.com/dashboard
- [ ] Find project `yrsnylrcgejnrxphjvtf`
- [ ] Check if it says "Paused"
- [ ] Click "Restore Project"
- [ ] Wait 30-60 seconds
- [ ] Refresh SmartLenderUp app
- [ ] Try adding bank account again

---

## 📊 After Fixing - What You Should See

### ✅ **Success Indicators:**

**Browser Console:**
```
✅ Using Supabase SERVICE ROLE key
🔓 RLS is BYPASSED for development
✅ Supabase connection successful!
```

**When Adding Bank Account:**
```
🏦 Creating bank account with Supabase-first approach...
📋 Bank account data: {...}
✅ Bank account created in Supabase: {id: "uuid-here", ...}
✅ Bank account added to React state
```

**In Supabase Dashboard:**
- Go to Table Editor
- Click `bank_accounts` table
- You should see your newly created bank account

---

## 🔍 Still Having Issues?

### Check These Files:

1. **`/lib/supabase.ts`** - Credentials correct?
2. **Supabase Dashboard → Settings → API** - Keys match?
3. **Supabase Dashboard → Project Settings** - Project status?

### Common Mistakes:

❌ **Wrong URL format:**
```typescript
// WRONG
const supabaseUrl = 'yrsnylrcgejnrxphjvtf.supabase.co';

// CORRECT
const supabaseUrl = 'https://yrsnylrcgejnrxphjvtf.supabase.co';
```

❌ **Wrong key (using anon key for both):**
```typescript
// WRONG - same key twice
const supabaseAnonKey = 'eyJhbG...';
const supabaseServiceKey = 'eyJhbG...'; // Same key!

// CORRECT - different keys
const supabaseAnonKey = 'eyJhbG...abc';
const supabaseServiceKey = 'eyJhbG...xyz'; // Different!
```

---

## 💡 Preventing This in the Future

### Keep Project Active:

Supabase pauses projects after **7 days of inactivity**. To prevent this:

1. **Upgrade to Pro plan** ($25/month) - No pausing
2. **Visit your app regularly** (at least once a week)
3. **Set up monitoring** to ping your app daily

### Or Accept It:

The free tier pausing is normal. Just restore the project when needed!

---

## 📞 Need More Help?

1. **Check Supabase Status:**
   - https://status.supabase.com

2. **Supabase Support:**
   - https://supabase.com/support

3. **SmartLenderUp Logs:**
   - Open browser DevTools (F12)
   - Check Console tab
   - Look for red errors
   - Take a screenshot

---

## 🎉 Expected Result After Fix

Once you restore the project:

✅ **Bank accounts save to Supabase**
✅ **Expenses save to Supabase**
✅ **Repayments save to Supabase**
✅ **All data persists after refresh**
✅ **No more "Database not reachable" errors**

The most common fix is simply **clicking "Restore Project"** in the Supabase dashboard! 🚀
