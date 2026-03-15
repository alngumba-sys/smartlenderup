# 🚨 HOW TO FIX THE SCHEMA CACHE ERROR

## You're seeing this error:
```
"Could not find the 'duration_months' column of 'loans' in the schema cache"
```

## What this means:
- ✅ Your code is correct
- ✅ The columns exist in your database (you added them)
- ❌ **PostgREST (Supabase API) hasn't refreshed its cache yet**

---

## 🎯 SOLUTION (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Copy the Fix Script
1. Open the file `/EMERGENCY_FIX_SCHEMA.sql` in this project
2. **Copy the ENTIRE contents** (Ctrl+A, Ctrl+C)

### Step 3: Paste and Run
1. Paste into the SQL Editor
2. Click **"RUN"** button (bottom right)
3. Wait for it to complete (you'll see green checkmarks)

### Step 4: Wait for Cache Refresh
- ⏱️ **Set a timer for 90 seconds**
- Don't skip this! The cache needs time to refresh

### Step 5: Refresh Browser
- Hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)

### Step 6: Try Again
- Create a loan
- ✅ It will work now!

---

## 🔄 Alternative Method (If above doesn't work)

### Manual Cache Refresh:
1. Go to **Supabase Dashboard**
2. Click **Settings** (gear icon)
3. Click **API**
4. Scroll down to **"Schema Cache"** section
5. Click **"Reload schema cache"**
6. Wait 90 seconds
7. Try creating a loan

---

## ✅ How to Verify It Worked

After running the fix, you should see in the SQL Editor output:
```
✅ Added duration_months column (or "already exists")
✅ Added monthly_installment column (or "already exists")
✅ Added outstanding_balance column (or "already exists")
... etc
```

Then at the bottom, you should see a list of all 10+ columns.

---

## 🆘 Still Not Working?

1. **Check the Messages tab** in SQL Editor - look for any red error messages
2. **Wait longer** - sometimes it takes 2-3 minutes for the cache to refresh
3. **Try a different browser** - clear cache or use incognito mode
4. **Restart PostgREST** - Dashboard → Settings → API → "Restart PostgREST" (if available)

---

## 📊 What the Script Does

1. ✅ Checks if each column exists
2. ✅ Adds missing columns (safe - won't break existing ones)
3. ✅ Grants permissions to all user roles
4. ✅ Forces PostgREST to reload its schema cache
5. ✅ Verifies all columns are present

---

## 🎓 Why This Happened

When you ran `ADD_MISSING_COLUMNS.sql` before:
- ✅ Database got the columns
- ❌ PostgREST didn't refresh automatically
- ❌ PostgREST still thinks the old schema is correct

The `NOTIFY pgrst, 'reload schema';` command forces PostgREST to check the database again.

---

## ⚡ Quick Reference

**Too long? Just do this:**
1. Copy `/EMERGENCY_FIX_SCHEMA.sql`
2. Paste in Supabase SQL Editor
3. Click RUN
4. Wait 90 seconds
5. Refresh browser
6. Create loan = ✅ SUCCESS!

