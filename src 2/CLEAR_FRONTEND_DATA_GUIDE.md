# 🧹 Clear All Frontend Data - Complete Guide

## Quick Start

### Option 1: Browser Console (Recommended)
Open browser console (F12) and run:
```javascript
// Clear all data and refresh
clearAllFrontendData()

// OR clear without refreshing
clearAllFrontendDataNoRefresh()

// OR nuclear option (clears auth too)
clearEverything()
```

### Option 2: Programmatic Import
```typescript
import { clearAllFrontendData } from './utils/clearAllFrontendData';

// Clear and refresh
await clearAllFrontendData();

// Clear without refresh
clearAllFrontendDataNoRefresh();
```

---

## What Gets Cleared

### ✅ Data That Will Be Removed:

#### **Client Data**
- All clients and their information
- Client documents and photos
- Group memberships
- Credit scores and risk ratings

#### **Loan Data**
- All loans (Pending, Approved, Disbursed, etc.)
- Loan products
- Repayments and payment schedules
- Collateral and guarantor information
- Loan approvals and workflow stages
- Processing fees

#### **Financial Data**
- Savings accounts and transactions
- Shareholders and their transactions
- Bank accounts and transactions
- Expenses and payees
- Other income records
- Funding transactions

#### **Operational Data**
- Employees and payroll records
- Journal entries (double-entry bookkeeping)
- Groups and group members
- Branches
- Audit logs
- Notifications
- Approvals

#### **Settings & Preferences**
- Dashboard filter preferences
- User preferences
- Dashboard settings
- Data version flags
- Migration flags

---

### ⚠️ Data That Will Be PRESERVED:

#### **Authentication & Session**
- Supabase authentication tokens
- User login session
- Current user credentials

#### **System Settings**
- Theme preferences (if not explicitly cleared)
- Supabase connection settings

---

## Available Functions

### 1. `clearAllFrontendData()`
**Use case:** Complete data reset with auto-refresh
- ✅ Clears all application data
- ✅ Preserves authentication
- ✅ Auto-refreshes page after 3 seconds
- ✅ Shows detailed console logging

```javascript
window.clearAllFrontendData()
```

**Output:**
```
🧹 ===== CLEARING ALL FRONTEND DATA =====
📦 Step 1: Clearing all data from localStorage...
   ✓ Removed: bvfunguo_clients
   ✓ Removed: bvfunguo_loans
   ...
✅ Cleared 45 predefined keys
✅ Cleared 3 additional keys
✅ Total: 48 keys removed
✅ Cleared 2 session storage keys
✅ No relevant IndexedDB databases found

✅ ===== FRONTEND DATA CLEARED =====
📊 Summary:
   • LocalStorage: 48 keys removed
   • SessionStorage: 2 keys removed

🔄 Refreshing page in 3 seconds...
💡 Your app will now connect to Supabase with a clean slate!
```

---

### 2. `clearAllFrontendDataNoRefresh()`
**Use case:** Clear data without page refresh (programmatic)
- ✅ Clears all application data
- ✅ Preserves authentication
- ❌ No auto-refresh (you control refresh)
- ✅ Minimal console logging

```javascript
window.clearAllFrontendDataNoRefresh()
```

**Use in code:**
```typescript
import { clearAllFrontendDataNoRefresh } from './utils/clearAllFrontendData';

// Clear data
clearAllFrontendDataNoRefresh();

// Then do something else...
await loadDataFromSupabase();

// Manually refresh when ready
window.location.reload();
```

---

### 3. `clearEverything()` ⚠️
**Use case:** Nuclear reset - clears EVERYTHING including auth
- ✅ Clears all application data
- ⚠️ Clears authentication (logs you out)
- ✅ Clears all preferences
- ✅ Clears cookies
- ✅ Redirects to login page
- ⚠️ Requires user confirmation

```javascript
window.clearEverything()
```

**Shows confirmation dialog:**
```
🚨 NUCLEAR RESET 🚨

This will clear EVERYTHING including:
• All application data
• Your login session
• All preferences

You will need to log in again.

Are you absolutely sure?
```

---

## Step-by-Step Scenarios

### Scenario 1: Fresh Start With Supabase
**Goal:** Clear all local data and start fresh with Supabase data

**Steps:**
1. Open browser console (F12)
2. Run: `clearAllFrontendData()`
3. Wait 3 seconds for auto-refresh
4. App loads data from Supabase automatically

---

### Scenario 2: Testing Data Sync
**Goal:** Clear local data to test Supabase sync

**Steps:**
1. Open console
2. Run: `clearAllFrontendDataNoRefresh()`
3. Manually test your sync logic
4. Refresh when ready: `location.reload()`

---

### Scenario 3: Complete System Reset
**Goal:** Start completely fresh (including login)

**Steps:**
1. Open console
2. Run: `clearEverything()`
3. Confirm the dialog
4. System redirects to login page
5. Log in again with your credentials

---

### Scenario 4: Database Migration
**Goal:** Clear old data structure before migration

**Steps:**
1. Backup any important data first
2. Run: `clearAllFrontendData()`
3. Run your Supabase SQL reset script
4. App will load new structure from Supabase

---

## Integration with Supabase

After clearing frontend data, your app should:

1. **Auto-load from Supabase** - DataContext should fetch data from Supabase on mount
2. **Sync new records** - Any new records created are saved to Supabase
3. **No local data conflicts** - Fresh start eliminates sync conflicts

### Typical Flow:
```
User logs in
  ↓
clearAllFrontendData() (optional)
  ↓
Page refreshes
  ↓
DataContext initializes
  ↓
Loads data from Supabase via loadFromSupabase()
  ↓
User sees their Supabase data
```

---

## Console Logging Guide

### What You'll See:

#### **During Clearing:**
```
🧹 ===== CLEARING ALL FRONTEND DATA =====
📦 Step 1: Clearing all data from localStorage...
   ✓ Removed: bvfunguo_clients
   ✓ Removed: bvfunguo_loans
   ✓ Removed: bvfunguo_loan_products
   ...
📦 Step 2: Scanning for remaining keys...
   ✓ Removed additional: bvfunguo_custom_key
✅ Cleared 45 predefined keys
✅ Cleared 3 additional keys
✅ Total: 48 keys removed
```

#### **Session Storage:**
```
📦 Step 3: Clearing sessionStorage...
   ✓ Removed from session: bvfunguo_temp_data
✅ Cleared 2 session storage keys
```

#### **IndexedDB Check:**
```
📦 Step 4: Checking IndexedDB...
✅ No relevant IndexedDB databases found

OR

⚠️  Found IndexedDB databases (cannot auto-delete):
   - bvfunguo_backup_db
💡 Manually delete these in DevTools > Application > IndexedDB
```

#### **Summary:**
```
✅ ===== FRONTEND DATA CLEARED =====
📊 Summary:
   • LocalStorage: 48 keys removed
   • SessionStorage: 2 keys removed

📌 What was cleared:
   ✓ All client data
   ✓ All loan data
   ✓ All loan products
   ...
   
⚠️  NOT CLEARED (preserved):
   • Supabase authentication tokens
   • User login session
   • Theme preferences
```

---

## Troubleshooting

### Issue: Data Still Appears After Clearing

**Possible Causes:**
1. **IndexedDB not cleared** - Check DevTools > Application > IndexedDB
2. **Service Worker cache** - Clear service workers in DevTools
3. **Browser cache** - Clear browser cache completely
4. **Supabase sync** - Data re-synced from Supabase after refresh

**Solutions:**
```javascript
// Try nuclear option
clearEverything()

// Or clear browser completely
// Chrome: Ctrl+Shift+Delete > Clear all data
// Firefox: Ctrl+Shift+Delete > Everything
```

---

### Issue: Lost Login Session

**Cause:** Used `clearEverything()` which clears auth

**Solution:**
- Log in again with your credentials
- Next time, use `clearAllFrontendData()` to preserve auth

---

### Issue: Page Won't Refresh

**Cause:** Auto-refresh blocked by browser

**Solution:**
```javascript
// Manual refresh
window.location.reload()

// Or force refresh (bypasses cache)
window.location.reload(true)
```

---

## Best Practices

### ✅ DO:
- Run `clearAllFrontendData()` when switching between local and Supabase data
- Use `clearAllFrontendDataNoRefresh()` in automated scripts
- Backup important data before clearing
- Test in development first

### ❌ DON'T:
- Use `clearEverything()` unless you want to log out
- Clear data without understanding what will be removed
- Run clearing functions in production without warning users
- Forget to refresh after clearing (if not using auto-refresh)

---

## Production Deployment

### For Production:
Consider adding a UI button for admins:

```typescript
import { clearAllFrontendData } from './utils/clearAllFrontendData';

function AdminPanel() {
  const handleClearData = async () => {
    const confirmed = window.confirm(
      'Clear all local data?\\n\\nThis will refresh the page and reload from Supabase.'
    );
    
    if (confirmed) {
      await clearAllFrontendData();
    }
  };

  return (
    <button onClick={handleClearData}>
      🧹 Clear Local Data
    </button>
  );
}
```

---

## Summary

| Function | Clears Data | Clears Auth | Auto Refresh | Use Case |
|----------|-------------|-------------|--------------|----------|
| `clearAllFrontendData()` | ✅ | ❌ | ✅ | Normal reset |
| `clearAllFrontendDataNoRefresh()` | ✅ | ❌ | ❌ | Programmatic |
| `clearEverything()` | ✅ | ✅ | ✅ | Nuclear option |

---

## Need Help?

Run these diagnostic commands in console:

```javascript
// Check what data exists
Object.keys(localStorage)
  .filter(k => k.includes('bvfunguo') || k.includes('bv_funguo'))
  .forEach(k => console.log(k, localStorage.getItem(k)?.length + ' chars'))

// Check storage usage
console.log('Storage used:', 
  Object.keys(localStorage)
    .map(k => localStorage.getItem(k)?.length || 0)
    .reduce((a, b) => a + b, 0) / 1024 + ' KB'
)

// List all available clear functions
console.log(Object.keys(window).filter(k => k.includes('clear')))
```

---

**Questions?** Check the console output for detailed logs!

**Last Updated:** December 2025
