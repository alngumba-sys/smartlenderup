# 🔧 Troubleshooting Database Errors

## Issue: "Database not reachable" Error on Live Site

If you're seeing the error **"Database not reachable. Check your internet connection."** on your live deployment, but your internet is working fine, this is likely **NOT** a network issue. Here's how to diagnose and fix it:

---

## 🔍 Step 1: Check Browser Console

1. Open your browser's Developer Tools (Press F12 or Cmd+Option+I on Mac)
2. Go to the **Console** tab
3. Refresh the page
4. Look for error messages starting with ❌

### What to Look For:

The improved error logging will now show you the ACTUAL error:

- **"Table or schema issue. Please run database migrations."**
  - Means: Your Supabase tables don't exist or are missing columns
  - Fix: See **Step 2** below

- **"Authentication error. User may not be properly authenticated."**
  - Means: RLS (Row Level Security) is enabled but user isn't authenticated
  - Fix: See **Step 3** below

- **"Permission denied. Check RLS policies."**
  - Means: RLS policies are blocking access to data
  - Fix: See **Step 4** below

- **Actual "Failed to fetch" or "NetworkError"**
  - Means: Real network connectivity issue
  - Fix: Check internet connection, firewall, or Supabase status

---

## 🛠️ Step 2: Fix Missing Tables (Schema Issue)

If you see: `⚠️ Table or schema issue. Please run database migrations.`

### Solution:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: Click on "BV Funguo" or your project name
3. **Open SQL Editor**: Click "SQL Editor" in the left sidebar
4. **Run the setup script**:
   - Open the file `/supabase/COMPLETE_DATABASE_SETUP.sql` in your code editor
   - Copy the ENTIRE contents
   - Paste into Supabase SQL Editor
   - Click **"Run"** or press Ctrl+Enter
5. **Refresh your app**: The error should be gone

---

## 🔐 Step 3: Fix Authentication Error (JWT/Auth Issue)

If you see: `⚠️ Authentication error. User may not be properly authenticated.`

This means your app is using auto-login with a default user, but Supabase RLS (Row Level Security) is enabled and expecting a real authenticated user.

### Solution Option A: Disable RLS (Quick Fix for Testing)

**⚠️ Warning: Only use this for development/testing, NOT for production!**

1. Go to Supabase Dashboard → Authentication → Policies
2. For each table (clients, loans, etc.):
   - Click on the table name
   - Click "Disable RLS" 
3. Refresh your app

### Solution Option B: Create RLS Policies (Recommended for Production)

1. Go to Supabase Dashboard → Authentication → Policies
2. For each table, create a policy:

```sql
-- Example: Allow all authenticated users to read all data
CREATE POLICY "Allow authenticated users to read"
ON clients
FOR SELECT
TO authenticated
USING (true);

-- Example: Allow all authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to modify"
ON clients
FOR ALL
TO authenticated
USING (true);
```

3. Repeat for all tables: `clients`, `loans`, `loan_products`, `repayments`, `bank_accounts`, `expenses`, etc.

### Solution Option C: Use Supabase Service Role Key (Bypass RLS)

**⚠️ Warning: Service role key bypasses ALL security. Only use server-side!**

If you need to bypass RLS for admin operations:

1. Go to Supabase Dashboard → Settings → API
2. Copy your **service_role** key (NOT the anon key)
3. Update `/lib/supabase.ts`:

```typescript
// ONLY USE THIS IF YOU UNDERSTAND THE SECURITY IMPLICATIONS
const supabaseUrl = 'https://yrsnylrcgejnrxphjvtf.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // ⚠️ NEVER commit this!

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

---

## 🔒 Step 4: Fix Permission Denied (RLS Policy Issue)

If you see: `⚠️ Permission denied. Check RLS policies.`

This means RLS is enabled AND you have policies, but they're blocking access.

### Solution:

1. Check your RLS policies in Supabase Dashboard → Authentication → Policies
2. Make sure your policies allow the operations you need:
   - **SELECT**: For reading data
   - **INSERT**: For creating new records
   - **UPDATE**: For modifying existing records
   - **DELETE**: For removing records

3. Common policy patterns:

```sql
-- Allow all authenticated users (organization-scoped)
CREATE POLICY "Allow authenticated users in same org"
ON clients
FOR ALL
TO authenticated
USING (organization_id = auth.jwt() ->> 'organization_id');

-- Allow public read access (no auth required)
CREATE POLICY "Allow public read"
ON clients
FOR SELECT
TO anon
USING (true);
```

---

## 🧪 Step 5: Test the Fix

After applying any of the fixes above:

1. **Clear browser cache**: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
2. **Hard refresh**: Ctrl+Shift+R (Cmd+Shift+R on Mac)
3. **Check console**: You should see ✅ green success messages instead of ❌ errors
4. **Verify data loads**: The dashboard should populate with your data

---

## 📊 Understanding the Error Codes

| Error Code | Meaning | Common Fix |
|------------|---------|------------|
| `42P01` | Table doesn't exist | Run database migrations |
| `PGRST301` | JWT/Auth error | Fix authentication or disable RLS |
| `42501` | Permission denied | Update RLS policies |
| `ECONNREFUSED` | Network error | Check internet/firewall |
| `Failed to fetch` | Network error | Check Supabase status |

---

## 🆘 Still Having Issues?

### Check Supabase Status
1. Go to: https://status.supabase.com/
2. Make sure all systems are operational

### Verify Supabase URL and Key
1. Open `/lib/supabase.ts`
2. Verify your URL: `https://yrsnylrcgejnrxphjvtf.supabase.co`
3. Verify your anon key is correct
4. Make sure there are no typos or extra spaces

### Check Network Tab
1. Open browser DevTools → Network tab
2. Refresh page
3. Look for failed requests to `supabase.co`
4. Check the response - it will tell you exactly what went wrong

### Debug Console Commands
Open browser console and run:

```javascript
// Check authentication state
window.debugAuthState()

// Check what's in localStorage
console.log('User:', JSON.parse(localStorage.getItem('bvfunguo_user')))
console.log('Org:', JSON.parse(localStorage.getItem('current_organization')))
```

---

## ✅ Prevention: Set Up Properly from the Start

To avoid these issues in the future:

1. **Always run database migrations first** before deploying
2. **Set up RLS policies** during initial setup
3. **Test with real authentication** instead of auto-login
4. **Monitor Supabase logs** for errors
5. **Use environment variables** for sensitive keys

---

## 📝 Quick Reference

**Most Common Issue**: RLS is enabled but no policies exist
**Quick Fix**: Disable RLS for testing OR create permissive policies
**Production Fix**: Set up proper organization-scoped RLS policies

**For Development**: Disable RLS
**For Production**: Enable RLS with proper policies
