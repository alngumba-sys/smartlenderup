# 🔑 GET YOUR SERVICE ROLE KEY (2 Minutes)

## Step-by-Step Instructions

### 1️⃣ Go to Supabase Dashboard
- Open: https://supabase.com/dashboard
- Click on your project: **mqunjutuftoueoxuyznn**

### 2️⃣ Navigate to API Settings
- Click **Settings** (left sidebar, bottom)
- Click **API**

### 3️⃣ Find Service Role Key
- Scroll down to **Project API keys**
- You'll see two keys:
  - `anon` `public` - This is what you're using now (doesn't work with RLS)
  - **`service_role`** `secret` - This is what you need! ⭐

### 4️⃣ Copy the Service Role Key
- Click the **eye icon** to reveal the `service_role` key
- Click **Copy** button
- The key looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long!)

### 5️⃣ Create .env File
In your project folder (same place as `package.json`), create a file named `.env`:

**Windows:** Right-click → New → Text Document → Name it `.env` (delete the .txt)
**Mac:** Use TextEdit or Terminal: `touch .env`

### 6️⃣ Add This Line to .env
```env
VITE_SUPABASE_SERVICE_KEY=paste_your_copied_service_role_key_here
```

**Example:**
```env
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xdW5qdXR1ZnRvdWVveHV5em5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE1ODU5MCwiZXhwIjoyMDQ4NzM0NTkwfQ.abcdefghijklmnop
```

### 7️⃣ Save the File
- Save `.env` in your project root
- File structure should be:
  ```
  your-project/
  ├── .env          ← NEW FILE HERE
  ├── package.json
  ├── src/
  └── ...
  ```

### 8️⃣ Restart Dev Server
**Stop your dev server:**
- Press `Ctrl+C` in terminal

**Start it again:**
```bash
npm run dev
```

### 9️⃣ Verify It's Working
Open browser console and look for:
```
⚠️ Using Supabase SERVICE ROLE key - RLS is BYPASSED
⚠️ This should ONLY be used for development/testing
```

If you see this, the service key is loaded! ✅

### 🔟 Test Data Saving
- Refresh your app
- Make any change (add client, etc.)
- Console should show:
  ```
  💾 Saving entire project state to Supabase...
  ✅ Project state saved successfully to Supabase
  ```

---

## ✅ Done!

Your app now saves to Supabase using the service role key, bypassing all RLS restrictions.

---

## ⚠️ Important Notes

- **Keep the service key SECRET** - Don't share it or commit it to Git
- The `.env` file should be in your `.gitignore` (it already is)
- This is perfect for **development and testing**
- For production, you'd use proper user authentication instead

---

## 🆘 Troubleshooting

**Can't find .env file after creating it?**
- Make sure file extensions are visible in Windows Explorer
- File should be named `.env` NOT `.env.txt`

**Server won't restart?**
- Close all terminal windows
- Open fresh terminal
- Run `npm run dev`

**Still getting errors?**
- Double-check the key was copied completely (it's very long!)
- Make sure there are no extra spaces in the `.env` file
- Make sure the line starts with `VITE_SUPABASE_SERVICE_KEY=`
