# 🧹 How to Clear Demo Data from SmartLenderUp

> **⚠️ IMPORTANT:** All demo data has been removed from the source code files. However, if you previously loaded the application, **the old data is still cached in your browser's localStorage**. You MUST clear it using the instructions below.

---

## ⚡ FASTEST Method: Clear Data from Browser Console

This is the **EASIEST** and **FASTEST** way to clear all cached data:

1. **Open the application** in your browser
2. **Open the browser console**:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Option+J` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Option+K` (Mac)
   - **Safari**: Press `Cmd+Option+C` (Mac)

3. **Type this command** in the console and press Enter:
   ```javascript
   clearAppData()
   ```
   
   You should see:
   ```
   ✅ All application data cleared from localStorage
   📋 Cleared 20 storage keys
   🔄 Please refresh the page (F5 or Ctrl+R) to start with a clean state
   🔄 Auto-refreshing page...
   ```

4. **The page will automatically refresh** after 2 seconds

✨ **Done!** The application will now start with a completely clean slate - no demo clients, loans, or any other data.

---

## 🔧 Alternative Method: Manual localStorage Clear (If clearAppData() doesn't work)

If the quick method above doesn't work for some reason:

## Alternative Method: Manual localStorage Clear

If the above method doesn't work, you can manually clear the localStorage:

1. Open browser DevTools (`F12`)
2. Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Find **Local Storage** in the left sidebar
4. Click on your site's domain
5. Click **Clear All** or delete individual keys that start with `bvfunguo_`
6. Refresh the page

## Alternative Method: Clear Browser Data

You can also clear all site data for the application:

**Chrome/Edge:**
1. Click the lock icon (🔒) or info icon (ℹ️) in the address bar
2. Click "Site settings"
3. Click "Clear data"
4. Refresh the page

**Firefox:**
1. Click the lock icon (🔒) in the address bar
2. Click "Clear cookies and site data"
3. Refresh the page

## What Was Cleared

The following demo data has been removed from the codebase:

### Core Data
- ✅ 10 demo clients
- ✅ 3 loan products
- ✅ 12 loans
- ✅ 9 payments
- ✅ 10 savings accounts

### Management Data
- ✅ 5 SMS campaigns
- ✅ 12 tasks
- ✅ 8 support tickets
- ✅ Staff performance records

### Extended Features
- ✅ Collaterals
- ✅ Guarantors
- ✅ Loan documents
- ✅ Loan approvals
- ✅ SMS reminders
- ✅ Collection activities
- ✅ KYC records
- ✅ Compliance reports
- ✅ Expenses
- ✅ Payees

### Seed Data
- ✅ Seed clients
- ✅ Seed loan products
- ✅ Seed shareholders (cleared)
- ✅ Seed payees (cleared)

## What Remains

The following configuration data remains (as it's essential for the system to function):

- ✅ Loan officers (Victor Muthama)
- ✅ Branches (Nairobi)
- ✅ Commission structure
- ✅ All TypeScript interfaces and type definitions
- ✅ Helper functions and utilities
- ✅ 4 Shareholders (company ownership structure)
- ✅ 7 Payees (utility providers and employees for expense management)

## Next Steps

After clearing the demo data, you can:

1. **Connect to Supabase** to use your production database
2. **Import real data** using the bulk upload features
3. **Manually add** clients, loans, and other data through the UI
4. **Use the API endpoints** to programmatically populate data

## Troubleshooting

**Q: I still see data after clearing localStorage**
- Make sure you cleared ALL keys that start with `bvfunguo_`
- Try using the browser's "Clear all site data" option
- Try opening the site in an incognito/private window

**Q: The dashboard shows zero data but I want some sample data for testing**
- You can manually add a few clients and loans through the UI
- Use the "New Client" and "New Loan" buttons in the respective tabs

**Q: Can I restore the demo data?**
- Yes, you can restore it from the git history if needed
- Alternatively, manually create sample data through the UI

---

**Need help?** Check the other documentation files:
- `START_HERE.md` - Platform overview
- `BACKEND_COMPLETE.md` - Backend integration guide
- `DEPLOYMENT_COMPLETE_GUIDE.md` - Deployment instructions