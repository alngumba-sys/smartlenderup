# ⚠️ IMPORTANT: Service Role Key Issue

## Problem Detected

The **Service Role Key** you provided is actually the **Anon Key** (they're identical). This means RLS (Row Level Security) is still active and may cause errors when saving data.

---

## What's the Difference?

### Anon Key (Public Key)
- ✅ Safe to expose in frontend code
- ✅ Used in production
- ❌ Subject to RLS policies
- Role: `anon` (read-only by default)

### Service Role Key (Admin Key)
- ❌ **NEVER** expose publicly
- ❌ Only use in development/backend
- ✅ Bypasses ALL RLS policies
- Role: `service_role` (full access)

---

## How to Get the CORRECT Service Role Key

### Step 1: Go to Supabase Dashboard
Open this link:
```
https://supabase.com/dashboard/project/yrsnylrcgejnrxphjvtf/settings/api
```

### Step 2: Find "Project API keys" Section
Scroll down until you see a table with these rows:
- `anon` `public`
- `service_role` `secret` ← **THIS ONE!**

### Step 3: Reveal and Copy
1. Find the row labeled **`service_role`** with a 🔐 lock icon
2. Click the **👁️ eye icon** to reveal the key
3. Click the **Copy** button
4. The key should be DIFFERENT from your anon key

### Step 4: Paste in Code
1. Open `/lib/supabase.ts` in Figma Make
2. Find line 11: `const supabaseServiceKey = 'PASTE_YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE';`
3. Replace `PASTE_YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE` with your actual service role key
4. Save the file

---

## Verification

After pasting the correct service role key, you should see this in the console:

✅ **CORRECT:**
```
✅ Using Supabase SERVICE ROLE key
🔓 RLS is BYPASSED for development
💾 Saving entire project state to Supabase...
✅ Project state saved successfully to Supabase
```

❌ **INCORRECT (if same as anon key):**
```
⚠️ Using anon key - you may encounter RLS errors
❌ RLS Error: new row violates row-level security policy
```

---

## Security Warning

🚨 **NEVER COMMIT SERVICE ROLE KEY TO GITHUB!**

Before pushing to GitHub:
1. Replace the service role key with a placeholder
2. Use environment variables in production
3. Only use service role key locally for development

### For Production (Vercel/Netlify):
Use ONLY the anon key:
```bash
VITE_SUPABASE_URL=https://yrsnylrcgejnrxphjvtf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255bHJjZ2VqbnJ4cGhqdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTAxNDIsImV4cCI6MjA4MjU4NjE0Mn0.RCcfK0ObcSCnwqW_bD7c4M7DSN_SCTPT6QK7LXi4R9o
```

**DO NOT** set `VITE_SUPABASE_SERVICE_KEY` in production!

---

## Alternative: Use Anon Key + Proper RLS Policies

If you don't want to use the service role key, you can:

1. Use only the anon key (current setup)
2. Update RLS policies in Supabase to allow your operations
3. This is the **recommended approach for production**

### Example RLS Policy for Project States:
```sql
-- Allow users to insert their own project states
CREATE POLICY "Users can insert their own data"
ON project_states FOR INSERT
WITH CHECK (true);  -- Or add your own logic

-- Allow users to update their own project states
CREATE POLICY "Users can update their own data"
ON project_states FOR UPDATE
USING (true);  -- Or add your own logic
```

---

## Summary

**Current Status:**
- ✅ Anon key is correct
- ❌ Service role key is not set (same as anon key)

**Action Required:**
1. Get the REAL service role key from Supabase Dashboard
2. Paste it in `/lib/supabase.ts` line 11
3. OR configure RLS policies to work with anon key

**For GitHub:**
- Remove service role key before pushing
- Use environment variables for sensitive keys
- Only commit anon key (public key)

---

**Questions?** Check the Supabase docs: https://supabase.com/docs/guides/api/api-keys
