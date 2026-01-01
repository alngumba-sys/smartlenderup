# 🚀 QUICK REFERENCE - Clear Frontend Data

## Open Console (F12) and Run:

### 🧹 Clear All Data & Refresh (Most Common)
```javascript
clearAllFrontendData()
```
✅ Clears all data  
✅ Keeps you logged in  
✅ Auto-refreshes in 3 seconds  

---

### 🔧 Clear Without Refresh (For Testing)
```javascript
clearAllFrontendDataNoRefresh()
```
✅ Clears all data  
✅ Keeps you logged in  
❌ No auto-refresh  

---

### ☢️ Nuclear Reset (Logs You Out)
```javascript
clearEverything()
```
⚠️ Clears EVERYTHING  
⚠️ Logs you out  
⚠️ Requires confirmation  

---

## What Gets Cleared?

### ✅ CLEARED:
- All clients, loans, products
- All savings, shareholders
- All expenses, bank accounts
- All employees, payroll
- All journal entries
- All groups, approvals
- All dashboard filters
- All notifications

### ⚠️ PRESERVED:
- Your login session
- Supabase auth
- Theme settings

---

## Common Use Cases

| When to Use | Command |
|-------------|---------|
| Fresh start with Supabase | `clearAllFrontendData()` |
| Testing sync logic | `clearAllFrontendDataNoRefresh()` |
| Complete system reset | `clearEverything()` |
| Before data migration | `clearAllFrontendData()` |

---

## After Clearing

Your app will automatically:
1. Refresh the page (if using `clearAllFrontendData()`)
2. Load data from Supabase
3. Start with a clean slate

---

## Need More Help?

Read the full guide: `/CLEAR_FRONTEND_DATA_GUIDE.md`

---

## Other Useful Commands

```javascript
// Check storage usage
checkStorage()

// Clean up backups
cleanupBackups()

// Debug organizations
debugOrgs()

// Manual database cleanup
cleanupDatabase()

// Populate sample data (for testing)
populateSampleData()
```

---

**Pro Tip:** Always backup important data before clearing!
