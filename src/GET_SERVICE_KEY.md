# 🔑 How to Get Your Supabase Service Role Key

## Quick Steps (1 Minute)

### 1. Open Supabase Dashboard
Go to: **https://supabase.com/dashboard**

### 2. Select Your Project
Click on your **SmartLenderUp** project

### 3. Go to Settings
- Look at the **left sidebar**
- Click the **⚙️ Settings** icon (gear icon at the bottom)

### 4. Click API
- You'll see several tabs at the top
- Click **"API"**

### 5. Find Project API Keys
- Scroll down to the section called **"Project API keys"**
- You'll see 2-3 keys listed:
  - `anon` or `public` key
  - **`service_role`** key ← This is what you need!
  - `JWT Secret` (ignore this)

### 6. Copy the Service Role Key
- Find the row that says **"service_role"**
- Look for the key value (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`)
- Click the **📋 Copy** button next to it
- The key is now in your clipboard

### 7. Create .env File
In your project root (same level as `package.json`), create a file named `.env`:

```env
VITE_SUPABASE_SERVICE_KEY=paste_your_key_here
```

**Paste** the key you just copied after the `=` sign.

### 8. Make Sure .env is Gitignored
Open `.gitignore` and make sure it contains:
```
.env
.env.local
```

If `.gitignore` doesn't exist, create it with those lines.

### 9. Restart Dev Server
Stop your dev server (Ctrl+C) and start it again:
```bash
npm run dev
```

### 10. Test Your App
Open your app and check the console - you should see:
```
⚠️ Using Supabase SERVICE ROLE key - RLS is BYPASSED
✅ Project state saved successfully
```

---

## Visual Reference

### Where to Find It:

```
Supabase Dashboard
└── Settings (⚙️ gear icon)
    └── API tab
        └── Project API keys section
            ├── anon key (public key)
            └── service_role key ← COPY THIS ONE
```

### What the Key Looks Like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xdW5qdXR1ZnRvdWVveHV5em5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE3MzU5MCwiZXhwIjoyMDgxNzQ5NTkwfQ.LONG_STRING_OF_RANDOM_CHARACTERS
```

It's a **very long string** (300+ characters) that has 3 parts separated by dots (`.`).

---

## Complete .env File Example

Your `.env` file should look like this:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://mqunjutuftoueoxuyznn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xdW5qdXR1ZnRvdWVveHV5em5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNzM1OTAsImV4cCI6MjA4MTc0OTU5MH0.Ux56lyGBlfJMLu61B1Gs6Gz9z50GulPAWWzqcpWMlGg

# ⚠️ TEMPORARY RLS BYPASS - Only for development!
# Get this from: Supabase Dashboard → Settings → API → service_role key
VITE_SUPABASE_SERVICE_KEY=your_actual_service_role_key_here
```

**Replace** `your_actual_service_role_key_here` with the key you copied.

---

## ⚠️ Important Notes

### DO:
- ✅ Use for local development only
- ✅ Keep .env in .gitignore
- ✅ Copy the **service_role** key (not anon key)
- ✅ Restart dev server after adding

### DON'T:
- ❌ Commit .env to Git
- ❌ Share your service key publicly
- ❌ Use in production
- ❌ Copy the wrong key (anon vs service_role)

---

## Troubleshooting

### Can't Find Settings Icon
- It's at the **bottom** of the left sidebar
- Has a ⚙️ gear icon
- Might say "Project Settings"

### Can't See Service Role Key
- Make sure you're in the **API** tab (not Database or Auth)
- Scroll down to **"Project API keys"**
- The key might be hidden - click **"Reveal"** or **"Show"** button

### Key Doesn't Work
**Check these:**
1. Did you copy the **service_role** key (not anon key)?
2. Did you add `VITE_` prefix in .env?
3. Is the variable name exactly `VITE_SUPABASE_SERVICE_KEY`?
4. Did you restart dev server?
5. Is .env in the project root (not in src/)?

### Still Getting RLS Error
1. Check browser console for the warning message
2. If no warning, the key isn't loaded
3. Try `.env.local` instead of `.env`
4. Make sure there are no spaces around the `=` sign

---

## File Structure Check

Your project should look like this:

```
your-project/
├── .env                    ← Create this file here
├── .gitignore             ← Make sure .env is listed here
├── package.json
├── vite.config.ts
├── src/
│   ├── lib/
│   │   └── supabase.ts    ← This reads the .env file
│   └── ...
└── ...
```

---

## Quick Copy-Paste Template

**Create `.env` file with this content:**

```env
VITE_SUPABASE_SERVICE_KEY=
```

Then:
1. Go to Supabase → Settings → API
2. Copy service_role key
3. Paste after the `=` sign
4. Save file
5. Restart dev server

Done! ✅

---

## What Happens After

Once you add the service key:

### In Console:
```
⚠️ Using Supabase SERVICE ROLE key - RLS is BYPASSED
⚠️ This should ONLY be used for development/testing
⚠️ NEVER deploy to production with service role key in client code
💾 Saving entire project state to Supabase...
✅ Project state saved successfully
📦 State size: 12.34 KB
```

### In Your App:
- ✅ No more RLS errors
- ✅ Data saves automatically
- ✅ Everything works normally

---

## Next Steps

After getting it working:

1. ✅ Continue developing your app
2. ⚠️ Fix RLS policies properly (see `/COPY_PASTE_FIX.sql`)
3. ⚠️ Remove service key before production
4. ✅ Test with anon key once RLS is fixed

---

## Need More Help?

If you're stuck:

1. Take a screenshot of your Supabase API settings page
2. Check your .env file (hide the actual key value)
3. Check browser console for any messages
4. Make sure you're in the correct Supabase project

**The key is definitely there - you just need to find it!** 🔍
